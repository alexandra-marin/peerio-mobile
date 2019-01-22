import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Share } from 'react-native';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import SettingsItem from './settings-item';
import BasicSettingsItem from './basic-settings-item';
import {
    settingsState,
    snackbarState,
    mainState,
    loginState,
    contactState,
    chatState,
    drawerState
} from '../states';
import { toggleConnection } from '../main/dev-menu-items';
import { tx, tu } from '../utils/translator';
import {
    warnings,
    clientApp,
    User,
    contactStore,
    saveAccountKeyBackup,
    config
} from '../../lib/icebear';
import { popupAbout, popupInputCancel, popupPeerioClosureSettings } from '../shared/popups';
import ButtonWithIcon from '../controls/button-with-icon';
import icons from '../helpers/icons';
import AvatarCircle from '../shared/avatar-circle';
import PaymentStorageUsageItem from '../payments/payments-storage-usage-item';
import ViewWithDrawer from '../shared/view-with-drawer';
import { TopDrawerBackupAccountKey, TopDrawerNewContact } from '../shared/top-drawer-components';
import routes from '../routes/routes';
import uiState from '../layout/ui-state';
import { testConfirmEmail } from '../helpers/test-confirm-email';

const svStyle = {
    flexGrow: 1,
    flex: 1,
    backgroundColor: vars.darkBlueBackground05
};

const bgStyle = {
    padding: vars.settingsListPadding
};

@observer
export default class SettingsLevel1 extends SafeComponent {
    get spacer() {
        return <View style={{ height: 16 }} />;
    }

    leftSettingsIcon(iconName, iconColor) {
        return icons.plain(iconName, null, iconColor, null, {
            paddingLeft: vars.iconPadding
        });
    }

    leftSettingsImageIcon(iconSource) {
        return icons.imageButton(iconSource);
    }

    get avatarCircle() {
        return (
            <View style={{ marginLeft: vars.iconPadding }}>
                <AvatarCircle contact={contactStore.getContact(User.current.username)} />
            </View>
        );
    }

    testSaveAccountKey = async () => {
        const { username, firstName, lastName, passphrase } = User.current;
        const fileSavePath = config.FileStream.getTempCachePath(
            `${username}-${tx('title_appName')}.pdf`
        );
        await saveAccountKeyBackup(fileSavePath, `${firstName} ${lastName}`, username, passphrase);
        await config.FileStream.launchViewer(fileSavePath);
    };

    testSilentInvite = async () => {
        const result = await popupInputCancel('Enter email to invite', 'test@test.com', true);
        if (!result) return;
        const email = result.value;
        console.log(email);
        contactStore.inviteNoWarning(email, undefined, true);
    };

    testShare() {
        const message = 'chat and share files securely using Peerio. https://www.testurl.com';
        const title = 'peerio';
        const url = 'https://www.testurl.com';
        Share.share({ message, title, url });
    }

    testNullActiveChat() {
        chatState.routerMain.chats(chatState.store.chats[0]);
        setTimeout(() => {
            chatState.store.activeChat = null;
        }, 5000);
    }

    testGlobalDrawer = () => {
        setTimeout(() => drawerState.addDrawer(TopDrawerBackupAccountKey), 3000);
    };

    testLocalDrawer = () => {
        drawerState.addDrawer(TopDrawerNewContact, 'contacts', {
            contact: User.current
        });
    };

    resetExternalSetting = () => {
        clientApp.uiUserPrefs.externalContentConsented = false;
    };

    showProps = () => {
        console.log('User props are:', User.current.props);
    };

    showBeaconsState = () => {
        console.log('Beacons are:', User.current.beacons.toJSON());
    };

    clearBeaconsState = () => {
        User.current.beacons.clear();
        User.current.saveBeacons();
        uiState.isFirstLogin = true;
        routes.main.chats();
    };

