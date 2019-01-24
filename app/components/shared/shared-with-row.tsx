import React from 'react';
import { observer } from 'mobx-react/native';
import { View, ViewStyle, TextStyle } from 'react-native';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';
import ReadReceipt from './read-receipt';
import { tx } from '../utils/translator';
import Text from '../controls/custom-text';

const rowContainer: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: vars.spacing.medium.mini
};
const readReceiptStyle = {
    marginLeft: -8,
    zIndex: 1
};
const numberSharedWithContainer: ViewStyle = {
    justifyContent: 'center',
    height: 20,
    backgroundColor: vars.sharedWithNumberBackground,
    borderRadius: 16,
    marginLeft: -20,
    paddingRight: 8,
    zIndex: 0
};
const numberSharedWithText: TextStyle = {
    fontSize: vars.font.size12,
    color: vars.sharedWithNumberFontColor,
    textAlign: 'right'
};

interface SharedWithRowProps {
    contacts: any;
    rooms: any;
}

@observer
export default class SharedWithRow extends SafeComponent<SharedWithRowProps> {
    renderThrow() {
        const { contacts, rooms } = this.props;
        if (!contacts.length && !rooms.length) return null;
        if (!contacts.length && rooms.length === 1) {
            return this.renderOneRoomOnly();
        } else if (contacts.length === 1 && rooms.length === 1) {
            return this.renderOneRoomAndOneContact();
        } else if (!contacts.length && rooms.length > 1) {
            return this.renderManyRoomsOnly();
        }
        return this.renderManySharedWith();
    }

    renderOneRoomAndOneContact() {
        const { contacts } = this.props;
        const contact = contacts[0];
        return (
            <View style={rowContainer}>
                <View key={contact.username} style={readReceiptStyle}>
                    <ReadReceipt
                        key={contact.username}
                        username={contact.username}
                        avatarSize={20}
                    />
                </View>
                <View style={[numberSharedWithContainer, { width: 70 }]}>
                    <Text semibold style={numberSharedWithText}>
                        {tx('title_plusRoomSharedWith')}
                    </Text>
                </View>
            </View>
        );
    }

    renderOneRoomOnly() {
        return (
            <View style={rowContainer}>
                <View style={[numberSharedWithContainer, { width: 50 }]}>
                    <Text style={numberSharedWithText}>{tx('title_roomSharedWith')}</Text>
                </View>
            </View>
        );
    }

    renderManyRoomsOnly() {
        const { rooms } = this.props;
        const roomsSharedWith = rooms.length;
        return (
            <View style={rowContainer}>
                <View style={[numberSharedWithContainer, { width: 56 }]}>
                    <Text style={numberSharedWithText}>
                        {tx('title_roomsSharedWith', { roomsSharedWith })}
                    </Text>
                </View>
            </View>
        );
    }

    renderManySharedWith() {
        const { contacts, rooms } = this.props;
        const contactSubArray = contacts.slice(0, 3);
        let chatNumberSharedWith = rooms.length || 0;
        if (contacts.length > 3) {
            chatNumberSharedWith += contacts.length - contactSubArray.length;
        }
        return (
            <View style={rowContainer}>
                {contactSubArray.map(contact => {
                    return (
                        <View key={contact.username} style={readReceiptStyle}>
                            <ReadReceipt
                                key={contact.username}
                                username={contact.username}
                                avatarSize={20}
                            />
                        </View>
                    );
                })}
                {!!chatNumberSharedWith && (
                    <View style={[numberSharedWithContainer, { width: 50 }]}>
                        <Text style={numberSharedWithText}>
                            {tx('title_numberOfChatsSharedWith', { chatNumberSharedWith })}
                        </Text>
                    </View>
                )}
            </View>
        );
    }
}
