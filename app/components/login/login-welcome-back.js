import React from 'react';
import { View, StatusBar } from 'react-native';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react/native';
import { T, tx } from '../utils/translator';
import loginState from './login-state';
import { vars, signupStyles } from '../../styles/styles';
import SafeComponent from '../shared/safe-component';
import Text from '../controls/custom-text';
import IntroStepIndicator from '../shared/intro-step-indicator';
import LoginButtonBack from './login-button-back';
import LoginInputs from './login-inputs';
import { User, telemetry } from '../../lib/icebear';
import tm from '../../telemetry';
import ActivityOverlay from '../controls/activity-overlay';
import DebugMenuTrigger from '../shared/debug-menu-trigger';
import routes from '../routes/routes';
import PeerioClosingBottomBanner from '../shared/peerio-closing-bottom-banner';

const { S } = telemetry;

const marginBottom = 10;
const marginTop = vars.spacing.small.maxi2x;

const titleStyle = {
    fontSize: vars.isDeviceScreenBig ? vars.font.size27 : vars.font.size24,
    color: vars.darkBlue,
    marginBottom
};

const subtitleStyle = {
    fontSize: vars.isDeviceScreenBig ? vars.font.size18 : vars.font.size14,
    color: vars.textBlack54,
    marginBottom: marginBottom + 10
};

const sublocation = S.WELCOME_BACK_SCREEN;

const loginTelemetryHelper = {
    location: S.SIGN_IN,
    sublocation
};

@observer
export default class LoginWelcomeBack extends SafeComponent {
    @observable lastUser;

    async componentDidMount() {
        this.startTime = Date.now();
        this.lastUser = await User.getLastAuthenticated();
        if (!this.lastUser) {
            routes.app.loginWelcome();
        }
    }

    componentWillUnmount() {
        tm.login.duration({ sublocation, startTime: this.startTime });
    }

    @action.bound
    onSignupPress() {
        loginState.routes.app.signupStep1();
    }

    @action.bound
    onLoginPress() {
        loginState.routes.app.loginClean();
    }

    @action.bound
    switchUserLink(text) {
        const onPress = () => {
            tm.login.changeUser();
            loginState.switchUser();
        };
        return (
            <Text style={{ color: vars.peerioBlue }} onPress={onPress}>
                {text}
            </Text>
        );
    }

    get placeholder() {
        return (
            <View style={signupStyles.page}>
                <IntroStepIndicator max={1} current={1} />
                <View style={signupStyles.container} />
                <StatusBar hidden />
            </View>
        );
    }

    renderThrow() {
        if (!this.lastUser) return this.placeholder;
        return (
            <View style={signupStyles.page}>
                <IntroStepIndicator max={1} current={1} />
                <View
                    style={[
                        signupStyles.container,
                        { paddingHorizontal: signupStyles.pagePaddingLarge }
                    ]}>
                    <LoginButtonBack telemetry={{ sublocation, option: S.BACK }} />
                    <DebugMenuTrigger>
                        <View style={{ marginTop }}>
                            <Text semibold serif style={titleStyle}>
                                {tx('title_welcomeBackFirstname', {
                                    firstName: this.lastUser.firstName
                                })}
                            </Text>
                            <T k="title_switchUser" style={subtitleStyle}>
                                {{
                                    username: this.lastUser.username,
                                    switchUser: this.switchUserLink
                                }}
                            </T>
                        </View>
                    </DebugMenuTrigger>
                    <LoginInputs telemetry={loginTelemetryHelper} hideUsernameInput />
                </View>
                <PeerioClosingBottomBanner />
                <ActivityOverlay large visible={loginState.isInProgress} />
                <StatusBar hidden />
            </View>
        );
    }
}
