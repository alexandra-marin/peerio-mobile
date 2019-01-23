import React from 'react';
import { observer } from 'mobx-react/native';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import icons from '../helpers/icons';
import { vars } from '../../styles/styles';
import { popupYes } from '../shared/popups';
import { tx } from '../utils/translator';

const container: ViewStyle = {
    flexDirection: 'row',
    borderRadius: 8,
    borderColor: vars.txtAlert,
    borderWidth: 1,
    borderLeftWidth: 10,
    backgroundColor: vars.lightGrayBg,
    alignItems: 'center',
    marginVertical: vars.spacing.small.midi,
    paddingVertical: vars.spacing.medium.mini,
    paddingHorizontal: vars.spacing.small.midi2x
};

@observer
export default class FileSignatureError extends SafeComponent {
    renderThrow() {
        const text = {
            color: vars.txtAlert,
            marginLeft: vars.spacing.small.midi
        };

        const showAlert = () =>
            popupYes(tx('title_invalidFileSignature'), null, tx('error_invalidFileSignature'));

        return (
            <TouchableOpacity onPress={showAlert} pressRetentionOffset={vars.retentionOffset}>
                <View style={container}>
                    {icons.plainalert('error-outline')}
                    <Text style={text}>{tx('error_invalidFileSignature')}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}
