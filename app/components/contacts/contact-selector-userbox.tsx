import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { observer } from 'mobx-react/native';
import { vars } from '../../styles/styles';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { Contact } from '../../lib/icebear';

const style: ViewStyle = {
    backgroundColor: vars.peerioBlue,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    margin: vars.spacing.small.mini2x,
    padding: 0,
    paddingLeft: vars.spacing.small.maxi2x,
    height: 32,
    overflow: 'hidden'
};
const textStyle = {
    color: 'white'
};

@observer
export default class ContactSelectorUserBox extends SafeComponent<{ contact: Contact }> {
    render() {
        const { contact } = this.props;
        return (
            <TouchableOpacity pressRetentionOffset={vars.retentionOffset} {...this.props}>
                <View style={style}>
                    <Text style={textStyle}>{contact.username}</Text>
                    <Icon
                        style={{
                            paddingRight: vars.spacing.small.mini2x,
                            marginLeft: vars.spacing.small.midi2x
                        }}
                        name="cancel"
                        size={vars.iconSize}
                        color="white"
                    />
                </View>
            </TouchableOpacity>
        );
    }
}
