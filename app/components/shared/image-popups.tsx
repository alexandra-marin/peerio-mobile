import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Dimensions, Image } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';
import { popupConfirmCancelIllustration } from './popups';
import { tx } from '../utils/translator';

const { width } = Dimensions.get('window');
const imageWidth = Math.ceil(width - 2 * vars.popupHorizontalMargin);

const leaveRoomIllustration = require('../../assets/chat/leave-room-confirmation-mobile.png');
const deleteRoomIllustration = require('../../assets/chat/delete-room.png');
const emailInvitesIllustration = require('../../assets/email-invite-confirmation.png');

const titleStyle = {
    fontSize: vars.font.size18,
    marginBottom: vars.spacing.small.midi2x,
    color: vars.txtDark
};

const descriptionStyle = {
    color: vars.subtleText
};

const contentStyle = {
    padding: vars.popupPadding,
    paddingTop: vars.spacing.medium.maxi
};

const warningStyle = {
    width: imageWidth,
    height: 8,
    backgroundColor: vars.red
};

@observer
class ImagePopups extends SafeComponent {
    style(illustration) {
        const asset = Image.resolveAssetSource(illustration);
        const aspectRatio = asset.width / asset.height;
        const imageHeight = Math.ceil(imageWidth / aspectRatio);

        return {
            borderTopLeftRadius: 4,
            width: imageWidth,
            height: imageHeight
        };
    }

    async roomActionConfirmation(title, description, illustration, confirmLabel, warning?) {
        const content = (
            <View>
                {warning && <View style={warningStyle} />}
                <Image
                    style={this.style(illustration)}
                    source={illustration}
                    resizeMode="contain"
                />
                <View style={contentStyle}>
                    <Text bold style={titleStyle}>
                        {tx(title)}
                    </Text>
                    <Text style={descriptionStyle}>{tx(description)}</Text>
                </View>
            </View>
        );
        return popupConfirmCancelIllustration(content, confirmLabel, 'button_cancel');
    }

    async confirmDelete() {
        return this.roomActionConfirmation(
            'button_deleteChannel',
            'title_confirmChannelDelete',
            deleteRoomIllustration,
            'button_deleteChannel',
            true
        );
    }

    async confirmLeave() {
        return this.roomActionConfirmation(
            'title_confirmChannelLeave',
            'title_confirmChannelLeaveDescription',
            leaveRoomIllustration,
            'button_leave'
        );
    }

    async confirmInvites(description) {
        return this.roomActionConfirmation(
            'title_confirmEmailInvitesHeading',
            description,
            emailInvitesIllustration,
            'button_confirm'
        );
    }
}

export default new ImagePopups({});
