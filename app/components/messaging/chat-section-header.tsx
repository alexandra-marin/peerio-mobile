import React from 'react';
import { observer } from 'mobx-react/native';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import chatState from './chat-state';
import testLabel from '../helpers/test-label';
import { tx, LocalizationStrings } from '../utils/translator';

export interface ChatSectionHeaderProps {
    title: keyof LocalizationStrings;
    collapsible?: boolean;
    state?: string;
}

@observer
export default class ChatSectionHeader extends SafeComponent<ChatSectionHeaderProps> {
    renderThrow() {
        const { title, collapsible } = this.props;
        const style = {
            paddingLeft: vars.spacing.medium.midi,
            paddingRight: vars.spacing.medium.mini2x,
            height: vars.sectionHeaderHeight,
            justifyContent: 'space-between',
            backgroundColor: vars.darkBlueBackground05,
            flexDirection: 'row',
            alignItems: 'center'
        };

        const textStyle = {
            fontSize: vars.font.size18,
            color: vars.txtMedium
        };

        const action = collapsible
            ? () => {
                  chatState[this.props.state] = !chatState[this.props.state];
              }
            : null;
        return (
            <TouchableOpacity
                {...testLabel(title)}
                {...this.props}
                pressRetentionOffset={vars.retentionOffset}
                style={style as ViewStyle}
                onPress={action}
                disabled={!collapsible}>
                <Text semibold style={textStyle}>
                    {tx(title)}
                </Text>
                {collapsible && (
                    <Icon
                        name={chatState[this.props.state] ? 'arrow-drop-down' : 'arrow-drop-up'}
                        size={24}
                        style={{ color: vars.txtDark }}
                    />
                )}
            </TouchableOpacity>
        );
    }
}
