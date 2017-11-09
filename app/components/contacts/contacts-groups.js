import React, { Component } from 'react';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';
import { View, Text } from 'react-native';
import { vars } from '../../styles/styles';
import SettingsItem from '../settings/settings-item';
import icons from '../helpers/icons';
import { TinyDb } from '../../lib/icebear';
import { tx } from '../utils/translator';
// import SafeComponent from '../shared/safe-component';

const bgStyle = {
    flexGrow: 1,
    flex: 1,
    paddingVertical: vars.listViewPaddingVertical / 2,
    paddingHorizontal: vars.listViewPaddingHorizontal,
    backgroundColor: vars.settingsBg
};

const spacer = {
    height: 24
};

const text = {
    color: vars.txtMedium,
    marginBottom: vars.spacing.small.midi2x,
    marginLeft: vars.spacing.small.midi2x
};

const groupSettings = observable({
    favorites: true,
    invited: true,
    all: true
});

async function loadGroupSettings() {
    const settings = await TinyDb.user.getValue('contact-group-settings');
    if (settings) {
        try {
            Object.assign(groupSettings, JSON.parse(settings));
        } catch (e) {
            console.error(e);
        }
    }
}

async function saveGroupSettings() {
    const { favorites, invited, all } = groupSettings;
    await TinyDb.user.setValue('contact-group-settings', JSON.stringify({ favorites, invited, all }));
}

export { saveGroupSettings, loadGroupSettings, groupSettings };

@observer
export default class ContactsGroups extends Component {
    checkBoxItem(title, prop) {
        const state = groupSettings;
        const value = state[prop];
        const onPress = async () => {
            state[prop] = !state[prop];
            await saveGroupSettings();
        };
        return (
            <SettingsItem
                title={title}
                untappable icon={null}>
                {icons.dark(value ? 'check-box' : 'check-box-outline-blank', onPress)}
            </SettingsItem>
        );
    }

    render() {
        return (
            <View style={bgStyle}>
                <Text style={text}>{tx('title_contactGroups')}</Text>
                {this.checkBoxItem(tx('title_favoriteContacts'), 'favorites')}
                {this.checkBoxItem(tx('title_invitedContacts'), 'all')}
                <View style={spacer} />
                {this.checkBoxItem(tx('title_allContacts'), 'invited')}
            </View>
        );
    }
}