    /**
     * Scroll helper is used to provide scrolling capability
     * to the test script. Note that it overrides ref and onScroll
     * event handlers
     */
    renderThrow() {
        return (
            <ViewWithDrawer style={svStyle}>
                <View style={bgStyle}>
                    <SettingsItem
                        title={User.current.fullName}
                        description={User.current.username}
                        rightIcon={null}
                        semibold
                        large
                        onPress={() => settingsState.transition('profile')}
                        leftComponent={this.avatarCircle}
                    />
                    {this.spacer}

                    <SettingsItem
                        title="title_settingsProfile"
                        onPress={() => settingsState.transition('profile')}
                        leftComponent={this.leftSettingsImageIcon(
                            require('../../assets/icons/public-profile-active.png')
                        )}
                    />
                    <SettingsItem
                        title="title_settingsSecurity"
                        onPress={() => settingsState.transition('security')}
                        leftComponent={this.leftSettingsIcon('security', vars.yellow)}
                    />
                    <SettingsItem
                        title="title_settingsPreferences"
                        onPress={() => settingsState.transition('preferences')}
                        leftComponent={this.leftSettingsImageIcon(
                            require('../../assets/icons/preferences-active.png')
                        )}
                    />
                    {this.spacer}

                    <SettingsItem
                        title="title_settingsAccount"
                        onPress={() => settingsState.transition('account')}
                        leftComponent={this.leftSettingsIcon(
                            'account-circle',
                            vars.accountSettingsIconColor
                        )}
                    />
                    <SettingsItem
                        title="Peerio Closure"
                        textColor={vars.red}
                        onPress={() => popupPeerioClosureSettings()}
                        leftComponent={this.leftSettingsIcon('close', vars.red)}
                    />
                    {this.spacer}

                    <SettingsItem
                        title="title_About"
                        icon={null}
                        onPress={() => popupAbout()}
                        leftComponent={this.leftSettingsIcon('info', vars.peerioTeal)}
                    />
                    <SettingsItem
                        title="title_help"
                        onPress={() => settingsState.transition('help')}
                        leftComponent={this.leftSettingsIcon('help', vars.helpSettingsIconColor)}
                    />

                    <PaymentStorageUsageItem />

                    <ButtonWithIcon
                        text={tu('button_logout')}
                        accessibilityLabel="button_logout"
                        style={{
                            backgroundColor: vars.signoutSettingsButtonBg,
                            width: '100%',
                            paddingVertical: vars.spacing.medium.mini2x,
                            borderRadius: 4
                        }}
                        bold
                        color={vars.red}
                        textStyle={{ color: vars.peerioBlue }}
                        onPress={loginState.signOut}
                        iconName="power-settings-new"
                        testID="button_signOut"
                    />
                    {this.spacer}
                    {__DEV__ && (
                        <BasicSettingsItem title="confirm email" onPress={testConfirmEmail} />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="show saved beacons"
                            onPress={this.showBeaconsState}
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="clear saved beacons"
                            onPress={this.clearBeaconsState}
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="save account key"
                            onPress={this.testSaveAccountKey}
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem title="global drawer" onPress={this.testGlobalDrawer} />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem title="contact drawer" onPress={this.testLocalDrawer} />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem title="silent invite" onPress={this.testSilentInvite} />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem title="toggle connection" onPress={toggleConnection} />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="damage TouchID"
                            onPress={() => mainState.damageUserTouchId()}
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="destroy TouchID"
                            onPress={() => mainState.destroyUserTouchId()}
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="snackbar"
                            onPress={() => snackbarState.pushTemporary('test')}
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="snackbar long"
                            onPress={() =>
                                snackbarState.pushTemporary(
                                    'test whatever you have been testing for a longer snackbar for the win whatever you have been testing for a longer snackbar for the win'
                                )
                            }
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="test Contacts"
                            onPress={() => contactState.testImport()}
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem title="test Share" onPress={() => this.testShare()} />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="test null activeChat"
                            onPress={() => this.testNullActiveChat()}
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="test warning"
                            onPress={() => warnings.addSevere('warning')}
                        />
                    )}
                    {__DEV__ && (
                        <BasicSettingsItem
                            title="reset external setting"
                            onPress={this.resetExternalSetting}
                        />
                    )}
                    {__DEV__ && <BasicSettingsItem title="log MC props" onPress={this.showProps} />}
                </View>
            </ViewWithDrawer>
        );
    }
}
