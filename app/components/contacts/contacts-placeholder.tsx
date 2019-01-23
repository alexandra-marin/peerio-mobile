import React, { Component } from 'react';
import { observer } from 'mobx-react/native';
import { View, ViewStyle } from 'react-native';
import Text from '../controls/custom-text';
import BlueButtonText from '../buttons/blue-text-button';
import { t } from '../utils/translator';
import contactState from './contact-state';

const outer = {
    flex: 1,
    flexGrow: 1
};
const inner: ViewStyle = {
    flex: 1,
    flexGrow: 2,
    justifyContent: 'center',
    alignItems: 'center'
};

@observer
export default class ContactsPlaceholder extends Component {
    importOrInvite() {
        contactState.routerModal.discard();
        contactState.routerMain.contactAdd();
    }

    render() {
        return (
            <View style={outer}>
                <View style={inner}>
                    <Text>{t('title_importInviteText')}</Text>
                    <BlueButtonText text="button_importOrInvite" onPress={this.importOrInvite} />
                </View>
                <View style={{ flex: 1, flexGrow: 3 }} />
            </View>
        );
    }
}
