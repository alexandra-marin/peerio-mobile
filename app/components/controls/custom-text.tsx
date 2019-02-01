import React from 'react';
import { observer } from 'mobx-react/native';
/* eslint-disable */
import { Text as RNText, TextStyle, StyleProp, /* Platform, */ TextProps } from 'react-native';
/* eslint-enable */
import SafeComponent from '../shared/safe-component';
// import fonts from '../../styles/fonts';

export interface CustomTextProps extends TextProps {
    style?: StyleProp<TextStyle>;
    semibold?: boolean;
    bold?: boolean;
    italic?: boolean;
    monospace?: boolean;
    serif?: boolean;
}

/**
 * Replaces all RN text components in order to use Open Sans font family
 */
@observer
export default class Text extends SafeComponent<CustomTextProps> {
    renderThrow() {
        const { semibold, bold, italic /*, monospace, serif */ } = this.props;
        const style = {} as TextStyle;
        // const font = [serif ? fonts.peerioSerifFontFamily : fonts.peerioFontFamily];

        style.fontWeight = '400';
        // default font style is normal
        style.fontStyle = 'normal';
        if (bold) style.fontWeight = '700';
        if (semibold) style.fontWeight = '600';
        if (italic) style.fontStyle = 'italic';
        // Font Weight and Style
        // if (Platform.OS === 'android') {
        //     if (semibold) font.push('SemiBold');
        //     else if (bold) font.push('Bold');
        //     if (italic) font.push('Italic');
        // } else {
        //     style.fontWeight = '400';
        //     // default font style is normal
        //     style.fontStyle = 'normal';
        //     if (bold) style.fontWeight = '700';
        //     if (semibold) style.fontWeight = '600';
        //     if (italic) style.fontStyle = 'italic';
        // }
        // style.fontFamily = font.join('');
        // if (Platform.OS === 'android') style.fontFamily = style.fontFamily.replace(/ /g, '');

        // Override font
        // if (monospace) {
        // style.fontFamily = Platform.OS === 'android' ? 'monospace' : 'Courier';
        // }

        return (
            <RNText {...this.props} style={[this.props.style, style]}>
                {this.props.children}
            </RNText>
        );
    }

    render() {
        try {
            return this.renderThrow();
        } catch (e) {
            console.error(e);
            const style = this.props.style || {};
            return (
                <RNText {...this.props} style={style}>
                    {this.props.children}
                </RNText>
            );
        }
    }
}
