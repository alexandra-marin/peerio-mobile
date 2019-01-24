import React from 'react';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import { View, TouchableOpacity, Linking, ViewStyle } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from './safe-component';
import icons from '../helpers/icons';
import { vars } from '../../styles/styles';

const videoCallMsgStyle = {
    color: vars.black38,
    fontSize: vars.font.size14,
    lineHeight: 22,
    borderWidth: 0
};

const linkStyle = {
    color: '#2F80ED'
};

const containerStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row'
};

interface VideoCallMessageProps {
    videoCallMessage: any;
    systemMessage: any;
}

@observer
export default class VideoCallMessage extends SafeComponent<VideoCallMessageProps> {
    @action.bound
    onPress() {
        const { videoCallMessage } = this.props;
        return Linking.openURL(videoCallMessage);
    }

    renderThrow() {
        const { systemMessage, videoCallMessage } = this.props;
        const videoCallShort = videoCallMessage.replace(/(https:\/\/)/, '');
        return (
            <View>
                <View style={containerStyle}>
                    <Text style={videoCallMsgStyle}>{systemMessage}</Text>
                </View>
                <TouchableOpacity
                    onPress={this.onPress}
                    pressRetentionOffset={vars.retentionOffset}>
                    <View style={containerStyle}>
                        {icons.plaindark('videocam', vars.iconSizeSmall)}
                        <Text style={linkStyle}>{videoCallShort}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}
