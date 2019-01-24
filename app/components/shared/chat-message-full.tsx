import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Dimensions, ViewStyle } from 'react-native';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';
import CorruptedMessage from './corrupted-message';
import ChatMessageData from './chat-message-data';
import ViewReceipts from './view-receipts';
import TouchableContactAvatar from './touchable-contact-avatar';
import ChatMessageBody from './chat-message-body';
import MessageSentError from './message-sent-error';

const { width } = Dimensions.get('window');

const itemStyle = {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
};

const itemContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: vars.spacing.medium.mini2x
};

const nameMessageContainerStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: vars.spacing.medium.mini2x,
    marginRight: vars.spacing.small.midi
};

const msgStyle = {
    flexGrow: 1,
    maxWidth: width,
    flexShrink: 1,
    borderWidth: 0
};

const flexRow: ViewStyle = {
    flexDirection: 'row',
    flex: 1,
    flexGrow: 1,
    flexShrink: 1
};

interface ChatMessageFullProps {
    messageObject: any;
    chat: any;
    onFileAction: any;
    onLegacyFileAction: any;
    onInlineImageAction: any;
    backgroundColor: any;
    errorStyle: any;
    onPressReceipt;
}

@observer
export default class ChatMessageFull extends SafeComponent<ChatMessageFullProps> {
    renderThrow() {
        const {
            errorStyle,
            backgroundColor,
            messageObject,
            chat,
            onFileAction,
            onLegacyFileAction,
            onInlineImageAction,
            onPressReceipt
        } = this.props;

        return (
            <View style={[itemStyle, errorStyle, backgroundColor]}>
                <View style={msgStyle}>
                    <View style={itemContainerStyle}>
                        <TouchableContactAvatar contact={messageObject.sender} />
                        <View style={[nameMessageContainerStyle]}>
                            <ChatMessageData message={messageObject} />
                            <View style={flexRow}>
                                <ChatMessageBody
                                    messageObject={messageObject}
                                    chat={chat}
                                    onFileAction={onFileAction}
                                    onLegacyFileAction={onLegacyFileAction}
                                    onInlineImageAction={onInlineImageAction}
                                />
                                <ViewReceipts
                                    receipts={messageObject.receipts}
                                    onPressReceipt={onPressReceipt}
                                />
                            </View>
                        </View>
                    </View>
                    <MessageSentError message={messageObject} chat={chat} />
                    <CorruptedMessage visible={messageObject.signatureError} />
                </View>
            </View>
        );
    }
}
