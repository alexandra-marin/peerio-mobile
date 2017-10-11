import React from 'react';
import { Text, Clipboard, LayoutAnimation } from 'react-native';
import { observable, action, reaction } from 'mobx';
import RoutedState from '../routes/routed-state';
import { User } from '../../lib/icebear';
import { popupCopyCancel } from '../shared/popups';
import snackbarState from '../snackbars/snackbar-state';
import uiState from '../layout/ui-state';
import { tx } from '../utils/translator';
import keychain from '../../lib/keychain-bridge';

class SettingsState extends RoutedState {
    @observable subroute = null;
    @observable stack = [];
    _prefix = 'settings';
    _titles = {
        security: 'title_settingsSecurity',
        profile: 'title_settingsProfile',
        account: 'title_settingsAccount',
        preferences: 'title_settingsPreferences',
        upgrade: 'button_upgrade',
        twoFactorAuth: 'title_2FA'
    };

    get title() {
        const sr = this.subroute && this._titles[this.subroute];
        return sr ? tx(sr) : tx('title_settings');
    }

    onTransition(/* active */) {
        this.routerMain.isRightMenuVisible = false;
        this.routerMain.isLeftHamburgerVisible = false;
        if (this.reaction) return;
        this.reaction = reaction(() => this.routerMain.currentIndex, (i) => {
            if (this.routerMain.route === 'settings') {
                while (i < this.stack.length) {
                    this.stack.pop();
                }
                this.subroute = i ? this.stack[i - 1] : null;
            }
        });
    }

    @action transition(subroute) {
        console.log(`settings-state.js: transition ${subroute}`);
        LayoutAnimation.easeInEaseOut();
        this.routerMain.settings();
        if (subroute) {
            this.subroute = subroute;
            this.stack.push(subroute);
            this.routerMain.currentIndex = this.stack.length;
        } else {
            this.routerMain.currentIndex = 0;
            this.stack.clear();
        }
    }

    upgrade() {
        this.routerModal.accountUpgradeSwiper();
    }

    async showPassphrase() {
        const user = User.current;
        let passphrase = user.passphrase;
        if (!passphrase && keychain.hasPlugin) {
            const data = await keychain.get(`user::${user.username}`);
            if (data) passphrase = JSON.parse(data).passphrase;
        }
        if (passphrase) {
            const mp = (
                <Text style={{ fontWeight: 'bold', fontSize: vars.font.size.normal }}>
                    {passphrase}
                </Text>
            );
            popupCopyCancel(
                tx('title_AccountKey'),
                tx('title_AKDetail'),
                mp
            ).then(r => {
                if (!r) return;
                Clipboard.setString(passphrase);
                snackbarState.pushTemporary(tx('title_copied'));
                uiState.debugText = passphrase;
            });
        }
    }
}

export default new SettingsState();
