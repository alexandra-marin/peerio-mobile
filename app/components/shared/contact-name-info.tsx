import React from 'react';
import { View, ViewStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';
import Text from '../controls/custom-text';
import { tx } from '../utils/translator';

const containerStyle: ViewStyle = {
    justifyContent: 'center'
};

const titleStyle = {
    fontSize: vars.font.size14,
    color: vars.textBlack87
};

const subtitleStyle = {
    fontSize: vars.font.size12,
    color: vars.textBlack38
};

interface ContactNameInfoProps {
    contact: any;
}

@observer
export default class ContactNameInfo extends SafeComponent<ContactNameInfoProps> {
    renderThrow() {
        const { contact } = this.props;
        const title = contact.fullName || contact.email;
        const subTitle = contact.username || tx('title_invited');
        return (
            <View style={containerStyle}>
                <Text style={titleStyle} numberOfLines={1} ellipsizeMode="tail">
                    {title}
                </Text>
                <Text style={subtitleStyle} numberOfLines={1} ellipsizeMode="tail" italic>
                    {subTitle}
                </Text>
            </View>
        );
    }
}
