import React from 'react';
import { observer } from 'mobx-react/native';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import { tu, LocalizationStrings } from '../utils/translator';
import icons from '../helpers/icons';
import SharedWithRow from '../shared/shared-with-row';
import uiState from '../layout/ui-state';
import Text from '../controls/custom-text';
import { Volume } from '../../lib/peerio-icebear/models';

export interface SharedFolderFooterProps {
    title?: keyof LocalizationStrings;
    action?: OnPressResponder;
    icon?: string;
    showAvatars?: boolean;
    volume?: Volume;
}

@observer
export default class SharedFolderFooter extends SafeComponent<SharedFolderFooterProps> {
    renderThrow() {
        const { title, action, icon, showAvatars, volume } = this.props;

        const bottomRowStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: vars.spacing.small.mini,
            borderColor: vars.black12,
            borderTopWidth: 1,
            backgroundColor: vars.white,
            paddingBottom: uiState.keyboardHeight ? 0 : vars.iPhoneXBottom
        };
        const iconStyle = {
            paddingLeft: vars.spacing.medium.mini,
            paddingRight: vars.spacing.small.mini
        };
        return (
            <TouchableOpacity
                pressRetentionOffset={vars.retentionOffset}
                style={bottomRowStyle}
                onPress={action}>
                {icon && icons.plaindark(icon, vars.iconSize, iconStyle)}
                <View style={{ padding: vars.spacing.medium.mini }}>
                    <Text style={{ fontWeight: 'bold', color: vars.peerioBlue }}>{tu(title)}</Text>
                </View>
                {showAvatars && <SharedWithRow contacts={volume.otherParticipants} rooms={[]} />}
            </TouchableOpacity>
        );
    }
}
