import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react/native';
import { View } from 'react-native';
import randomWords from 'random-words';
import capitalize from 'capitalize';
import { vars, signupStyles } from '../../styles/styles';
import signupState from './signup-state';
import { tx } from '../utils/translator';
import StyledTextInput from '../shared/styled-text-input';
import { socket, validation, telemetry, config } from '../../lib/icebear';
import SafeComponent from '../shared/safe-component';
import SignupButtonBack from './signup-button-back';
import SignupHeading from './signup-heading';
import SignupStepIndicator from './signup-step-indicator';
import tm from '../../telemetry';
import BlueRoundButton from '../buttons/blue-round-button';
import { popupPeerioClosureSignup } from '../shared/popups';

const { S } = telemetry;

const { validators } = validation;
const { firstName, lastName } = validators;

const MAX_NAME_LENGTH = config.user.maxNameLength;

const sublocation = S.ACCOUNT_NAME;

const signupTelemetryHelper = {
    location: S.ONBOARDING,
    sublocation
};

@observer
export default class SignupStep1 extends SafeComponent {
    firstnameState = observable({ value: '' });
    lastnameState = observable({ value: '' });

    @action.bound
    firstNameInputRef(ref) {
        this.firstNameInput = ref;
    }
    @action.bound
    lastNameInputRef(ref) {
        this.lastNameInput = ref;
    }

    @action.bound
    onSubmitFirstName() {
        this.lastNameInput.onFocus();
    }

    tmFirstname = { ...signupTelemetryHelper, item: S.FIRST_NAME };
    tmLastname = { ...signupTelemetryHelper, item: S.LAST_NAME };

    async componentDidMount() {
        this.startTime = Date.now();
        // QUICK SIGNUP DEV FLAG
        if (__DEV__ && process.env.PEERIO_QUICK_SIGNUP) {
            this.firstNameInput.onChangeText(capitalize(randomWords()));
            this.lastNameInput.onChangeText(capitalize(randomWords()));
        }
        // fill fields when returning from another step
        if (signupState.firstName) {
            this.firstnameState.value = signupState.firstName;
            this.firstNameInput.onChangeText(this.firstnameState.value);
        }
        if (signupState.lastName) {
            this.lastnameState.value = signupState.lastName;
            this.lastNameInput.onChangeText(this.lastnameState.value);
        }
        const result = await popupPeerioClosureSignup();
        if (!result) signupState.prev();
    }

    componentWillUnmount() {
        tm.signup.duration({ sublocation, startTime: this.startTime });
    }

    @action.bound
    async handleNextButton() {
        if (this.isNextDisabled) return;
        signupState.firstName = this.firstnameState.value;
        signupState.lastName = this.lastnameState.value;
        signupState.next();
        tm.signup.navigate({ sublocation, option: S.NEXT });
    }

    get isNextDisabled() {
        return (
            !socket.connected ||
            (!this.firstnameState.value ||
                !this.firstNameInput.isValid ||
                !this.lastNameInput.isValid)
        );
    }

    renderThrow() {
        const spaceBetweenInputs = vars.isDeviceScreenBig ? 16 : 6;
        return (
            <View style={signupStyles.page}>
                <SignupStepIndicator />
                <View style={signupStyles.container}>
                    <SignupButtonBack telemetry={{ sublocation, option: S.BACK }} />
                    <SignupHeading title="title_createYourAccount" subTitle="title_nameHeading" />
                    <StyledTextInput
                        state={this.firstnameState}
                        validations={firstName}
                        telemetry={this.tmFirstname}
                        label={`${tx('title_firstName')}*`}
                        helperText={
                            this.firstnameState.value.length >= MAX_NAME_LENGTH
                                ? tx('title_characterLimitReached')
                                : null
                        }
                        maxLength={MAX_NAME_LENGTH}
                        required
                        clearTextIcon
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={this.onSubmitFirstName}
                        ref={this.firstNameInputRef}
                        testID="firstName"
                    />
                    <View style={{ height: spaceBetweenInputs }} />
                    <StyledTextInput
                        state={this.lastnameState}
                        validations={lastName}
                        telemetry={this.tmLastname}
                        label={`${tx('title_lastName')}*`}
                        helperText={
                            this.lastnameState.value.length >= MAX_NAME_LENGTH
                                ? tx('title_characterLimitReached')
                                : null
                        }
                        maxLength={MAX_NAME_LENGTH}
                        required
                        clearTextIcon
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={this.handleNextButton}
                        ref={this.lastNameInputRef}
                        testID="lastName"
                    />
                    <View style={{ alignItems: 'flex-end' }}>
                        <BlueRoundButton
                            text="button_next"
                            accessibilityId="button_next"
                            onPress={this.handleNextButton}
                            disabled={this.isNextDisabled}
                            style={{ width: vars.signupButtonWidth, marginVertical: 30 }}
                        />
                    </View>
                </View>
            </View>
        );
    }
}
