import React from 'react';
import { WebView, Image, View, Platform, Linking } from 'react-native';
import { observable } from 'mobx';
import Text from '../controls/custom-text';
import { t, tu, tx } from '../utils/translator';
import TextInputStateful from '../controls/text-input-stateful';
import popupState from '../layout/popup-state';
import locales from '../../lib/locales';
import CheckBox from './checkbox';
import { vars } from '../../styles/styles';
import { User, config, telemetry } from '../../lib/icebear';
import testLabel from '../helpers/test-label';
import FilePreview from '../files/file-preview';
import TwoFactorAuthPrompt from '../settings/two-factor-auth-prompt';
import tm from '../../telemetry';

const { S } = telemetry;

function textControl(str, style) {
    const text = {
        color: '#000000AA',
        marginVertical: vars.spacing.small.maxi,
        lineHeight: 22
    };

    let formatted = str;
    if (typeof str === 'string') {
        formatted = str.replace('\n', '\n\n');
    }
    if (style) Object.assign(text, style);

    return (
        <Text {...testLabel('textControl')} style={text}>
            {formatted}
        </Text>
    );
}

function inputControl(state, placeholder, props) {
    return <TextInputStateful placeholder={placeholder} state={state} {...props} />;
}

function previewAndInputControl(state) {
    return <FilePreview state={state} />;
}

const swActions = {};

/**
 * Hook action to a system warning action type
 * @param {string} type
 * @param {func} action
 */
function addSystemWarningAction(type, action) {
    swActions[type] = action;
}

function popupSystemWarning(title, contents, buttons) {
    const button = (text, action) => ({ id: 'ok', text, action });
    const swButton = i => ({ id: i.action, text: t(i.label), action: swActions[i.action] });
    return new Promise(resolve => {
        popupState.showPopup({
            title,
            type: 'systemWarning',
            contents: textControl(contents),
            buttons: buttons
                ? buttons.map(i => (i.action ? swButton(i) : button(i, resolve)))
                : [button(tu('button_ok'), resolve)]
        });
    });
}

function popupYes(title, subTitle, text) {
    return new Promise(resolve => {
        popupState.showPopup({
            title,
            subTitle: subTitle ? textControl(subTitle) : null,
            contents: text ? textControl(text) : null,
            buttons: [
                {
                    id: 'ok',
                    text: tu('button_ok'),
                    action: resolve
                }
            ]
        });
    });
}

function popupAbout() {
    const showPoweredBy = process.env.EXECUTABLE_NAME === 'medcryptor';
    const image = require('../../assets/poweredByPeerio_colour.png');
    const text = (
        <Text>
            Version: {config.appVersion}
            {'\n'}
            SDK: {config.sdkVersion} {'\n'}
            OS: {Platform.OS} {'\n'}
            OS Version: {Platform.Version}
        </Text>
    );
    const contents = (
        <View>
            {textControl(text)}
            {showPoweredBy && (
                <Image
                    source={image}
                    resizeMode="contain"
                    style={{ marginTop: 10, width: '60%' }}
                />
            )}
        </View>
    );
    return new Promise(resolve => {
        popupState.showPopup({
            title: 'About',
            contents,
            buttons: [
                {
                    id: 'ok',
                    text: tu('button_ok'),
                    action: resolve
                }
            ]
        });
    });
}

function popupUpgrade(title, subTitle, text) {
    // TODO: add upgrade button
    return popupYes(title, subTitle, text);
}

function popupYesCancel(title, subTitle, text) {
    return new Promise(resolve => {
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: text ? textControl(text) : null,
            buttons: [
                { id: 'no', text: t('button_no'), action: () => resolve(false), secondary: true },
                { id: 'yes', text: t('button_yes'), action: () => resolve(true) }
            ]
        });
    });
}

function popupOkCancel(title, subTitle, text) {
    return new Promise(resolve => {
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: text ? textControl(text) : null,
            buttons: [
                {
                    id: 'cancel',
                    text: tu('button_cancel'),
                    action: () => resolve(false),
                    secondary: true
                },
                { id: 'ok', text: tu('button_ok'), action: () => resolve(true) }
            ]
        });
    });
}

function popupConfirmCancelIllustration(contents, confirmCopy, cancelCopy) {
    return new Promise(resolve => {
        popupState.showPopup({
            noPadding: true,
            contents,
            buttons: [
                {
                    id: tx(cancelCopy),
                    text: tu(cancelCopy),
                    action: () => resolve(false),
                    secondary: true
                },
                { id: tx(confirmCopy), text: tu(confirmCopy), action: () => resolve(true) }
            ]
        });
    });
}

