import React from 'react';
import { TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';
import AvatarCircle from './avatar-circle';
import DeletedCircle from './deleted-circle';
import contactState from '../contacts/contact-state';

interface TouchableContactAvatarProps {
    contact: any;
}

@observer
export default class TouchableContactAvatar extends SafeComponent<TouchableContactAvatarProps> {
    @action.bound
    onPress() {
        const { contact } = this.props;
        contactState.contactView(contact);
    }

    renderThrow() {
        const { contact } = this.props;
        return (
            <TouchableOpacity
                style={{ alignSelf: 'flex-start' }}
                pressRetentionOffset={vars.retentionOffset}
                onPress={this.onPress}>
                <AvatarCircle contact={contact} loading={contact.loading} />
                <DeletedCircle visible={contact.isDeleted} />
            </TouchableOpacity>
        );
    }
}
