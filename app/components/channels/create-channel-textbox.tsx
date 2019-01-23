import React, { Component } from 'react';
import { View, Platform } from 'react-native';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import { vars } from '../../styles/styles';
import { tx } from '../utils/translator';
import testLabel from '../helpers/test-label';
import Text from '../controls/custom-text';
import TextInputUncontrolled from '../controls/text-input-uncontrolled';
import fonts from '../../styles/fonts';
import { config } from '../../lib/icebear';
import { LocalizationStrings } from '../utils/translator';

const height = vars.inputHeight;
const fontSize = vars.font.size14;

export interface CreateChannelTextBoxProps {
    state?: object;
    labelText?: keyof LocalizationStrings;
    placeholderText?: keyof LocalizationStrings;
    property?: string;
    bottomText?: keyof LocalizationStrings;
    maxLength?: number;
    multiline?: boolean;
}

const container: object = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vars.spacing.medium.maxi,
    marginHorizontal: vars.spacing.medium.mini2x,
    marginBottom: vars.spacing.small.midi2x,
    borderColor: vars.peerioBlue,
    borderWidth: 1,
    height,
    borderRadius: height
};

const placeholderStyle = {
    flexGrow: 1,
    height,
    marginLeft: vars.spacing.small.midi,
    fontSize,
    fontFamily: fonts.peerioFontFamily
};

const bottomTextStyle = {
    fontSize: vars.font.size12,
    color: vars.txtDate,
    marginLeft: vars.spacing.large.midixx,
    marginBottom: vars.spacing.medium.mini2x
};

const titleStyle = {
    color: vars.peerioBlue,
    fontSize: vars.font.size16
};

@observer
export default class CreateChannelTextBox extends Component<CreateChannelTextBoxProps> {
    @action.bound
    changeText(text) {
        this.props.state[this.props.property] = text;
    }

    render() {
        const {
            labelText,
            placeholderText,
            property,
            bottomText,
            maxLength,
            multiline
        } = this.props;
        const testID = `textInput-${property}`;
        // hack for v-align, padding top and bottom need to be specified
        let paddingTop = 0;
        if (Platform.OS === 'ios' && multiline) paddingTop = (height - fontSize) / 2 - 1;
        const style = [placeholderStyle, { paddingTop, paddingBottom: 0 }];
        return (
            <View>
                <View style={container}>
                    <Text style={titleStyle}>{tx(labelText)}</Text>
                    <TextInputUncontrolled
                        underlineColorAndroid="transparent"
                        value={this[property]}
                        returnKeyType="done"
                        blurOnSubmit
                        onChangeText={this.changeText}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder={tx(placeholderText)}
                        style={style}
                        maxLength={maxLength}
                        multiline={multiline}
                        {...testLabel(testID)}
                    />
                </View>
                <Text style={bottomTextStyle}>
                    {tx(bottomText, {
                        maxChatNameLength: config.chat.maxChatNameLength
                    })}
                </Text>
            </View>
        );
    }
}
