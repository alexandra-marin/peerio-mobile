//
//  RNKeychain.m
//
//  Created by Samvel Avanesov on 05/01/2017.
//  Copyright © 2017 Technologies Peerio Inc. All rights reserved.
//
#include <sys/types.h>
#include <sys/sysctl.h>
#include <React/RCTLog.h>
#import "RNKeychain.h"

#import <Foundation/Foundation.h>
@import LocalAuthentication;

@implementation RNKeychain

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(isFeatureAvailable,
    isFeatureAvailableResolver: (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        LAContext *context = [[LAContext alloc] init];
        NSNumber *result =
          [NSNumber numberWithBool:[context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics error:nil]];
        resolve(result);
    });
}

- (BOOL) isPasscodeSetHelper
{
  LAContext *context = [[LAContext alloc] init];
  return [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthentication error:nil];
}

RCT_REMAP_METHOD(isPasscodeSet,
    isPasscodeSetResolver: (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSNumber *result =
          [NSNumber numberWithBool:[self isPasscodeSetHelper]];
        resolve(result);
    });
}

RCT_REMAP_METHOD(saveValue,
    saveValue:(NSString*)value
    toKey:(NSString*)key
    forceTouchID:(nonnull NSNumber *)forceTouchID
    resolver: (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    CFErrorRef error = NULL;
    BOOL bForceTouchID = [forceTouchID boolValue];
    CFStringRef sacFlag = [self isPasscodeSetHelper] ? kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly : kSecAttrAccessibleWhenUnlocked;
    // Should be the secret invalidated when passcode is removed? If not then use kSecAttrAccessibleWhenUnlocked
    SecAccessControlRef sacObject = SecAccessControlCreateWithFlags(kCFAllocatorDefault,
                                                sacFlag,
                                                bForceTouchID ? kSecAccessControlTouchIDAny : 0, &error);
    if (sacObject == NULL || error != NULL) {
        NSString *errorString = [NSString stringWithFormat:@"SecItemAdd can't create sacObject: %@", error];
        reject(@"touchid_keychain_save_error", errorString, error != nil ? (__bridge NSError *)error : nil);
        return;
    }

    /*
        We want the operation to fail if there is an item which needs authentication so we will use
        `kSecUseNoAuthenticationUI`.
    */
    NSData *secretPasswordTextData = [value dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *attributes = @{
        (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
        (__bridge id)kSecAttrService: key,
        (__bridge id)kSecValueData: secretPasswordTextData,
        (__bridge id)kSecUseNoAuthenticationUI: @YES,
        (__bridge id)kSecAttrAccessControl: (__bridge_transfer id)sacObject
    };

    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        OSStatus status = SecItemAdd((__bridge CFDictionaryRef)attributes, nil);
        NSString *message = [NSString stringWithFormat:@"SecItemAdd status: %@", [self keychainErrorToString:status]];
        if (status == errSecSuccess) {
            resolve(@"ok");
        } else {
            reject(@"touchid_keychain_save_error", message, nil);
        }
    });
}

RCT_REMAP_METHOD(getValue,
    getValue:(NSString*)key
    resolver: (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    NSDictionary *query = @{
        (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
        (__bridge id)kSecAttrService: key,
        (__bridge id)kSecReturnData: @YES,
    };

    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        CFTypeRef dataTypeRef = NULL;
        NSString *message;
        OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)(query), &dataTypeRef);
        if (status == errSecSuccess) {
            NSData *resultData = (__bridge_transfer NSData *)dataTypeRef;
            NSString *result = [[NSString alloc] initWithData:resultData encoding:NSUTF8StringEncoding];
            resolve(result);
        } else {
            message = [NSString stringWithFormat:@"SecItemCopyMatching status: %@", [self keychainErrorToString:status]];
            reject(@"touchid_keychain_get_error", message, nil);
        }
    });
}

RCT_REMAP_METHOD(deleteValue,
    deleteValue:(NSString*)key
    resolver: (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    NSDictionary *query = @{
        (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
        (__bridge id)kSecAttrService: key
    };

    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);
        NSString *errorString = [self keychainErrorToString:status];
        NSString *message = [NSString stringWithFormat:@"SecItemDelete status: %@", errorString];

        if (status == errSecSuccess) {
            resolve(message);
        } else {
            reject(@"touchid_keychain_delete_error", message, nil);
        }
    });

}

- (NSString *)keychainErrorToString:(OSStatus)error {
    NSString *message = [NSString stringWithFormat:@"%ld", (long)error];

    switch (error) {
        case errSecSuccess:
            message = @"success";
            break;

        case errSecDuplicateItem:
            message = @"error item already exists";
            break;

        case errSecItemNotFound :
            message = @"error item not found";
            break;

        case errSecAuthFailed:
            message = @"error item authentication failed";
            break;

        default:
            break;
    }

    return message;
}

@end
