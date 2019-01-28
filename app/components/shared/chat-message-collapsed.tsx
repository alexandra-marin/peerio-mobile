import React from 'react';
import { observer } from 'mobx-react/native';
import { View, ViewStyle } from 'react-native';
import SafeComponent from './safe-component';
import CorruptedMessage from './corrupted-message';
import ViewReceipts from './view-receipts';
import ChatMessageBody from './chat-message-body';
import MessageSentError from './message-sent-error';
import { ChatMessageProps } from './chat-message-props';

const itemStyle = {
    marginTop: 8,
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center'
};

const itemContainerStyle = {
    flexDirection: 'row',
    marginLeft: 68,
    marginRight: 6
};

@observer
export default class ChatMessageCollapsed extends SafeComponent<ChatMessageProps> {
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

        const { files, folders } = messageObject;
        const shrinkStrategy: ViewStyle = { flexShrink: 1 };
        if (files || folders) shrinkStrategy.flexGrow = 1;

        return (
            <View style={[itemStyle, errorStyle]}>
                <CorruptedMessage visible={messageObject.signatureError} />
                <View style={[itemContainerStyle, shrinkStrategy, backgroundColor]}>
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
                <MessageSentError message={messageObject} chat={chat} />
            </View>
        );
    }
}
