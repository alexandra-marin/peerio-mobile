import React from 'react';
import { View, ViewStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';
import SafeComponent from '../shared/safe-component';
import { contactStore, Contact } from '../../lib/icebear';
import ContactCard from '../shared/contact-card';
import BlueButtonText from '../buttons/blue-text-button';
import { InvitedContact } from 'peerio-icebear/src/defs/interfaces';

const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center'
};

const avatarComponentStyle = {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1
};

interface ContactInviteItemProps {
    contact: InvitedContact | Contact;
    backgroundColor?: string;
}

@observer
export default class ContactInviteItem extends SafeComponent<ContactInviteItemProps> {
    @observable invited = false;
    static fromEmail = email => {
        return observable({ fullName: email, username: '', invited: null, email, added: null });
    };

    invite() {
        const { contact } = this.props;
        this.invited = true;
        contactStore.invite((contact as InvitedContact).email);
    }

    renderThrow() {
        const { contact } = this.props;
        const invited = this.invited;
        const title = invited ? 'title_invitedContacts' : 'button_invite';
        return (
            <View style={containerStyle}>
                <View style={avatarComponentStyle}>
                    <ContactCard
                        disableTapping
                        faded={invited}
                        contact={contact}
                        invited
                        backgroundColor={this.props.backgroundColor}
                    />
                </View>
                {invited !== null && (
                    <BlueButtonText text={title} onPress={this.invite} style={{ flexShrink: 1 }} />
                )}
            </View>
        );
    }
}
