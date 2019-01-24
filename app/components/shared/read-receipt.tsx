import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Image, ImageStyle } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from './safe-component';
import { contactStore } from '../../lib/icebear';
import { vars } from '../../styles/styles';

interface ReadReceiptProps {
    username: string;
    avatarSize: number;
}

@observer
export default class ReadReceipt extends SafeComponent<ReadReceiptProps> {
    renderThrow() {
        const { avatarSize } = this.props;
        const contact = contactStore.getContact(this.props.username);
        const { color, letter, mediumAvatarUrl } = contact;
        const tryColor = color || { value: null };
        const circleDiameter = avatarSize || 18;
        const circleStyle: ImageStyle = {
            width: circleDiameter,
            height: circleDiameter,
            borderRadius: circleDiameter / 2,
            margin: circleDiameter / 16,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center'
        };
        const circleOnline = {
            backgroundColor: tryColor.value || '#ccc'
        };
        const letterView = (
            <View style={[circleStyle, circleOnline]}>
                <Text style={{ fontSize: vars.avatarLetterSize, color: vars.white }}>{letter}</Text>
            </View>
        );
        const uri = mediumAvatarUrl;
        const avatarView = (
            <Image style={circleStyle} source={{ uri, cache: 'force-cache' }} key={uri} />
        );
        return mediumAvatarUrl ? avatarView : letterView;
    }
}
