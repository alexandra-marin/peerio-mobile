import React from 'react';
import { View, ViewStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import AvatarCircle from '../shared/avatar-circle';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import { Contact } from '../../lib/icebear';

const container: ViewStyle = {
    height: 56,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
};

const avatarContainer: ViewStyle = {
    paddingLeft: vars.spacing.medium.mini2x,
    alignSelf: 'center',
    justifyContent: 'center',
    height: 56
};

const textContainer: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: vars.spacing.medium.mini2x
};

const fullNameStyle = {
    color: vars.textBlack87
};

const contactInfoStyle = {
    color: vars.textBlack54
};

const checkboxStyle: ViewStyle = {
    padding: vars.spacing.small.mini2x,
    flex: 0,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center'
};

interface ContactImportItemProps {
    contact: Contact;
    phoneContactName?: string;
    onPress: Function;
    checked: boolean;
    hideAvatar?: boolean;
}

@observer
export default class ContactImportItem extends SafeComponent<ContactImportItemProps> {
    get avatar() {
        return (
            <View style={avatarContainer}>
                <AvatarCircle contact={this.props.contact} />
            </View>
        );
    }

    get checkbox() {
        const { checked, onPress } = this.props;
        const iconColor = checked ? vars.checkboxIconActive : vars.checkboxIconInactive;
        const iconBgColor = 'transparent';
        const icon = checked ? 'check-box' : 'check-box-outline-blank';
        return (
            <View style={checkboxStyle}>
                {icons.colored(icon, onPress, iconColor, iconBgColor)}
            </View>
        );
    }

    renderThrow() {
        const { contact, phoneContactName, hideAvatar } = this.props;
        const { username, usernameTag, fullName } = contact;
        // username(tag) is email for non Peerio users
        // fullName tells us if contact is Peerio user or not
        return (
            <View style={container}>
                {!hideAvatar && this.avatar}
                <View style={textContainer}>
                    <Text style={fullNameStyle}>{fullName || phoneContactName}</Text>
                    <Text italic style={contactInfoStyle}>
                        {fullName ? usernameTag : username}
                    </Text>
                </View>
                {this.checkbox}
            </View>
        );
    }
}
