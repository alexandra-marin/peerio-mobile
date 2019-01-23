import React from 'react';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Text from '../controls/custom-text';
import { vars } from '../../styles/styles';
import { clientApp } from '../../lib/icebear';
import { tx, tu, T } from '../utils/translator';
import SafeComponent from '../shared/safe-component';
import RadioGroup from '../controls/radio-group';

const container = {
    backgroundColor: vars.darkBlueBackground05,
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingTop: 21,
    paddingBottom: 6
};

const titleContainer: ViewStyle = {
    flexDirection: 'row'
};

const titleText = {
    fontSize: vars.font.size18,
    color: vars.textBlack87,
    paddingLeft: 8
};

const descriptionText = {
    fontSize: vars.font.size14,
    color: vars.textBlack87
};

const options = ['title_forAllContacts', 'title_forFavouriteContactsOnly', 'title_disable'];

@observer
export default class InlineUrlPreviewConsent extends SafeComponent<{ onChange: Function }> {
    @observable optionSelected = 0;

    onSelectRadioButton = index => {
        this.optionSelected = index;
    };

    renderButton(text, onPress, colorIsPrimary) {
        return (
            <TouchableOpacity
                onPress={onPress}
                pressRetentionOffset={vars.retentionOffset}
                style={{ paddingLeft: 40, paddingVertical: 16 }}>
                <Text bold style={{ color: colorIsPrimary ? vars.peerioBlue : vars.black54 }}>
                    {text}
                </Text>
            </TouchableOpacity>
        );
    }

    userActionSave = () => {
        const index = this.optionSelected;
        const prefs = clientApp.uiUserPrefs;
        prefs.externalContentConsented = true;
        if (index === 0) {
            // For all Contacts
            prefs.externalContentEnabled = true;
            prefs.externalContentJustForFavs = false;
        } else if (index === 1) {
            // For favorite contacts only
            prefs.externalContentEnabled = true;
            prefs.externalContentJustForFavs = true;
        } else if (index === 2) {
            // Disable
            prefs.externalContentEnabled = false;
            prefs.externalContentJustForFavs = false;
        }
        this.props.onChange && this.props.onChange();
    };

    userActionDismiss = () => {
        this.optionSelected = 2;
        this.userActionSave();
    };

    get spacer() {
        return <View style={{ height: 16 }} />;
    }

    renderThrow() {
        return (
            <View style={container}>
                <View style={titleContainer}>
                    <Icon name="security" size={vars.iconSize} color="gray" />
                    <Text style={titleText}>{tx('title_EnableUrlPreviews')}</Text>
                </View>
                {this.spacer}
                <Text style={descriptionText}>{tx('title_UrlPreviewsWarning')}</Text>
                <Text style={{ color: vars.peerioBlue }}>
                    <T k="title_learnMore" />
                </Text>
                {this.spacer}
                <RadioGroup
                    onSelect={this.onSelectRadioButton}
                    defaultSelect={this.optionSelected}
                    options={options}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    {this.renderButton(tu('button_notNow'), this.userActionDismiss, false)}
                    {this.renderButton(tu('button_save'), this.userActionSave, true)}
                </View>
            </View>
        );
    }
}
