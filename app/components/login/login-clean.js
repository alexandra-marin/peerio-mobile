import React from 'react';
import { observer } from 'mobx-react/native';
import { View, StatusBar } from 'react-native';
import ActivityOverlay from '../controls/activity-overlay';
import loginState from './login-state';
import { signupStyles } from '../../styles/styles';
import { telemetry } from '../../lib/icebear';
import SafeComponent from '../shared/safe-component';
import LoginButtonBack from './login-button-back';
import SignupHeading from '../signup/signup-heading';
import IntroStepIndicator from '../shared/intro-step-indicator';
import tm from '../../telemetry';
import LoginInputs from './login-inputs';
import PeerioClosingBottomBanner from '../shared/peerio-closing-bottom-banner';

const { S } = telemetry;

const sublocation = S.SIGN_IN;

const loginTelemetryHelper = {
    location: S.SIGN_IN,
    sublocation
};

@observer
export default class LoginClean extends SafeComponent {
    componentDidMount() {
        this.startTime = Date.now();
    }

    componentWillUnmount() {
        tm.login.duration({ sublocation, startTime: this.startTime });
    }

    render() {
        return (
            <View style={signupStyles.page}>
                <IntroStepIndicator max={1} current={1} />
                <View
                    style={[
                        signupStyles.container,
                        { paddingHorizontal: signupStyles.pagePaddingLarge }
                    ]}>
                    <LoginButtonBack telemetry={{ sublocation, option: S.BACK }} />
                    <SignupHeading title="title_welcomeBack" />
                    <LoginInputs telemetry={loginTelemetryHelper} />
                </View>
                <StatusBar hidden />
                <PeerioClosingBottomBanner />
                <ActivityOverlay large visible={loginState.isInProgress} />
            </View>
        );
    }
}
