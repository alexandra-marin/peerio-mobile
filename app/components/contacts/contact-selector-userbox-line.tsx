import React from 'react';
import { View, ViewStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import { vars } from '../../styles/styles';
import ContactSelectorUserBox from './contact-selector-userbox';
import SafeComponent from '../shared/safe-component';
import { Contact } from '../../lib/icebear';

@observer
export default class ContactSelectorUserBoxLine extends SafeComponent<{
    contacts: Contact[];
    onPress: Function;
}> {
    render() {
        const container: ViewStyle = {
            flexGrow: 1,
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: this.props.contacts ? vars.spacing.small.mini2x : 0,
            paddingLeft: vars.spacing.medium.mini2x,
            flexWrap: 'wrap'
        };
        const boxes = this.props.contacts.map((contact, i) => (
            <ContactSelectorUserBox contact={contact} key={i} />
        ));
        return <View style={container}>{boxes}</View>;
    }
}
