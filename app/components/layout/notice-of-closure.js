import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react/native';
import { Image, View, Dimensions, Linking, ScrollView, TouchableOpacity } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { adjustImageDimensions } from '../helpers/image';
import { vars } from '../../styles/styles';
import ButtonText from '../controls/button-text';
import routes from '../routes/routes';
import icons from '../helpers/icons';

const { width } = Dimensions.get('window');

const illustration = require('../../assets/welcome-illustration.png');

const container = {
    flex: 1,
    flexGrow: 1,
    backgroundColor: vars.darkBlueBackground05
};

const marginContainer = {
    marginHorizontal: 16
};

const headerStyle = {
    fontSize: vars.font.size24,
    color: vars.darkBlue,
    marginTop: 16
};
const descriptionTextStyle = {
    fontSize: vars.font.size14,
    color: vars.textBlack87
};
const closeIconContainer = {
    position: 'absolute',
    top: vars.statusBarHeight,
    right: 0,
    bottom: 0
};

const spacerHeight = 12;

const Spacer = () => <View style={{ height: spacerHeight }} />;

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
            <ScrollView style={container}>
                {this.zeroStateIllustration}
                <View style={closeIconContainer}>{icons.dark('close', this.dismiss)}</View>
                <Spacer />
                <View style={marginContainer}>
                    <Text semibold serif style={headerStyle}>
                        Peerio will be closing
                    </Text>
                    <Spacer />
                    <Text style={descriptionTextStyle}>
                        The Peerio service will be shut down on July 15th, 2019.
                    </Text>
                    <Spacer />
                    <Text style={descriptionTextStyle}>
                        You will be able to use Peerio as usual until then. We strongly recommend
                        you begin tranisitioning your files and important information out of Peerio.
                    </Text>
                    <Spacer />
                    <View style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
                        <Text style={descriptionTextStyle}>
                            We want to offer a sincere thank you for
                        </Text>
                        <Text style={descriptionTextStyle}>your trust and support.&nbsp;</Text>
                        <TouchableOpacity
                            hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
                            onPress={() =>
                                Linking.openURL(
                                    'https://support.peerio.com/hc/en-us/articles/360021688172'
                                )
                            }>
                            <Text
                                style={[
                                    descriptionTextStyle,
                                    { color: vars.linkColor, textDecorationLine: 'underline' }
                                ]}>
                                Learn More.
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Spacer />
                    <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
                        <ButtonText onPress={this.dismiss} text="Got It" testID="gotIt" />
                    </View>
                </View>
            </ScrollView>
        );
    }
}
