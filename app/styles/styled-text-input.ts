import vars from './vars';
import { ViewStyle } from 'react-native';

const textinputStyle = {
    color: vars.textBlack87,
    // without input height text input is rendered zero-height on iOS
    height: vars.inputHeight,
    fontSize: vars.font.size14,
    paddingHorizontal: vars.inputPaddingHorizontal
};

const bottomMessageContainer: ViewStyle = {
    flexDirection: 'row',
    marginTop: vars.spacing.small.mini,
    height: vars.spacing.medium.midi2x
};

const errorTextStyle = {
    fontSize: vars.font.size12,
    color: vars.red
};

const helperTextFocusedStyle = {
    fontSize: vars.font.size12,
    color: vars.peerioBlue
};

const helperTextBlurredStyle = {
    fontSize: vars.font.size12,
    color: vars.textBlack54
};

const inputContainer = {
    marginTop: vars.spacing.small.midi
};

const labelContainerStyle: ViewStyle = {
    position: 'absolute',
    top: -vars.font.size12 / 2 - 2,
    left: vars.spacing.small.mini2x,
    backgroundColor: 'white',
    paddingLeft: vars.spacing.small.mini2x,
    paddingRight: vars.spacing.small.mini2x
};

const iconContainer: ViewStyle = {
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: 'flex-end',
    position: 'absolute',
    zIndex: 15
};

export default {
    textinputStyle,
    bottomMessageContainer,
    errorTextStyle,
    helperTextFocusedStyle,
    helperTextBlurredStyle,
    inputContainer,
    labelContainerStyle,
    iconContainer
};
