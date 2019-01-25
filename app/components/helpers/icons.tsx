import React from 'react';
import { TouchableOpacity, View, Image, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { vars } from '../../styles/styles';
import testLabel from './test-label';
import Text from '../controls/custom-text';

const goStyle: TextStyle = {
    fontSize: vars.font.size14,
    color: vars.peerioBlue
};

const disabledStyle = {
    fontSize: vars.font.size14,
    color: vars.disabled
};

const icons = {
    basic(name, color?, onPress?, style?, size?, noPadding?, testID?, disabled?) {
        return (
            <TouchableOpacity
                pressRetentionOffset={vars.retentionOffset}
                onPress={onPress}
                style={{ justifyContent: 'center' }}
                disabled={disabled}
                {...testLabel(testID)}>
                <View style={{ padding: noPadding ? 0 : vars.iconPadding }}>
                    <Icon style={style} name={name} size={size || vars.iconSize} color={color} />
                </View>
            </TouchableOpacity>
        );
    },

    plain(name, size?, color?, testID?, style?) {
        return (
            <Icon
                name={name}
                size={size || vars.iconSize}
                color={color}
                style={[{ backgroundColor: 'transparent' }, style]}
                {...testLabel(testID)}
            />
        );
    },

    plaindark(name, size?, style?) {
        return icons.plain(name, size, vars.darkIcon, undefined, style);
    },

    plainalert(name, size, style) {
        return icons.plain(name, size, vars.red, null, style);
    },

    plainWhite(name, size) {
        return icons.plain(name, size, vars.whiteIcon);
    },

    white(name, onPress, style, size, testID) {
        return icons.basic(name, vars.whiteIcon, onPress, style, size, undefined, testID);
    },

    whiteNoPadding(name, onPress, style, size, disabled) {
        const iconStyle = disabled ? vars.disabledIcon : vars.whiteIcon;
        return icons.basic(name, iconStyle, onPress, style, size, true, undefined, disabled);
    },

    dark(name, onPress?, style?, size?, testID?, disabled?) {
        const iconColor = disabled ? vars.disabledIcon : vars.darkIcon;
        return icons.basic(name, iconColor, onPress, style, size, undefined, testID, disabled);
    },

    gold(name, onPress, style, size) {
        return icons.basic(name, vars.gold, onPress, style, size);
    },

    darkNoPadding(name, onPress?, style?, size?, disabled?) {
        const iconStyle = disabled ? vars.disabledIcon : vars.darkIcon;
        return icons.basic(name, iconStyle, onPress, style, size, true, undefined, disabled);
    },

    colored(name, onPress, colorFg, backgroundColor, disabled, testId) {
        return icons.basic(
            name,
            colorFg,
            onPress,
            backgroundColor ? { backgroundColor } : {},
            null,
            null,
            testId,
            disabled
        );
    },

    coloredNoPadding(name, onPress, outerStyle, colorFg, backgroundColor, disabled, testId) {
        const s = backgroundColor ? [outerStyle, { backgroundColor }] : outerStyle;
        return icons.basic(name, colorFg, onPress, s, null, true, testId, disabled);
    },

    coloredSmall(name, onPress, colorFg) {
        return (
            <TouchableOpacity pressRetentionOffset={vars.retentionOffset} onPress={onPress}>
                <Icon
                    name={name}
                    size={vars.iconSizeSmall}
                    style={{ marginRight: vars.spacing.small.midi2x }}
                    color={colorFg}
                />
            </TouchableOpacity>
        );
    },

    coloredAsText(name, color, size) {
        return <Icon name={name} size={size || vars.iconSize} color={color} />;
    },

    placeholder() {
        const d = vars.iconSize + vars.iconPadding * 2;
        const s = {
            height: d,
            width: d
        };
        return <View style={s} />;
    },

    text(text, onPress?, style?: TextStyle, testID?, extraWidth?) {
        const size = vars.iconPadding * 2 + vars.iconSize;
        const containerStyle: object = {
            marginHorizontal: vars.iconPadding,
            height: size,
            width: size + extraWidth,
            alignItems: 'center',
            justifyContent: 'center'
        };
        return (
            <TouchableOpacity
                pressRetentionOffset={vars.retentionOffset}
                onPress={onPress}
                {...testLabel(testID)}>
                <View style={containerStyle}>
                    <Text semibold style={[goStyle, style]}>
                        {text}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    },

    disabledText(text, style?, extraWidth?) {
        const size = vars.iconPadding * 2 + vars.iconSize;
        const containerStyle: object = {
            marginHorizontal: vars.iconPadding,
            height: size,
            width: size + extraWidth,
            alignItems: 'center',
            justifyContent: 'center'
        };
        return (
            <TouchableOpacity pressRetentionOffset={vars.retentionOffset}>
                <View style={containerStyle}>
                    <Text semibold style={[disabledStyle, style]}>
                        {text}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    },

    bubble: text => icons.circle(text, 14, 8, vars.red, vars.white),
    unreadBubble: text => icons.circle(text, 24, 12, vars.peerioBlue, vars.white),

    circle(text, radius, margin, bgColor, fgColor) {
        const notificationStyle: object = {
            backgroundColor: bgColor,
            borderRadius: radius,
            overflow: 'hidden',
            width: radius,
            height: radius,
            marginHorizontal: margin,
            alignItems: 'center',
            justifyContent: 'center'
        };
        const textStyle: TextStyle = {
            color: fgColor,
            fontSize: vars.font.size14,
            textAlign: 'center'
        };
        return (
            <View style={notificationStyle}>
                <Text bold style={textStyle}>
                    {`${text}`}{' '}
                </Text>
            </View>
        );
    },

    imageIcon(source, size) {
        const width = size || vars.iconSize;
        const height = width;
        const padding = vars.iconPadding;
        return (
            <View style={{ padding }}>
                <Image style={{ width, height }} source={source} />
            </View>
        );
    },

    imageIconNoPadding(source, size, style) {
        const width = size || vars.iconSize;
        const height = width;
        return (
            <View style={style}>
                <Image style={{ width, height }} source={source} />
            </View>
        );
    },

    imageButton(source, onPress, size, opacity) {
        const width = size || vars.iconSize;
        const height = width;
        const padding = vars.iconPadding;
        return (
            <TouchableOpacity
                style={{ padding, opacity }}
                onPress={onPress}
                pressRetentionOffset={vars.retentionOffset}>
                <Image style={{ width, height }} source={source} />
            </TouchableOpacity>
        );
    },

    imageButtonNoPadding(source, onPress?, size?, opacity?, testID?) {
        const width = size || vars.iconSize;
        const height = width;
        return (
            <TouchableOpacity
                style={{ opacity }}
                onPress={onPress}
                pressRetentionOffset={vars.retentionOffset}
                {...testLabel(testID)}>
                <Image style={{ width, height }} source={source} />
            </TouchableOpacity>
        );
    },

    iconPinnedChat(source, onPress?) {
        const width = vars.pinnedChatIconSize;
        const height = width;
        return (
            <TouchableOpacity
                style={{ position: 'absolute', left: 8, top: 0 }}
                onPress={onPress}
                pressRetentionOffset={vars.retentionOffset}>
                <Image style={{ width, height }} source={source} />
            </TouchableOpacity>
        );
    }
};

export default icons;
