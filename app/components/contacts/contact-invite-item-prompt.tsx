import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { observer } from 'mobx-react/native';
import { observable, action } from 'mobx';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import { contactStore } from '../../lib/icebear';
import { t } from '../utils/translator';
import Text from '../controls/custom-text';
import whiteLabelComponents from '../whitelabel/white-label-components';
import BlueRoundButton from '../buttons/blue-round-button';

@observer
export default class ContactInviteItemPrompt extends SafeComponent<{ email: string }> {
    @observable invited = false;

    @action.bound
    invite() {
        const { email } = this.props;
        this.invited = true;
        contactStore.invite(email);
    }

    renderThrow() {
        const { email } = this.props;
        const invited = this.invited || contactStore.invitedContacts.find(i => i.email === email);
        const title = invited ? 'title_invitedContacts' : 'button_invite';
        return (
            <View style={{ alignItems: 'center', flexGrow: 1 }}>
                <View style={{ flexDirection: 'row', marginHorizontal: vars.spacing.large.midi2x }}>
                    <Icon
                        name="help-outline"
                        size={vars.iconSize}
                        color={vars.txtDate}
                        style={{ marginRight: vars.spacing.small.midi2x }}
                    />
                    <Text style={{ color: vars.txtDate }}>
                        {t('title_inviteContactByEmail2', { email })}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', marginHorizontal: vars.spacing.large.midi2x }}>
                    <whiteLabelComponents.ContactAddWarning />
                </View>
                <View style={{ alignSelf: 'flex-end', marginTop: vars.spacing.small.maxi2x }}>
                    <BlueRoundButton text={title} onPress={this.invite} disabled={!!invited} />
                </View>
            </View>
        );
    }
}
