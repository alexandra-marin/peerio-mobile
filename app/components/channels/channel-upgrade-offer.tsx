import React, { Component } from 'react';
import { View, Platform, ViewStyle, TextStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import { User } from '../../lib/icebear';
import { T } from '../utils/translator';
import settingsState from '../settings/settings-state';
import { vars } from '../../styles/styles';
import { gradient } from '../controls/effects';
import Text from '../controls/custom-text';
import WhiteButtonText from '../buttons/white-text-button';

@observer
export default class ChannelUpgradeOffer extends Component {
    render() {
        if (User.current.channelsLeft > 0) return null;

        const container: ViewStyle = {
            flexGrow: 1,
            flex: 1,
            flexDirection: 'row',
            paddingVertical: vars.spacing.small.midi,
            paddingHorizontal: vars.spacing.medium.mini2x
        };

        const offerStyle = {
            maxWidth: '75%',
            marginRight: vars.spacing.medium.midi2x
        };

        const offerTextStyle: TextStyle = {
            color: 'white',
            backgroundColor: 'transparent',
            fontSize: vars.font.size12,
            lineHeight: 20,
            textAlign: 'justify',
            // Padding is due to React JS bug with lineHeight on android
            paddingBottom: Platform.OS === 'android' ? vars.spacing.small.midi : 0
        };

        const buttonStyle: ViewStyle = {
            maxWidth: '25%',
            justifyContent: 'center',
            marginTop: vars.spacing.medium.midi
        };

        return gradient(
            { height: 100, alignItems: 'center' },
            <View style={container}>
                <View style={offerStyle}>
                    <Text style={offerTextStyle}>
                        <T k="title_channelUpgradeOffer" />
                    </Text>
                </View>
                <View style={buttonStyle}>
                    <WhiteButtonText
                        noPadding
                        text="button_upgrade"
                        onPress={settingsState.upgrade}
                        extraTextStyle={{ fontWeight: '600' }}
                    />
                </View>
            </View>
        );
    }
}
