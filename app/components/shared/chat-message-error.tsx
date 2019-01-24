import React from 'react';
import { View, ViewStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import Text from '../controls/custom-text';
import { vars } from '../../styles/styles';
import { tx } from '../utils/translator';

const notSentMessageStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: vars.spacing.small.midi2x
};

interface ChatMessageSendErrorProps {
    message?: any;
    visible: boolean;
}

@observer
export default class ChatMessageSendError extends SafeComponent<ChatMessageSendErrorProps> {
    renderThrow() {
        if (!this.props.visible) return null;

        return (
            <View style={notSentMessageStyle}>
                <Text style={{ color: vars.txtAlert }}>{tx('error_messageSendFail')}</Text>
            </View>
        );
    }
}
