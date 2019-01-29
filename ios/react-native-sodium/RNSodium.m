//
//  RNSodium
//  RNSodium
//
//  Created by Samvel Avanesov on 05/01/2017.
//  Copyright © 2017 Technologies Peerio Inc. All rights reserved.
//
#include <sys/types.h>
#include <sys/sysctl.h>
#include <React/RCTLog.h>
#import "RNSodium.h"

#include "libsodium-ios/include/sodium.h"

@implementation RNSodium

RCT_EXPORT_MODULE();

+ (void)initialize {
    int result = sodium_init();
    NSLog(@"RNSodium.m: sodium init %d", result);
}

RCT_REMAP_METHOD(scrypt,
    passwordB64:(NSString*)passwordB64
    saltB64:(NSString*)saltB64
    p_N: (nonnull NSNumber* )p_N
    p_r: (nonnull NSNumber* )p_r
    p_p: (nonnull NSNumber* )p_p
    p_dkLen: (nonnull NSNumber*)p_dkLen
    resolver: (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    NSData *password = [[NSData alloc] initWithBase64EncodedString:passwordB64 options:0];
    NSData *salt = [[NSData alloc] initWithBase64EncodedString:saltB64 options:0];
    unsigned long N = [p_N unsignedIntegerValue];
    unsigned int r = [p_r unsignedIntValue];
    unsigned int p = [p_p unsignedIntValue];
    unsigned int dkLen = [p_dkLen unsignedIntValue];
    NSMutableData *buffer = [NSMutableData dataWithLength:dkLen];
    int result = crypto_pwhash_scryptsalsa208sha256_ll(
      password.bytes, password.length,
      salt.bytes, salt.length,
      N, r, p,
      buffer.mutableBytes, buffer.length
    );
    if (result == 0) {
        NSString* resultB64 = [buffer base64Encoding];
        resolve(resultB64);
    } else {
        reject(@"RNSodium.m: scrypt error", nil, nil);
    }
}

RCT_REMAP_METHOD(signDetached,
    messageB64:(NSString*)messageB64
    secretKeyB64:(NSString*)secretKeyB64
    resolver: (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    NSData *message = [[NSData alloc] initWithBase64EncodedString:messageB64 options:0];
    NSData *secretKey = [[NSData alloc] initWithBase64EncodedString:secretKeyB64 options:0];
    unsigned long long signLength = 64;
    NSMutableData *buffer = [NSMutableData dataWithLength:signLength];
    @try {
      int result = crypto_sign_detached(
        buffer.mutableBytes,
        &signLength,
        message.bytes,
        message.length,
        secretKey.bytes
      );
      if (result == 0) {
          NSString* resultB64 = [buffer base64Encoding];
          resolve(resultB64);
      } else {
          reject(@"RNSodium.m: signDetached error", nil, nil);
      }
    } @catch (NSException*) {
      reject(@"RNSodium.m: signDetached exception", nil, nil);
    }
}

RCT_REMAP_METHOD(verifyDetached,
    messageB64:(NSString*)messageB64
    signatureB64:(NSString*)signatureB64
    publicKeyB64:(NSString*)publicKeyB64
    resolver: (RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
    NSData *message = [[NSData alloc] initWithBase64EncodedString:messageB64 options:0];
    NSData *signature = [[NSData alloc] initWithBase64EncodedString:signatureB64 options:0];
    NSData *publicKey = [[NSData alloc] initWithBase64EncodedString:publicKeyB64 options:0];
    int signLength = 64;
      int result = crypto_sign_verify_detached(
        signature.bytes,
        message.bytes,
        message.length,
        publicKey.bytes
      );
      if (result == 0) {
          resolve([NSNumber numberWithInt:1]);
      } else {
          reject(@"RNSodium.m: verifyDetached error", nil, nil);
      }
    } @catch (NSException*) {
        reject(@"RNSodium.m: verifyDetached exception", nil, nil);
    }
}

@end
