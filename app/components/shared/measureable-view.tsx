import React from 'react';
import { reaction } from 'mobx';
import { observer } from 'mobx-react/native';
import { View } from 'react-native';
import SafeComponent from './safe-component';
import { uiState } from '../states';

interface MeasureableViewProps {
    spotBgColor?: string;
    beacon?: JSX.Element;
    onPress?: Function;
    onMeasure?: Function;
    iconSource?: string;
}

@observer
export default class MeasureableView extends SafeComponent<MeasureableViewProps> {
    retriggerLayout: any;
    ref: any;
    componentDidMount() {
        this.retriggerLayout = reaction(() => uiState.modalShown, this.layout);
    }

    componentWillUnmount() {
        this.retriggerLayout && this.retriggerLayout();
    }

    layout = () => {
        const { onMeasure } = this.props;
        this.ref &&
            this.ref.measure((frameX, frameY, frameWidth, frameHeight, pageX, pageY) => {
                onMeasure &&
                    onMeasure({
                        frameX,
                        frameY,
                        frameWidth,
                        frameHeight,
                        pageX,
                        pageY
                    });
            });
    };

    setRef = ref => {
        this.ref = ref;
    };

    renderThrow() {
        return (
            <View {...this.props} onLayout={this.layout} ref={this.setRef}>
                {this.props.children}
            </View>
        );
    }
}
