import React from 'react';
import { observer } from 'mobx-react/native';
import { View } from 'react-native';
import { computed } from 'mobx';
import SafeComponent from '../shared/safe-component';
import ContactZeroState from './contact-zero-state';
import ProgressOverlay from '../shared/progress-overlay';
import ContactItem from './contact-item';
import ContactSectionHeader from './contact-section-header';
import contactState from './contact-state';
import PlusBorderIcon from '../layout/plus-border-icon';
import { vars } from '../../styles/styles';
import { tx } from '../utils/translator';
import SectionListWithDrawer from '../shared/section-list-with-drawer';
import ListSeparator from '../shared/list-separator';
import zeroStateBeacons from '../beacons/zerostate-beacons';
import { InvitedContact } from '../../lib/peerio-icebear/defs/interfaces';
import { Contact } from '../../lib/icebear';

const INITIAL_LIST_SIZE = 20;

@observer
export default class ContactList extends SafeComponent {
    componentDidMount() {
        contactState.store.uiViewFilter = 'all';
    }

    item({ item }) {
        return <ContactItem contact={item} />;
    }

    header({ section: { key } }) {
        return <ContactSectionHeader key={key} title={key} />;
    }

    @computed
    get sections() {
        const { addedContacts, invitedNotJoinedContacts, uiView, contacts } = contactState.store;
        const sections: { data: (Contact | InvitedContact)[]; key: string }[] = uiView.map(
            ({ letter, items }) => {
                return { data: items, key: letter };
            }
        );
        sections.unshift({ data: [], key: `All (${contacts.length})` });
        sections.unshift({
            data: addedContacts,
            key: `${tx('title_favoriteContacts')} (${addedContacts.length})`
        });
        sections.push({
            data: invitedNotJoinedContacts,
            key: `${tx('title_invitedContacts')} (${invitedNotJoinedContacts.length})`
        });
        return sections;
    }

    listView() {
        return (
            <SectionListWithDrawer
                ItemSeparatorComponent={ListSeparator}
                initialNumToRender={INITIAL_LIST_SIZE}
                sections={this.sections}
                keyExtractor={item => item.username || item.email}
                renderItem={this.item}
                renderSectionHeader={this.header}
            />
        );
    }

    get rightIcon() {
        return (
            <PlusBorderIcon
                action={contactState.fabAction}
                testID="addContactButton"
                beacon={zeroStateBeacons.addContactBeacon}
            />
        );
    }

    get contactListComponent() {
        return !contactState.empty
            ? this.listView()
            : !contactState.loading && <ContactZeroState />;
    }

    renderThrow() {
        return (
            <View style={{ flex: 1, flexGrow: 1, backgroundColor: vars.lightGrayBg }}>
                <View style={{ flex: 1, flexGrow: 1 }}>{this.contactListComponent}</View>
                <ProgressOverlay enabled={contactState.loading} />
            </View>
        );
    }
}
