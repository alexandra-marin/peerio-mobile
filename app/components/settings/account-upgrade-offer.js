import React from 'react';
import { observer } from 'mobx-react/native';
import { View, ScrollView, Dimensions, Linking } from 'react-native';
import { vars } from '../../styles/styles';
import routes from '../routes/routes';
import { User } from '../../lib/icebear';
import { popupYes } from '../shared/popups';
import Text from '../controls/custom-text';
import { t } from '../utils/translator';
import icons from '../helpers/icons';
import SafeComponent from '../shared/safe-component';
import BackIcon from '../layout/back-icon';
import { uiState } from '../states';

const { width } = Dimensions.get('window');

const subtitleStyle = {
    color: 'white',
    alignSelf: 'center',
    paddingTop: 50,
    paddingBottom: 30
};

const featureSmallText = {
    color: vars.black54,
    fontSize: vars.font.size14
};

const contentContainerStyle = {
    width,
    flexDirection: 'column',
    flexGrow: 1,
    flex: 1
};

const container = {
    flex: 1,
    flexGrow: 1,
    backgroundColor: vars.darkBlue
};

@observer
export default class AccountUpgradeOffer extends SafeComponent {
    componentWillMount() {
        if (User.current) {
            console.log('account-upgrade-swiper: active plans');
            User.current && console.log(User.current.activePlans);
            if (User.current.addresses.filter(e => e.confirmed).length === 0) {
                popupYes('', '', t('error_upgradingAccountNoConfirmedEmail')).then(() =>
                    routes.main.settings()
                );
            }
        }
    }

    componentDidMount() {
        uiState.hideTabs = true;
    }

    componentWillUnmount() {
        uiState.hideTabs = false;
    }

    get leftIcon() {
        return <BackIcon action={routes.main.settings} />;
    }

    featureText(text) {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                {icons.coloredAsText('check', vars.black54, 16)}
                <Text semibold key={text} style={featureSmallText}>
                    {text}
                </Text>
            </View>
        );
    }

    render() {
        return (
            <View style={container}>
                <ScrollView contentContainerStyle={contentContainerStyle}>
                    <Text semibold style={subtitleStyle}>
                        Peerio is closing
                    </Text>
                    <View
                        style={{
                            backgroundColor: vars.white,
                            flexGrow: 1,
                            padding: vars.spacing.large.midi
                        }}>
                        <Text style={featureSmallText}>
                            The Peerio service will be shut down on July 15th, 2019. You will be able to use Peerio as usual until then, but we recommend you begin transitioning your files and important information out of Peerio&nbsp;
                            <Text style={{ color: vars.linkColor, textDecorationLine: 'underline', }} onPress={() => Linking.openURL('https://support.peerio.com/hc/en-us/articles/360021688052')}>
                                (learn how to export your files)
                            </Text>
                        </Text>
                        <Text style={{ color: vars.black54, fontSize: vars.font.size14, paddingTop: 6 }}>
                            If you have a paid plan with service that extends beyond July 15th, you’ll be receiving a separate email in the next few weeks with information about a refund.
                        </Text>
                        <Text style={{ color: vars.black54, fontSize: vars.font.size14, paddingTop: 6 }}>
                            Thank you for your trust and support.&nbsp;
                            <Text style={{ color: vars.linkColor, textDecorationLine: 'underline' }} onPress={() => Linking.openURL('https://peerio.com/blog/posts/peerio-has-been-acquired-by-workjam-the-leading-digital-workplace-platform/')}>
                                Learn More
                            </Text>
                        </Text>
                    </View>
                </ScrollView>
            </View>
        );
    }
}