function popupYesSkip(title, subTitle, text) {
    return new Promise(resolve => {
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: textControl(text),
            buttons: [
                { id: 'no', text: t('button_skip'), action: () => resolve(false), secondary: true },
                { id: 'yes', text: t('button_yes'), action: () => resolve(true) }
            ]
        });
    });
}

function popupSignOutAutologin() {
    return new Promise(resolve => {
        const o = observable({ value: '', checked: false });
        const contents = (
            <View style={{ minHeight: vars.popupMinHeight }}>
                {textControl(t('title_signOutConfirmKeys'))}
                {User.current.trustedDevice && (
                    <CheckBox
                        text={t('title_stopTrustingThisDevice')}
                        state={o}
                        property="checked"
                    />
                )}
            </View>
        );
        popupState.showPopup({
            title: t('title_gotYourKeys'),
            contents,
            buttons: [
                { id: 'no', text: tu('button_getKey'), action: () => resolve(false) },
                { id: 'yes', text: tu('button_logout'), action: () => resolve(o), secondary: true }
            ]
        });
    });
}

function popupCopyCancel(title, subTitle, text) {
    return popupState.showPopupPromise(resolve => ({
        title,
        subTitle: textControl(subTitle),
        contents: textControl(text),
        buttons: [
            {
                id: 'cancel',
                text: tu('button_close'),
                action: () => resolve(false),
                secondary: true
            },
            { id: 'copy', text: tu('title_copy'), action: () => resolve(true) }
        ]
    }));
}

function popupCancelConfirm(title, subTitle, text) {
    return popupState.showPopupPromise(resolve => ({
        title,
        subTitle: textControl(subTitle),
        contents: textControl(text),
        buttons: [
            {
                id: 'cancel',
                text: tu('button_cancel'),
                secondary: true,
                action: () => resolve(false)
            },
            { id: 'confirm', text: tu('button_confirm'), action: () => resolve(true) }
        ]
    }));
}

function popupInput(title, subTitle, value, textInputProps) {
    return new Promise(resolve => {
        const o = observable({ value });
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: inputControl(o, null, textInputProps),
            buttons: [
                {
                    id: 'ok',
                    text: tu('button_ok'),
                    action: () => resolve(o.value)
                }
            ]
        });
    });
}

function popupInputWithPreview(title, fileProps) {
    return new Promise(resolve => {
        const o = observable({ value: fileProps });
        popupState.showPopup({
            title,
            contents: previewAndInputControl(o.value),
            buttons: [
                {
                    id: 'cancel',
                    text: tu('button_cancel'),
                    secondary: true,
                    action: () => resolve({ shouldUpload: false, newName: '' })
                },
                {
                    id: 'ok',
                    text: tu('button_ok'),
                    action: () => {
                        resolve({ shouldUpload: true, newName: o.value.name });
                    }
                }
            ]
        });
    });
}

function popupInputCancel(title, placeholder, cancelable) {
    return new Promise(resolve => {
        const o = observable({ value: '' });
        const buttons = [];
        cancelable &&
            buttons.push({
                id: 'cancel',
                text: tu('button_cancel'),
                action: () => resolve(false),
                secondary: true
            });
        buttons.push({
            id: 'ok',
            text: tu('button_ok'),
            action: () => resolve(o),
            get disabled() {
                return !o.value;
            }
        });
        const contents = (
            <View>{inputControl(o, placeholder, { autoCapitalize: 'sentences' })}</View>
        );
        popupState.showPopup({
            title,
            contents,
            buttons
        });
    });
}

function popupContactPermission(title, subTitle, text) {
    return new Promise(resolve => {
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: text ? textControl(text) : null,
            buttons: [
                {
                    id: 'deny',
                    text: tu('button_deny'),
                    action: () => resolve(false),
                    secondary: true
                },
                { id: 'ok', text: tu('button_grantAccess'), action: () => resolve(true) }
            ]
        });
    });
}

let tos = '';

function popupTOS() {
    console.log(`popups.js: popup tos`);
    return new Promise(resolve => {
        const startTime = Date.now();
        popupState.showPopup({
            fullScreen: 1,
            contents: <WebView source={{ html: tos }} />,
            buttons: [
                {
                    id: 'ok',
                    text: tu('button_ok'),
                    action: () => {
                        resolve();
                        tm.signup.durationItem({ startTime, item: S.TERMS_OF_USE });
                    }
                }
            ]
        });
    });
}

