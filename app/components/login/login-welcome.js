import React from 'react';
import { View, Image, Dimensions, StatusBar } from 'react-native';
import { action } from 'mobx';
import { observer } from 'mobx-react/native';
import loginState from './login-state';
import ActivityOverlay from '../controls/activity-overlay';
import { vars, signupStyles } from '../../styles/styles';
import SafeComponent from '../shared/safe-component';
import LoginHeading from './login-heading';
import { adjustImageDimensions } from '../helpers/image';
import { telemetry } from '../../lib/icebear';
import tm from '../../telemetry';
import DebugMenuTrigger from '../shared/debug-menu-trigger';
import { uiState } from '../states';
import signupState from '../signup/signup-state';
import BlueRoundButton from '../buttons/blue-round-button';
import WhiteRoundButton from '../buttons/white-round-button';
import PeerioClosingBottomBanner from '../shared/peerio-closing-bottom-banner';

const { S } = telemetry;

const logoWelcome = require('../../assets/peerio-logo-dark.png');
const imageWelcome = require('../../assets/welcome-illustration.png');

const { width } = Dimensions.get('window');

const logoBar = {
    alignItems: 'center',
    height: vars.welcomeHeaderHeight,
    backgroundColor: vars.darkBlue
};

const headerContainer = {
    flex: 0,
    paddingHorizontal: signupStyles.pagePadding,
    paddingTop: vars.isDeviceScreenBig ? vars.spacing.large.mini2x : vars.spacing.medium.maxi2x
};

const buttonContainer = {
    marginBottom: vars.spacing.small.maxi,
    alignItems: 'flex-start'
};

const sublocation = S.WELCOME_SCREEN;

@observer
export default class LoginWelcome extends SafeComponent {
    @action.bound
    onSignupPress() {
        tm.signup.onStartAccountCreation({ sublocation });
        loginState.routes.app.signupStep1();
    }

    @action.bound
    onLoginPress() {
        tm.login.onNavigateLogin();
        loginState.routes.app.loginClean();
    }

    componentDidMount() {
        this.startTime = Date.now();
        uiState.testAction3 = signupState.testQuickSignup;
    }

    componentWillUnmount() {
        tm.signup.duration({ sublocation, startTime: this.startTime });
        uiState.testAction3 = null;
    }

    render() {
        return (
            <View style={[signupStyles.page, { flexGrow: 1 }]}>
                <View style={{ position: 'absolute', bottom: 0, right: 0, left: 0 }}>
                    <Image
                        resizeMode="contain"
                        source={imageWelcome}
                        style={adjustImageDimensions(imageWelcome, width, undefined)}
                    />
                </View>
                <View style={logoBar}>
                    <DebugMenuTrigger>
                        <Image
                            source={logoWelcome}
                            style={adjustImageDimensions(
                                logoWelcome,
                                undefined,
                                vars.welcomeHeaderHeight
                            )}
                        />
                    </DebugMenuTrigger>
                </View>
                <View
                    style={[headerContainer, { paddingHorizontal: signupStyles.pagePaddingLarge }]}>
                    <LoginHeading
                        title="title_newUserWelcome"
                        subTitle="title_newUserWelcomeDescription"
                    />
                    <View style={buttonContainer}>
                        <BlueRoundButton
                            text="button_CreateAccount"
                            accessibilityId="button_CreateAccount"
                            onPress={this.onSignupPress}
                            style={{
                                width: vars.roundedButtonWidth,
                                marginBottom: vars.spacing.small.midi2x
                            }}
                        />
                        <WhiteRoundButton
                            text="button_login"
                            accessibilityId="button_login"
                            onPress={this.onLoginPress}
                            style={{
                                width: vars.roundedButtonWidth
                            }}
                        />
                    </View>
                </View>
                <PeerioClosingBottomBanner />
                <ActivityOverlay large visible={loginState.isInProgress} />
                <StatusBar hidden />
            </View>
        );
    }
}
