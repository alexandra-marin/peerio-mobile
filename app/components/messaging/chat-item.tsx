import React from 'react';
import { View, ViewStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import SafeComponent from '../shared/safe-component';
import IdentityVerificationNotice from './identity-verification-notice';
import { vars } from '../../styles/styles';
import ChatMessageContainer from '../shared/chat-message-container';
import { Chat, Message } from '../../lib/peerio-icebear/models';

export interface ChatItemItemProps {
    chat: Chat;
    message: Message;
    backgroundColor: string;
    onInlineImageAction: Function;
    onLegacyFileAction: Function;
    onFileAction: Function;
    style: ViewStyle;
}

@observer
export default class ChatItem extends SafeComponent<ChatItemItemProps> {
    _ref: ChatMessageContainer;

    setRef = ref => {
        this._ref = ref;
    };

    get notice() {
        const { message } = this.props;
        const shouldDisplayIdentityNotice =
            message.systemData && message.systemData.action === 'join';

        if (!shouldDisplayIdentityNotice) return null;

        return (
            <View
                style={{
                    padding: vars.spacing.medium.mini2x,
                    paddingVertical: vars.spacing.small.midi
                }}>
                <IdentityVerificationNotice />
            </View>
        );
    }

    renderThrow() {
        const { chat, message } = this.props;
        if (!message || !message.sender || !chat) return null;

        return (
            <View style={this.props.style}>
                <ChatMessageContainer
                    chat={chat}
                    messageObject={message}
                    key={message.id}
                    onInlineImageAction={this.props.onInlineImageAction}
                    onLegacyFileAction={this.props.onLegacyFileAction}
                    onFileAction={this.props.onFileAction}
                    backgroundColor={this.props.backgroundColor}
                    ref={this.setRef}
                />
                {this.notice}
            </View>
        );
    }
}
