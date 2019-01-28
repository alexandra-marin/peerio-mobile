import React from 'react';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import { View, TouchableOpacity } from 'react-native';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';
import DateSeparator from './date-separator';
import ChatMessageCollapsed from './chat-message-collapsed';
import ChatMessageFull from './chat-message-full';
import { chatState } from '../states';
import { ChatMessageProps } from './chat-message-props';

@observer
export default class ChatMessageContainer extends SafeComponent<ChatMessageProps> {
    get errorStyle() {
        return this.props.messageObject.sendError
            ? {
                  backgroundColor: '#ff000020',
                  borderRadius: 14,
                  marginVertical: vars.spacing.small.mini,
                  marginHorizontal: vars.spacing.small.mini2x
              }
            : null;
    }

    get backgroundColor() {
        return {
            backgroundColor: this.props.backgroundColor || vars.white
        };
    }

    @action.bound
    onPressReceipt() {
        const {
            chat,
            messageObject,
            onFileAction,
            onLegacyFileAction,
            onInlineImageAction
        } = this.props;
        chatState.routerModal.messageInfo({
            chat,
            messageObject,
            onFileAction,
            onLegacyFileAction,
            onInlineImageAction
        });
    }

    get innerProps() {
        const {
            messageObject,
            chat,
            onFileAction,
            onLegacyFileAction,
            onInlineImageAction
        } = this.props;
        const { backgroundColor, errorStyle, onPressReceipt } = this;
        return {
            messageObject,
            chat,
            onFileAction,
            onLegacyFileAction,
            onInlineImageAction,
            backgroundColor,
            errorStyle,
            onPressReceipt
        };
    }

    renderThrow() {
        const { messageObject } = this.props;

        const collapsed = !!messageObject.groupWithPrevious;
        const opacity = messageObject.sending ? 0.5 : 1;
        const activeOpacity = !messageObject.signatureError && !messageObject.sendError ? 1 : 0.2;

        const inner = collapsed ? (
            <ChatMessageCollapsed {...this.innerProps} />
        ) : (
            <ChatMessageFull {...this.innerProps} />
        );

        return (
            <View style={{ backgroundColor: vars.chatItemPressedBackground }}>
                <TouchableOpacity
                    pressRetentionOffset={vars.retentionOffset}
                    activeOpacity={activeOpacity}
                    style={this.backgroundColor}>
                    <DateSeparator
                        visible={messageObject.firstOfTheDay}
                        timestamp={messageObject.timestamp}
                    />
                    <View style={{ opacity }}>{inner}</View>
                </TouchableOpacity>
            </View>
        );
    }
}
