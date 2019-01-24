import React from 'react';
import { observer } from 'mobx-react/native';
import { ActivityIndicator, View, Image, TouchableOpacity, ViewStyle } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from './safe-component';
import icons from '../helpers/icons';
import ErrorCircle from './error-circle';
import { vars } from '../../styles/styles';
import testLabel from '../helpers/test-label';

interface AvatarCircleProps {
    contact: any;
    loading?: boolean;
    large?: boolean;
    medium?: boolean;
    invited?: boolean;
    onPress?;
}

@observer
export default class AvatarCircle extends SafeComponent<AvatarCircleProps> {
    renderThrow() {
        const { large, medium, contact, loading, invited } = this.props;
        let ratio = 1;
        if (large) ratio = 2 + 2 / 3;
        if (medium) ratio = 2;
        const width = vars.avatarDiameter * ratio;
        const height = width;
        const avatarPlaceholderStyle: ViewStyle = {
            width,
            height,
            marginTop: vars.spacing.small.mini2x * ratio,
            marginBottom: vars.spacing.small.mini2x * ratio
        };
        const avatarStyle: ViewStyle[] = [
            avatarPlaceholderStyle,
            {
                borderRadius: width / 2
            }
        ];
        const imageStyle = {
            width,
            height,
            marginTop: vars.spacing.small.mini2x * ratio,
            marginBottom: vars.spacing.small.mini2x * ratio,
            borderRadius: width / 2
        };

        if (loading) {
            return <ActivityIndicator style={avatarPlaceholderStyle} />;
        }

        const { color, tofuError, letter } = contact;
        const tryColor = color || {};
        const coloredAvatarStyle: ViewStyle[] = [
            avatarStyle[0],
            {
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: tryColor.value || 'gray'
            }
        ];
        const avatarLetter = (
            <View style={coloredAvatarStyle}>
                <Text
                    style={{
                        color: tryColor.isLight ? 'black' : 'white',
                        textAlign: 'center',
                        width: 14 * ratio,
                        fontSize: vars.font.size12 * ratio
                    }}>
                    {letter}
                </Text>
            </View>
        );

        const groupIcon = <View style={coloredAvatarStyle}>{icons.plainWhite('group')}</View>;
        let avatarIcon = null;
        if (contact) {
            if (invited) {
                avatarIcon = (
                    <View style={[avatarStyle, { justifyContent: 'center', alignItems: 'center' }]}>
                        {icons.plaindark('person', width)}
                    </View>
                );
            }
            if (contact.hasAvatar) {
                const uri = large || medium ? contact.largeAvatarUrl : contact.mediumAvatarUrl;
                // image is absolute positioned so that it doesn't jump over letter when it loads
                avatarIcon = (
                    <Image source={{ uri, cache: 'force-cache' }} key={uri} style={imageStyle} />
                );
            }
        }

        return this.props.onPress ? (
            <TouchableOpacity
                onPress={this.props.onPress}
                {...testLabel(contact.hasAvatar ? 'currentAvatar' : 'avatarLetter')}
                style={{ borderWidth: 0, borderColor: 'green' }}>
                {/* if we don't have contact specified show group icon */}
                {!contact && groupIcon}
                {/* show letter if there's no avatar or it hasn't loaded yet */}
                {!invited && contact && avatarLetter}
                {avatarIcon}
                <ErrorCircle large={this.props.large} visible={tofuError} />
            </TouchableOpacity>
        ) : (
            <View
                {...testLabel(contact.hasAvatar ? 'currentAvatar' : 'avatarLetter')}
                style={{ borderWidth: 0, borderColor: 'green' }}>
                {/* if we don't have contact specified show group icon */}
                {!contact && groupIcon}
                {/* show letter if there's no avatar or it hasn't loaded yet */}
                {!invited && contact && avatarLetter}
                {avatarIcon}
                <ErrorCircle large={this.props.large} visible={tofuError} />
            </View>
        );
    }
}
