import React from 'react';
import { observer } from 'mobx-react/native';
import { View, TouchableOpacity, ViewStyle, GestureResponderEvent } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';

const diameter = 18;

interface ErrorCircleProps {
    onPress?: (event: GestureResponderEvent) => void;
    visible?: boolean;
    large?: boolean;
    invert?: boolean;
}

@observer
export default class ErrorCircle extends SafeComponent<ErrorCircleProps> {
    renderThrow() {
        if (!this.props.visible) return null;
        const ratio = this.props.large ? 2 : 1;
        const width = diameter * ratio;
        const height = width;
        const color1 = 'red';
        const color2 = 'white';
        const borderColor = this.props.invert ? color1 : color2;
        const backgroundColor = this.props.invert ? color2 : color1;
        const tofuStyle: ViewStyle = {
            width,
            height,
            borderRadius: width / 2,
            borderColor,
            borderWidth: 1,
            backgroundColor,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center'
        };
        const containerStyle: ViewStyle = {
            position: 'absolute',
            right: 0,
            top: 0,
            padding: vars.spacing.small.midi2x
        };
        return (
            <TouchableOpacity onPress={this.props.onPress} style={containerStyle}>
                <View style={tofuStyle}>
                    <Text bold style={{ color: borderColor, fontSize: vars.font.size12 * ratio }}>
                        !
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
}
