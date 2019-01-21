import React from 'react';
import { observer } from 'mobx-react/native';
import { TouchableOpacity, View } from 'react-native';
import icons from '../helpers/icons';
import { vars } from '../../styles/styles';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import chatState from '../messaging/chat-state';
import testLabel from '../helpers/test-label';

const touchableContainer = {
    marginBottom: vars.spacing.small.midi2x,
    width: vars.chatUnreadIndicatorWidth + vars.unreadCircleWidth / 2,
    height: vars.chatUnreadIndicatorHeight + vars.unreadCircleHeight / 2,
    alignItems: 'center',
    justifyContent: 'flex-end'
};
const indicatorContainer = {
    borderWidth: 1,
    borderColor: vars.black12,
    borderRadius: 24,
    backgroundColor: vars.chatUnreadIndicatorBg,
    alignItems: 'center',
    justifyContent: 'center',
    width: vars.chatUnreadIndicatorWidth,
    height: vars.chatUnreadIndicatorHeight
};
const countContainer = {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 14,
    width: vars.unreadCircleWidth,
    height: vars.unreadCircleHeight,
    backgroundColor: vars.peerioTeal,
    alignItems: 'center',
    justifyContent: 'center'
};
const textStyle = { color: vars.unreadTextColor };

@observer
export default class ChatUnreadMessageIndicator extends SafeComponent {
    renderThrow() {
        const chat = chatState.store.activeChat;
        if (!chat) return null;

        return (
            <TouchableOpacity
                style={touchableContainer}
                onPress={this.props.onPress}
                pressRetentionOffset={vars.retentionOffset}
                {...testLabel('chatUnreadMessageIndicator')}>
                <View style={indicatorContainer}>
                    {icons.plain('keyboard-arrow-down', vars.iconSize, vars.peerioBlue)}
                </View>
                {chat.unreadCount ? (
                    <View style={countContainer}>
                        <Text semibold style={textStyle}>
                            {chat.unreadCount}
                        </Text>
                    </View>
                ) : null}
            </TouchableOpacity>
        );
    }
}
