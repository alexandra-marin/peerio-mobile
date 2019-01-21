import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Linking, Alert, NativeModules } from 'react-native';
import stringify from 'json-stringify-safe';
import moment from 'moment';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import BasicSettingsItem from './basic-settings-item';
import ToggleItem from './toggle-item';
import { User, clientApp, config } from '../../lib/icebear';
import { mainState, settingsState } from '../states';
import { tx } from '../utils/translator';
import PaymentsQuotas from '../payments/payments-quotas';
import ProfileEdit from './profile-edit';
import AccountEdit from './account-edit';
import keychain from '../../lib/keychain-bridge';
import chatState from '../messaging/chat-state';
import whiteLabelComponents from '../../components/whitelabel/white-label-components';
import BlueButtonText from '../buttons/blue-text-button';

const bgStyle = {
    flexGrow: 1,
    flex: 1,
    paddingVertical: vars.listViewPaddingVertical / 2,
    paddingHorizontal: vars.listViewPaddingHorizontal,
    backgroundColor: vars.darkBlueBackground05
};

const spacer = {
    height: 24
};

const PEERIO_SUPPORT_USERNAME = 'support';

// uses react-native-mail module
const { RNMail } = NativeModules;

const mapFormat = ({ time, msg, color }, k) => ({
    msg: msg && (typeof msg === 'string' ? msg : stringify(msg)),
    time: moment(time).format(`HH:mm:ss.SSS`),
    k,
    key: `${time}:${k}`,
    color
});

const mapGlue = ({ msg, time }) => `${time}: ${msg}`;

const sendLogs = () => {
    const subject = `Support // logs from ${User.current ? User.current.username : 'n/a'}`;
    const recipients = config.logRecipients;
    if (console.logVersion) console.logVersion();
    console.log('attempting to send email');
    const body = `<pre>${console.stack
        .map(mapFormat)
        .map(mapGlue)
        .join('\n')}</pre>`;
    RNMail.mail(
        { subject, recipients, body, isHTML: true },
        error => error && Alert.alert(`Error sending logs`, error)
    );
};

const startChatWithSupport = async () => {
    chatState.addContactAndStartChat(PEERIO_SUPPORT_USERNAME);
    settingsState.stack.clear();
};

function helpCenterAction() {
    Linking.openURL('https://support.peerio.com/hc/en-us');
}

@observer
export default class SettingsLevel2 extends SafeComponent {
    testTwoFactorAuthPrompt(cancelable) {
        clientApp.create2FARequest(
            cancelable ? 'backupCodes' : 'login',
            (result, trust) => console.log(`settings-level-2.js: ${result}, ${trust}`),
            () => console.log(`settings-level-2.js: cancelled 2fa`)
        );
    }

    security = () => {
        return (
            <View style={bgStyle}>
                <BasicSettingsItem
                    title="title_2FA"
                    onPress={() => settingsState.transition('twoFactorAuth')}
                />
                {__DEV__ && (
                    <BasicSettingsItem
                        title="2FA prompt"
                        onPress={() => this.testTwoFactorAuthPrompt(false)}
                    />
                )}
                {__DEV__ && (
                    <BasicSettingsItem
                        title="2FA prompt cancellable"
                        onPress={() => this.testTwoFactorAuthPrompt(true)}
                    />
                )}
                <BasicSettingsItem
                    title="title_showAccountKey"
                    icon="visibility"
                    onPress={() => settingsState.showPassphrase()}
                />
                {this.touchIdToggle()}
            </View>
        );
    };

    help() {
        return (
            <View style={bgStyle}>
                <whiteLabelComponents.SettingsHelpButton
                    onPress={helpCenterAction}
                    title="title_helpCenter">
                    <BlueButtonText text="button_visit" onPress={helpCenterAction} />
                </whiteLabelComponents.SettingsHelpButton>
                <whiteLabelComponents.SettingsHelpButton
                    title="title_contactPeerioSupport"
                    onPress={startChatWithSupport}>
                    <BlueButtonText
                        text="button_chat"
                        onPress={startChatWithSupport}
                        accessibilityId="button_chat"
                    />
                </whiteLabelComponents.SettingsHelpButton>
                <BasicSettingsItem title="title_sendLogsToSupport" onPress={sendLogs}>
                    <BlueButtonText text="button_send" onPress={sendLogs} />
                </BasicSettingsItem>
            </View>
        );
    }

    quotas = () => <PaymentsQuotas />;

    profile = () => <ProfileEdit />;

    account = () => <AccountEdit />;

    autoLoginToggle() {
        const user = User.current;
        const state = user;
        const prop = 'autologinEnabled';
        const title = 'title_autologinSetting';
        const onPress = () => {
            user.autologinEnabled = !user.autologinEnabled;
            mainState.saveUser();
        };
        return <ToggleItem {...{ prop, title, state, onPress }} />;
    }

    touchIdToggle() {
        if (!keychain.available) return null;
        const user = User.current;
        const state = user;
        const prop = 'secureWithTouchID';
        const title = 'dialog_enableTouchID';
        const onPress = () => {
            mainState.saveUserTouchID(!user.secureWithTouchID);
        };
        return <ToggleItem {...{ prop, title, state, onPress }} />;
    }

    preferences = () => {
        /* const text = {
            color: vars.txtMedium,
            marginBottom: vars.spacing.small.midi2x,
            marginLeft: vars.spacing.small.midi2x
        }; */

        return (
            <View style={bgStyle}>
                <BasicSettingsItem
                    title={tx('title_notifications')}
                    onPress={() => settingsState.transition('notifications')}
                />
                <BasicSettingsItem
                    title={tx('title_displayPreferences')}
                    onPress={() => settingsState.transition('display')}
                />
                {/* <Text style={text}>{t('title_soundsDetail')}</Text> */}
                {/* <ToggleItem title="title_notificationsEmailMessage" /> */}
                <View style={spacer} />
            </View>
        );
    };

    renderThrow() {
        const view = this[settingsState.subroute];
        return view ? view() : null;
    }
}
