import React from 'react';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import { View, Linking } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';

const peerioIsClosing = 'Peerio is closing on July 15th, 2019';
const peerioIsClosingLink =
    'https://www.peerio.com/blog/posts/peerio-has-been-acquired-by-workjam-the-leading-digital-workplace-platform/';

@observer
export default class PeerioClosingBottomBanner extends SafeComponent {
    @action.bound
    onPress() {
        Linking.openURL(peerioIsClosingLink);
    }

    renderThrow() {
        if (!this.props.hide) {
            // routes.app.route === 'loginWelcome') return null;
            // this.add('loginWelcomeBack', LoginWelcomeBack);
            const s = {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 48,
                backgroundColor: vars.red,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            };
            const textStyle = {
                flex: 1,
                flexGrow: 1,
                flexShrink: 1,
                color: vars.white,
                textAlign: 'center'
            };
            return (
                <View style={s}>
                    <Text style={textStyle} bold onPress={this.onPress}>
                        {peerioIsClosing}
                    </Text>
                </View>
            );
        }
        return null;
    }
}
