import React from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';

@observer
export default class ListSeparator extends SafeComponent {
    renderThrow() {
        return <View style={{ borderBottomWidth: 1, borderBottomColor: vars.black12 }} />;
    }
}
