import React from 'react';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';
import Text from '../controls/custom-text';
import { TextStyle } from 'react-native';

const fullnameTextStyle = {
    color: vars.txtDark,
    fontSize: vars.font.size14
};

const usernameTextStyle: TextStyle = {
    color: vars.txtMedium,
    fontSize: vars.font.size14,
    fontWeight: 'normal'
};

interface DmTitleProps {
    contact: any;
    unread: any;
}

@observer
export default class DmTitle extends SafeComponent<DmTitleProps> {
    renderThrow() {
        const { contact, unread } = this.props;
        return (
            <Text ellipsizeMode="tail" numberOfLines={1}>
                <Text style={fullnameTextStyle} semibold={unread}>
                    {contact.fullName}
                </Text>
                {` `}
                <Text style={usernameTextStyle} semibold={unread} italic>
                    {contact.username}
                </Text>
            </Text>
        );
    }
}
