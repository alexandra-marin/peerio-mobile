import React from 'react';
import { observer } from 'mobx-react/native';
import { View, ViewStyle, TextStyle } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import drawerState from './drawer-state';
import BlueButtonText from '../buttons/blue-text-button';
import { LocalizationStrings } from '../../lib/icebear';

const container: ViewStyle = {
    backgroundColor: 'white',
    alignItems: 'center',
    height: vars.topDrawerHeight,
    overflow: 'hidden',
    paddingBottom: vars.spacing.small.mini2x,
    borderBottomColor: vars.black12,
    borderBottomWidth: 1
};

const headingStyle: ViewStyle = {
    paddingVertical: vars.spacing.medium.mini,
    borderBottomWidth: 1,
    borderBottomColor: vars.black12,
    alignSelf: 'stretch'
};

const headingTextStyle: TextStyle = {
    color: vars.darkBlue,
    textAlign: 'center'
};

const descriptionContainer: ViewStyle = {
    marginBottom: vars.spacing.small.midi2x,
    alignSelf: 'stretch'
};

const descriptionStyle: TextStyle = {
    fontSize: vars.font.size12,
    color: vars.textBlack54,
    paddingHorizontal: vars.spacing.huge.mini2x,
    textAlign: 'center'
};

const iconStyle: ViewStyle = {
    position: 'absolute',
    top: vars.spacing.small.maxi2x,
    right: vars.spacing.medium.mini2x
};

interface TopDrawerProps {
    context: string;
    heading: string;
    image: any;
    descriptionLine1: string;
    descriptionLine2: string;
    buttonText: keyof LocalizationStrings;
    buttonAction: Function;
}

@observer
export default class TopDrawer extends SafeComponent<TopDrawerProps> {
    onDismiss = () => drawerState.dismiss(this);

    onButtonAction = () => {
        this.onDismiss();
        this.props.buttonAction && this.props.buttonAction();
    };

    renderThrow() {
        const { heading, image, descriptionLine1, descriptionLine2, buttonText } = this.props;
        return (
            <View style={container}>
                <View style={headingStyle}>
                    <Text semibold style={headingTextStyle}>
                        {heading}
                    </Text>
                </View>
                {image}
                <View style={descriptionContainer}>
                    <Text numberOfLines={2} style={descriptionStyle}>
                        {descriptionLine1}
                    </Text>
                    {descriptionLine2 && (
                        <Text numberOfLines={1} style={descriptionStyle}>
                            {descriptionLine2}
                        </Text>
                    )}
                </View>
                <BlueButtonText
                    text={buttonText}
                    onPress={this.onButtonAction}
                    accessibilityId={buttonText as string}
                />
                <View style={iconStyle}>{icons.darkNoPadding('close', this.onDismiss)}</View>
            </View>
        );
    }
}
