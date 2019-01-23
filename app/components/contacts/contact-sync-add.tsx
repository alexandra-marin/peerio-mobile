import React from 'react';
import { observer } from 'mobx-react/native';
import { View, FlatList } from 'react-native';
import { observable, action, computed } from 'mobx';
import ActivityOverlay from '../controls/activity-overlay';
import { tx } from '../utils/translator';
import contactState from './contact-state';
import ContactImportItem from './contact-import-item';
import { listHeader, textListTitle, footerContainer, container } from '../../styles/contact-sync';
import ListItem from './contact-sync-list-item';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import BackIcon from '../layout/back-icon';
import routes from '../routes/routes';
import WhiteButtonText from '../buttons/white-text-button';
import BlueButtonText from '../buttons/blue-text-button';

const INITIAL_LIST_SIZE = 10;

@observer
export default class ContactSyncAdd extends SafeComponent {
    @observable contactList = [];
    @observable inProgress = false;
    @observable refresh = 0;

    get leftIcon() {
        return <BackIcon action={() => routes.main.contacts()} />;
    }

    get rightIcon() {
        return <WhiteButtonText text="button_skip" onPress={routes.main.contactSyncInvite} />;
    }

    @computed
    get selectedContacts() {
        return this.contactList.filter(item => item.selected);
    }

    async componentDidMount() {
        this.inProgress = true;
        try {
            const phoneContacts = await contactState.getPhoneContactEmails();
            await this.getPeerioContacts(phoneContacts);
        } catch (e) {
            console.error(e);
        }
        this.inProgress = false;
        if (this.contactList.length === 0) routes.main.contactSyncInvite();
    }

    /**
     * Converts phone contacts into Peerio contacts (if email matches a Peerio account)
     * and pushes to this.contactList
     * @param {array} phoneContacts
     */
    @action
    getPeerioContacts(phoneContacts) {
        const promises = [];
        phoneContacts.forEach(c => {
            promises.push(
                (async () => {
                    try {
                        const contact = await contactState.resolveAndCache(c.email);
                        if (!contact.notFound && !contact.isHidden) {
                            this.contactList.push(new ListItem(contact, c.fullName, true));
                            this.refreshList();
                        }
                    } catch (e) {
                        console.error(e);
                    }
                })()
            );
        });
        return Promise.all(promises);
    }

    @computed
    get allSelected() {
        return this.contactList.every(listItem => listItem.selected);
    }

    @action.bound
    selectAll() {
        this.contactList.forEach(listItem => {
            listItem.selected = true;
        });
        this.refreshList();
    }

    @action.bound
    deselectAll() {
        this.contactList.forEach(listItem => {
            listItem.selected = false;
        });
        this.refreshList();
    }

    @action.bound
    toggleCheckbox(listItem) {
        listItem.selected = !listItem.selected;
        this.refreshList();
    }

    @action.bound
    refreshList() {
        this.refresh++;
    }

    keyExtractor(item, index) {
        return `${item.contact.email}-${index}`;
    }

    contactItem = ({ item }) => {
        return (
            <ContactImportItem
                key={item.contact.username}
                contact={item.contact}
                checked={item.selected}
                onPress={() => this.toggleCheckbox(item)}
            />
        );
    };

    body() {
        return (
            <View style={{ flex: 1 }}>
                <View style={listHeader}>
                    <Text semibold style={textListTitle}>
                        {tx('title_contactsOnPeerio')}
                    </Text>
                    <BlueButtonText
                        text={this.allSelected ? 'title_deselectAll' : 'title_selectAll'}
                        onPress={this.allSelected ? this.deselectAll : this.selectAll}
                    />
                </View>
                <FlatList
                    initialNumToRender={INITIAL_LIST_SIZE}
                    data={this.contactList}
                    renderItem={this.contactItem}
                    extraData={this.refresh}
                    keyExtractor={this.keyExtractor}
                />
            </View>
        );
    }

    @action.bound
    addSelectedContacts() {
        this.selectedContacts.forEach(i =>
            contactState.store.getContactAndSave(i.contact.username)
        );
        routes.main.contactSyncInvite();
    }

    footer() {
        return (
            <View style={footerContainer}>
                <BlueButtonText
                    text="button_add"
                    onPress={this.addSelectedContacts}
                    disabled={this.selectedContacts.length === 0}
                />
            </View>
        );
    }

    renderThrow() {
        return (
            <View style={container}>
                {this.body()}
                {this.footer()}
                <ActivityOverlay large visible={this.inProgress} />
            </View>
        );
    }
}
