import React, { Component } from 'react';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import { TouchableWithoutFeedback } from 'react-native';
import uiState from '../layout/ui-state';
import { vars } from '../../styles/styles';

@observer
export default class DebugMenuTrigger extends Component {
    countDebugPress = 0;

    @action.bound
    handleTitlePress() {
        this.countDebugPress++;
        if (this.countDebugPress >= 10) {
            uiState.showDebugMenu = true;
            this.countDebugPress = 0;
        }
    }

    render() {
        return (
            <TouchableWithoutFeedback
                pressRetentionOffset={vars.retentionOffset}
                onPress={this.handleTitlePress}>
                {this.props.children}
            </TouchableWithoutFeedback>
        );
    }
}