let privacy = '';

function popupPrivacy() {
    console.log(`popups.js: popup privacy`);
    return new Promise(resolve => {
        const startTime = Date.now();
        popupState.showPopup({
            fullScreen: 1,
            contents: <WebView source={{ html: privacy }} />,
            buttons: [
                {
                    id: 'ok',
                    text: tu('button_ok'),
                    action: () => {
                        resolve();
                        tm.signup.durationItem({ startTime, item: S.PRIVACY_POLICY });
                    }
                }
            ]
        });
    });
}

function popupKeychainError(title, subTitle, text) {
    return new Promise(resolve => {
        popupState.showPopup({
            title,
            type: 'systemWarning',
            subTitle: textControl(subTitle),
            contents: text ? textControl(text) : null,
            buttons: [
                { id: 'no', text: t('button_no'), action: () => resolve(false), secondary: true },
                { id: 'yes', text: t('button_yes'), action: () => resolve(true) }
            ]
        });
    });
}

function popup2FA(title, placeholder, text, checked, cancelable, checkboxHidden) {
    return new Promise(resolve => {
        const state = observable({
            value: '',
            checked
        });
        const buttons = [];
        cancelable &&
            buttons.push({
                id: 'cancel',
                text: tu('button_cancel'),
                action: () => resolve(false),
                secondary: true
            });
        buttons.push({
            id: 'ok',
            text: tu('button_submit'),
            action: () => resolve(state),
            get disabled() {
                return !state.value;
            }
        });
        const checkbox = checkboxHidden ? null : (
            <CheckBox
                {...{ text, state }}
                alignLeft
                property="checked"
                accessibilityLabel="trustDevice"
            />
        );
        const onSubmitEditing = () => {
            resolve(state);
            popupState.discardPopup();
        };
        const contents = (
            <TwoFactorAuthPrompt
                {...{ placeholder, checked, title, state, checkbox, onSubmitEditing }}
            />
        );
        popupState.showPopup({
            noPadding: true,
            contents,
            buttons
        });
    });
}

function popupDeleteAccount() {
    const checked = false;
    return popupState.showPopupPromise(resolve => ({
        title: textControl(tx('title_accountDelete')),
        contents: (
            <View>
                {textControl(tx('title_accountDeleteDescription1'))}
                {textControl(tx('title_accountDeleteDescription2'))}
                {textControl(tx('title_accountDeleteDescription3'))}
            </View>
        ),
        buttons: [
            {
                id: 'cancel',
                text: tu('button_cancel'),
                action: () => resolve(false),
                secondary: true
            },
            { id: 'copy', text: tu('button_confirm'), action: () => resolve(true, checked) }
        ]
    }));
}

function popupControl(contents, button) {
    console.log(`popups.js: popup control`);
    return new Promise(resolve => {
        popupState.showPopup({
            contents,
            buttons: [
                {
                    id: 'ok',
                    text: tu(button || 'button_ok'),
                    action: resolve
                }
            ]
        });
    });
}

function popupSetupVideo() {
    const dialog = {
        titleText: tx('title_videoCall'),
        subText: tx('dialog_videoCall')
    };
    return new Promise(resolve => {
        popupState.showPopup({
            title: textControl(dialog.titleText),
            subTitle: textControl(dialog.subText),
            buttons: [
                {
                    id: 'cancel',
                    text: tu('button_cancel'),
                    action: () => resolve(false),
                    secondary: true
                },
                { id: 'ok', text: tu('button_startVideoCall'), action: () => resolve(true) }
            ]
        });
    });
}

function popupFileRename(title, subTitle, value, textInputProps) {
    return new Promise(resolve => {
        const o = observable({ value });
        popupState.showPopup({
            title,
            subTitle: textControl(subTitle),
            contents: inputControl(o, null, textInputProps),
            buttons: [
                {
                    id: 'cancel',
                    text: tu('button_cancel'),
                    action: () => resolve(false),
                    secondary: true
                },
                {
                    id: 'update',
                    text: tu('button_update'),
                    action: () => resolve(o.value),
                    get disabled() {
                        return value === o.value;
                    }
                }
            ]
        });
    });
}

