import React from 'react';
import { observer } from 'mobx-react/native';
import { View } from 'react-native';
import { signupStyles } from '../../styles/styles';
import SafeComponent from './safe-component';

interface IntroStepIndicatorProps {
    current: number;
    max: number;
}

@observer
export default class IntroStepIndicator extends SafeComponent<IntroStepIndicatorProps> {
    renderThrow() {
        const { current, max } = this.props;
        const items = [];
        for (let i = 0; i < max; ++i) {
            const s = [];
            if (i <= current) {
                s.push(signupStyles.filledProgressBar);
            } else {
                s.push(signupStyles.emptyProgressBar);
            }
            if (i < max - 1) {
                s.push({ marginHorizontal: 1 });
            }
            items.push(<View style={s} key={i} />);
        }
        return <View style={signupStyles.progressBarContainer}>{items}</View>;
    }
}
