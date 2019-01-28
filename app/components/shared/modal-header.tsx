import React, { Component } from 'react';
import { observer } from 'mobx-react/native';
import Text from '../controls/custom-text';
import CommonHeader from './common-header';
import { vars } from '../../styles/styles';
import { tx } from '../utils/translator';
import { TextStyle } from 'react-native';

interface ModalHeaderProps {
    outerStyle?: any;
    fontSize?: number;
    title: any;
    leftIcon: any;
    rightIcon: any;
    testID: string;
}

@observer
export default class ModalHeader extends Component<ModalHeaderProps> {
    render() {
        const { leftIcon, rightIcon, testID } = this.props;
        const outerStyle = [
            {
                backgroundColor: vars.darkBlueBackground15,
                marginBottom: vars.spacing.small.midi2x
            },
            this.props.outerStyle
        ];

        const textStyle: TextStyle = {
            textAlign: 'center',
            flexGrow: 1,
            flexShrink: 1,
            fontSize: this.props.fontSize || vars.font.size20,
            color: vars.textBlack54
        };

        const titleComponent = (
            <Text semibold style={textStyle}>
                {tx(this.props.title)}
            </Text>
        );
        return <CommonHeader {...{ titleComponent, leftIcon, rightIcon, outerStyle, testID }} />;
    }
}
