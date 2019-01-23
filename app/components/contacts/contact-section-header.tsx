import React from 'react';
import { observer } from 'mobx-react/native';
import { View, ViewStyle } from 'react-native';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import Text from '../controls/custom-text';

const style: ViewStyle = {
    height: vars.sectionHeaderHeight,
    justifyContent: 'center',
    backgroundColor: vars.darkBlueBackground05
};

const textStyle = {
    marginLeft: vars.spacing.large.mini,
    color: vars.txtMedium
};

interface ContactSectionHeaderProps {
    title: string;
}
@observer
export default class ContactSectionHeader extends SafeComponent<ContactSectionHeaderProps> {
    renderThrow() {
        const { title } = this.props;
        if (!title) return null;
        return (
            <View style={style}>
                <Text bold style={textStyle}>
                    {title}
                </Text>
            </View>
        );
    }
}
