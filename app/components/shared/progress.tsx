import React from 'react';
import { observer } from 'mobx-react/native';
import { observable, action } from 'mobx';
import { View } from 'react-native';
import SafeComponent from './safe-component';
import { vars } from '../../styles/styles';

interface ProgressProps {
    value: any;
    max: any;
    hidden: any;
}

@observer
export default class Progress extends SafeComponent<ProgressProps> {
    @observable width = 0;

    get currentWidth() {
        const { value, max } = this.props;
        const { width } = this;
        if (!width || !max) return 0;
        return (width * value) / max;
    }

    @action.bound
    layout(evt) {
        this.width = evt.nativeEvent.layout.width;
    }

    renderThrow() {
        const { value, max } = this.props;
        if (!max) return null;
        if (value >= max) return null;
        const height = vars.progressBarHeight;

        const pbContainer = {
            marginTop: -height,
            height,
            backgroundColor: vars.progressBarBackground,
            opacity: 1
        };
        const pbProgress = {
            height,
            backgroundColor: vars.peerioTeal,
            borderWidth: 0,
            borderColor: 'red',
            width: this.currentWidth
        };

        return (
            <View style={pbContainer} onLayout={this.layout}>
                <View style={pbProgress} />
            </View>
        );
    }
}
