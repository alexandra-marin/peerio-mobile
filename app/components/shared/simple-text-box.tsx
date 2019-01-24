import React from 'react';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import uiState from '../layout/ui-state';
import TextInputUncontrolled from '../controls/text-input-uncontrolled';

interface SimpleTextBoxProps {
    onBlur;
    onFocus;
}

@observer
export default class SimpleTextBox extends SafeComponent<SimpleTextBoxProps> {
    _ref: any;
    focus() {
        this._ref.focus();
    }

    onBlur = () => {
        uiState.focusedTextBox = null;
        if (this.props.onBlur) this.props.onBlur();
    };

    onFocus = () => {
        uiState.focusedTextBox = this._ref;
        if (this.props.onFocus) this.props.onBlur();
    };

    onLayout = () => {
        if (!this._ref.offsetY) {
            this._ref.measure((_frameX, _frameY, _frameWidth, frameHeight, _pageX, pageY) => {
                this._ref.offsetY = pageY;
                this._ref.offsetHeight = frameHeight;
            });
        }
    };

    setRef = ref => {
        this._ref = ref;
    };

    renderThrow() {
        return (
            <TextInputUncontrolled
                {...this.props}
                underlineColorAndroid="transparent"
                onBlur={this.onBlur}
                onFocus={this.onFocus}
                onLayout={this.onLayout}
                ref={this.setRef}
            />
        );
    }
}
