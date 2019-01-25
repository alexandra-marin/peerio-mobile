import React, { Component } from 'react';
import { observer } from 'mobx-react/native';
import { View, ViewStyle } from 'react-native';
import { vars } from '../../styles/styles';
import testLabel from '../helpers/test-label';

interface CommonHeaderProps {
    outerStyle: any;
    testID: any;
    titleComponent: React.ReactNode;
    leftIcon: React.ReactNode;
    rightIcon: React.ReactNode;
    unique?: React.ReactText;
}

@observer
export default class CommonHeader extends Component<CommonHeaderProps> {
    render() {
        const bgContainerStyle = [
            {
                paddingTop: vars.statusBarHeight
            },
            this.props.outerStyle
        ];

        const containerStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: vars.headerHeight
        };
        return (
            <View style={bgContainerStyle} {...testLabel(this.props.testID)} accessible={false}>
                <View style={containerStyle} key={this.props.unique}>
                    {this.props.titleComponent}
                    <View style={{ position: 'absolute', left: 0 }}>{this.props.leftIcon}</View>
                    <View style={{ position: 'absolute', right: 0 }}>{this.props.rightIcon}</View>
                </View>
            </View>
        );
    }
}
