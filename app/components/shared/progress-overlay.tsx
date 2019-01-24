import React from 'react';
import { observer } from 'mobx-react/native';
import { View, ActivityIndicator, ViewStyle } from 'react-native';
import SafeComponent from './safe-component';

const overlay: ViewStyle = {
    //    backgroundColor: '#00000020',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
};

interface ProgressOverlayProps {
    enabled: boolean;
}

@observer
export default class ProgressOverlay extends SafeComponent<ProgressOverlayProps> {
    renderThrow() {
        if (!this.props.enabled) return null;
        return (
            <View style={overlay}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
}
