import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Text, TouchableOpacity } from 'react-native';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import chatState from './chat-state';

@observer
export default class ChannelListItem extends SafeComponent {
    onPress = () => {
        const { chat, onPress } = this.props;
        if (onPress) return onPress(chat);
        return chatState.routerMain.chats(chat);
    };

    renderThrow() {
        if (chatState.collapseChannels) return null;
        const { chat } = this.props;
        const { name, unreadCount, headLoaded } = chat;
        if (!headLoaded) return null;
        if (!chat) return null;
        const containerStyle = {
            height: vars.chatListItemHeight,
            paddingHorizontal: vars.spacing.medium.midi,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: vars.white,
            flexDirection: 'row'
        };

        const textStyle = {
            fontSize: vars.font.size.bigger,
            color: vars.subtleText
        };

        const textUnreadStyle = {
            fontWeight: vars.font.weight.semiBold,
            color: vars.unreadTextColor
        };

        const circleStyle = {
            width: vars.spacing.large.mini2x,
            paddingVertical: 1,
            borderRadius: 14,
            backgroundColor: vars.peerioTeal,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center'
        };

        const textCircleStyle = {
            fontSize: vars.font.size.normal,
            fontWeight: vars.font.weight.semiBold,
            color: vars.unreadTextColor
        };

        return (
            <View style={{ backgroundColor: vars.chatItemPressedBackground }}>
                <TouchableOpacity
                    onPress={this.onPress}
                    style={containerStyle}
                    pressRetentionOffset={vars.pressRetentionOffset}>
                    <Text style={[textStyle, (unreadCount > 0 && textUnreadStyle)]}>
                        {`# ${name}`}
                    </Text>
                    {unreadCount > 0 && <View style={circleStyle}><Text style={textCircleStyle}>{unreadCount}</Text></View>}
                </TouchableOpacity>
            </View>
        );
    }
}

ChannelListItem.propTypes = {
    chat: PropTypes.any.isRequired
};
