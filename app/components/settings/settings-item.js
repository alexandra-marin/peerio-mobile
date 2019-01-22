import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import { View, TouchableOpacity } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import { tx } from '../utils/translator';
import testLabel from '../helpers/test-label';

const itemContainerStyle = {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingLeft: vars.spacing.small.maxi2x,
    paddingVertical: vars.spacing.medium.mini2x,
    marginBottom: vars.spacing.small.mini,
    borderRadius: 4
};

const descriptionStyle = {
    color: vars.txtLightGrey,
    fontSize: vars.font.size12
};

@observer
export default class SettingsItem extends SafeComponent {
    press() {
        this.props.onPress && this.props.onPress();
    }

    get leftComponent() {
        return this.props.leftComponent !== null ? this.props.leftComponent : null;
    }

    get rightIcon() {
        return this.props.rightIcon !== null
            ? icons.darkNoPadding(this.props.rightIcon || 'keyboard-arrow-right', null, {
                  paddingLeft: vars.spacing.small.mini2x,
                  paddingRight: vars.iconPadding
              })
            : null;
    }

    renderThrow() {
        const {
            disabled,
            title,
            textColor,
            untappable,
            description,
            children,
            large,
            semibold
        } = this.props;
        const titleColor = textColor || vars.txtDark;
        const titleStyle = {
            color: disabled ? vars.txtLightGrey : titleColor,
            fontSize: vars.font.size16
        };
        const offset = vars.retentionOffset;
        const height = large ? vars.largeSettingsItemHeight : vars.settingsItemHeight;
        const marginLeft = this.leftComponent ? vars.spacing.huge.mini2x : 0;
        return (
            <TouchableOpacity
                {...testLabel(title)}
                activeOpacity={untappable ? 1 : 0.3}
                pressRetentionOffset={offset}
                onPress={() => !untappable && !disabled && this.press()}>
                <View
                    style={[itemContainerStyle, { height }]}
                    pointerEvents={untappable ? undefined : 'none'}>
                    <View style={{ flexGrow: 1, flexShrink: 1, marginLeft }}>
                        <Text semibold={semibold} style={titleStyle}>
                            {tx(title)}
                        </Text>
                        {!!description && <Text style={descriptionStyle}>{description}</Text>}
                    </View>
                    <View style={{ position: 'absolute', left: 0, flex: 0 }}>
                        {this.leftComponent}
                    </View>
                    <View style={{ flex: 0, justifyContent: 'center' }}>{children}</View>
                    <View style={{ flex: 0 }}>{this.rightIcon}</View>
                </View>
            </TouchableOpacity>
        );
    }
}

SettingsItem.propTypes = {
    children: PropTypes.any,
    textColor: PropTypes.any,
    title: PropTypes.any,
    description: PropTypes.any,
    disabled: PropTypes.bool,
    untappable: PropTypes.bool,
    rightIcon: PropTypes.any,
    leftComponent: PropTypes.any,
    onPress: PropTypes.any
};
