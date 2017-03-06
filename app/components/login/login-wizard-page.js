import React, { Component } from 'react';
import {
    View, Text, LayoutAnimation, Dimensions
} from 'react-native';
import { observer } from 'mobx-react/native';
import { tu } from '../utils/translator';
import Layout1 from '../layout/layout1';
import Logo from '../controls/logo';
import Button from '../controls/button';
import styles, { vars } from '../../styles/styles';

const { width, height } = Dimensions.get('window');
const logoHeight = height * 0.33;

@observer
export default class LoginWizardPage extends Component {
    button(text, onPress) {
        const buttonContainer = {
            marginVertical: 20,
            alignItems: 'stretch',
            backgroundColor: vars.bg
        };
        const button = {
            padding: 12,
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.12)'
        };
        const buttonText = {
            fontWeight: 'bold'
        };
        return (
            <View style={buttonContainer}>
                {this._button(text, onPress, button, buttonText)}
            </View>
        );
    }

    _button(text, onPress, style, textStyle) {
        return <Button style={style} testID={text} textStyle={textStyle} text={tu(text)} onPress={onPress} />;
    }

    _footerButton(text, onPress, style) {
        const s = styles.wizard.footer.button.base;
        return this._button(text, onPress, [s, style], { fontWeight: 'bold' });
    }

    buttons() {
        return null;
    }

    items() {
        return null;
    }

    flexer(i) {
        const flexer = {
            flexGrow: 1, flexShrink: 2, justifyContent: 'flex-start', maxHeight: 192
        };
        return i && <View style={flexer}>{i}</View>;
    }

    render() {
        return (
            <View style={{ flexGrow: 1 }}>
                {this.flexer(this.items())}
                {this.flexer(this.buttons())}
                <View style={{ flexGrow: 3 }} />
            </View>
        );
    }
}