function popupFolderDelete(isShared, isOwner) {
    let text = 'dialog_deleteFolderText';
    if (isShared) {
        text = isOwner ? 'dialog_deleteSharedFolderText' : 'dialog_deleteSharedFolderNonOwnerText';
    }
    return popupState.showPopupPromise(resolve => ({
        title: textControl(tx('title_deleteFolder_mobile')),
        contents: textControl(tx(text)),
        type: 'systemWarning',
        buttons: [
            {
                id: 'cancel',
                text: tu('button_cancel'),
                secondary: true,
                action: () => resolve(false)
            },
            { id: 'confirm', text: tu('button_delete'), action: () => resolve(true) }
        ]
    }));
}

function popupMoveToSharedFolder() {
    return new Promise(resolve => {
        const o = observable({ value: '', checked: false });
        popupState.showPopup({
            title: textControl(tx('title_moveToSharedFolder')),
            contents: (
                <View>
                    {textControl(tx('title_moveToSharedFolderDescription'))}
                    <CheckBox
                        text={tx('title_dontShowMessageAgain')}
                        state={o}
                        property="checked"
                        alignedLeft
                    />
                </View>
            ),
            buttons: [
                {
                    id: 'cancel',
                    text: tu('button_cancel'),
                    action: () => resolve(false),
                    secondary: true
                },
                { id: 'move', text: tu('button_move'), action: () => resolve(o) }
            ]
        });
    });
}

function popupPeerioClosureSettings() {
    const contents = (
        <View
            style={{
                backgroundColor: vars.white,
                flexGrow: 1
            }}>
            <Text>
                The Peerio service will be shut down on July 15th, 2019. You will be able to use
                Peerio as usual until then, but we recommend you begin transitioning your files and
                important information out of Peerio&nbsp;
                <Text
                    style={{ color: vars.linkColor, textDecorationLine: 'underline' }}
                    onPress={() =>
                        Linking.openURL('https://support.peerio.com/hc/en-us/articles/360021688052')
                    }>
                    (learn how to export your files)
                </Text>
            </Text>
            <Text
                style={{
                    color: vars.black54,
                    fontSize: vars.font.size14,
                    paddingTop: 6
                }}>
                If you have a paid plan with service that extends beyond July 15th, you’ll be
                receiving a separate email in the next few weeks with information about a refund.
            </Text>
            <Text
                style={{
                    color: vars.black54,
                    fontSize: vars.font.size14,
                    paddingTop: 6
                }}>
                Thank you for your trust and support.&nbsp;
                <Text
                    style={{ color: vars.linkColor, textDecorationLine: 'underline' }}
                    onPress={() =>
                        Linking.openURL(
                            'https://peerio.com/blog/posts/peerio-has-been-acquired-by-workjam-the-leading-digital-workplace-platform/'
                        )
                    }>
                    Learn More
                </Text>
            </Text>
        </View>
    );

    return new Promise(resolve => {
        popupState.showPopup({
            title: 'Peerio will be closing on July 15th, 2019',
            type: 'systemWarning',
            contents,
            buttons: [
                {
                    id: 'ok',
                    text: tu('button_ok'),
                    action: resolve
                }
            ]
        });
    });
}

function popupPeerioClosureSignup() {
    return new Promise(resolve => {
        popupState.showPopup({
            title: 'The Peerio service will be closing on July 15th, 2019',
            subTitle: textControl('Do you want to continue?'),
            type: 'systemWarning',
            buttons: [
                {
                    id: 'cancel',
                    text: tu('button_cancel'),
                    action: () => resolve(false),
                    secondary: true
                },
                { id: 'ok', text: tu('button_continue'), action: () => resolve(true) }
            ]
        });
    });
}

locales.loadAssetFile('terms.txt').then(s => {
    tos = s;
});

locales.loadAssetFile('privacy.txt').then(s => {
    privacy = s;
});

export {
    textControl,
    addSystemWarningAction,
    popupYes,
    popupYesCancel,
    popupOkCancel,
    popupConfirmCancelIllustration,
    popupYesSkip,
    popupInput,
    popupInputWithPreview,
    popupContactPermission,
    popupTOS,
    popupPrivacy,
    popupKeychainError,
    popup2FA,
    popupCopyCancel,
    popupInputCancel,
    popupUpgrade,
    popupSystemWarning,
    popupDeleteAccount,
    popupControl,
    popupSignOutAutologin,
    popupCancelConfirm,
    popupSetupVideo,
    popupFileRename,
    popupFolderDelete,
    popupMoveToSharedFolder,
    popupAbout,
    popupPeerioClosureSettings,
    popupPeerioClosureSignup
};
