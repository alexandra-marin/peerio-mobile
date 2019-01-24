import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react/native';
import { Image, View, Dimensions, Linking } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { adjustImageDimensions } from '../helpers/image';
import { vars } from '../../styles/styles';
import ButtonText from '../controls/button-text';
import routes from '../routes/routes';

const { width } = Dimensions.get('window');

const illustration = require('../../assets/welcome-illustration.png');

const container = {
    flex: 1,
    flexGrow: 1,
    backgroundColor: vars.darkBlueBackground05
};
const headerStyle = {
    fontSize: vars.font.size24,
    color: vars.darkBlue,
    marginHorizontal: 16,
    marginTop: 16
};
const descriptionTextStyle = {
    fontSize: vars.font.size14,
    color: vars.textBlack87,
    marginHorizontal: 16,
    paddingTop: vars.isDeviceScreenBig ? vars.spacing.medium.midi2x : vars.spacing.medium.mini2x
};

@observer
export default class NoticeOfClosure extends SafeComponent {
    get zeroStateIllustration() {
        return (
            <View>
                <Image
                    source={illustration}
                    style={adjustImageDimensions(illustration, width, null)}
                />
            </View>
        );
    }

    @action.bound
    dismiss() {
        routes.modal.discard();
    }

    renderThrow() {
        return (
            <View style={container}>
                {this.zeroStateIllustration}
                <Text semibold serif style={headerStyle}>
                    Peerio will be closing
                </Text>
                <Text style={descriptionTextStyle}>
                    The Peerio service will be shut down on July 15th, 2019.
                </Text>
                <Text style={descriptionTextStyle}>
                    You will be able to use Peerio as usual until then. We strongly recommend you
                    begin tranisitioning your files and important information out of Peerio.
                </Text>
                <Text style={descriptionTextStyle}>
                    We want to offer a sincere thank you for your trust and support.&nbsp;
                    <Text
                        style={[
                            descriptionTextStyle,
                            { color: vars.linkColor, textDecorationLine: 'underline' }
                        ]}
                        onPress={() =>
                            Linking.openURL(
                                'https://support.peerio.com/hc/en-us/articles/360021688172'
                            )
                        }>
                        Learn More.
                    </Text>
                </Text>
                <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                    <ButtonText onPress={() => this.dismiss()} text="Got It" />
                </View>
            </View>
        );
    }
}
