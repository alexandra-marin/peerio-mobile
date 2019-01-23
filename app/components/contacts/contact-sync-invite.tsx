import React from 'react';
import { observer } from 'mobx-react/native';
import { View, FlatList } from 'react-native';
import { observable, action, computed } from 'mobx';
import ActivityOverlay from '../controls/activity-overlay';
import { listHeader, textListTitle, footerContainer, container } from '../../styles/contact-sync';
import { tx } from '../utils/translator';
import contactState from './contact-state';
import ContactImportItem from './contact-import-item';
import snackbarState from '../snackbars/snackbar-state';
import SearchBar from '../controls/search-bar';
import icons from '../helpers/icons';
import { vars } from '../../styles/styles';
import uiState from '../layout/ui-state';
import ListItem from './contact-sync-list-item';
import Text from '../controls/custom-text';
import imagePopups from '../shared/image-popups';
import SafeComponent from '../shared/safe-component';
import BackIcon from '../layout/back-icon';
import WhiteButtonText from '../buttons/white-text-button';
import BlueButtonText from '../buttons/blue-text-button';

import routes from '../routes/routes';

const _ = require('lodash');
const iconClear = require('../../assets/file_icons/ic_close.png');

const INITIAL_LIST_SIZE = 10;

@observer
export default class ContactSyncInvite extends SafeComponent {
    @observable contactList = [];
    @observable searchBarValue = '';
    @observable refresh = 0;
    @observable inProgress = false;
    _searchTimeout: NodeJS.Timeout;

    get leftIcon() {
        return <BackIcon action={() => routes.main.contacts()} />;
    }

    get rightIcon() {
        return <WhiteButtonText text="button_skip" onPress={routes.main.contact} />;
    }

    get layoutTitle() {
        return tx('title_inviteContacts');
    }

    @computed
    get selectedContacts() {
        return this.contactList.filter(item => item.selected);
    }

    @computed
    get selectedEmails() {
        const selectedEmails = [];
        this.contactList.forEach(listItem => {
            if (listItem.selected) selectedEmails.push(listItem.contact.username);
        });
        return selectedEmails;
    }

    silentInvite(onlyNonSelected) {
        const silentSyncEmails = this.contactList
            .filter(li => (onlyNonSelected ? !li.selected : true))
            .map(li => li.contact.username);
        contactState.batchInvite(silentSyncEmails, true);
    }

    async componentDidMount() {
        this.inProgress = true;
        try {
            const phoneContacts = await contactState.getPhoneContactEmails();
            console.log(`got phoneContacts ${phoneContacts.length}`);
            await this.getNonPeerioContacts(phoneContacts);
            console.log(`got contact list`);
        } catch (e) {
            console.error(e);
        }
        this.inProgress = false;
    }

    /**
     * TODO Use bulk operation
     * Fills this.contactList with phone contacts who are not on Peerio
     * @param {array} phoneContacts
     */
    @action
    getNonPeerioContacts(phoneContacts) {
        const promises = [];
        phoneContacts.forEach(c => {
            promises.push(
                (async () => {
                    try {
                        const contact = await contactState.resolveAndCache(c.email);
                        if (contact.notFound || contact.isHidden) {
                            const listItem = new ListItem(contact, c.fullName, false);
                            listItem.visible = true;
                            this.contactList.push(listItem);
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

    @action.bound
    onChangeSearchBarText(text) {
        this.searchBarValue = text.trim();
        if (this._searchTimeout) {
            clearTimeout(this._searchTimeout);
            this._searchTimeout = null;
        }
        if (!this.searchBarValue) {
            this.clearSearch();
            return;
        }
        this._searchTimeout = setTimeout(() => this.filter(text), 500);
    }

    @action.bound
    clearSearch() {
        this.searchBarValue = '';
        this.contactList.forEach(({ index, array }) => {
            array[index].visible = true;
        });
        this.refreshList();
    }

    @action.bound
    filter(query) {
        const regex = new RegExp(_.escapeRegExp(query), 'i');
        this.contactList.forEach(listItem => {
            const { username } = listItem.contact;
            listItem.visible = regex.test(username); // test for matching
        });
        this.refreshList();
    }

    header() {
        const leftIcon = icons.plain('search', vars.iconSize, vars.black12);
        const rightIcon = this.searchBarValue
            ? icons.imageButton(iconClear, this.clearSearch, null, vars.opacity54)
            : null;
        return (
            <View>
                <SearchBar
                    textValue={this.searchBarValue}
                    placeholderText={tx('title_searchContacts')}
                    onChangeText={text => {
                        this.onChangeSearchBarText(text);
                    }}
                    leftIcon={leftIcon}
                    rightIcon={rightIcon}
                />
            </View>
        );
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
        this.clearSearch();
    }

    @action.bound
    deselectAll() {
        this.contactList.forEach(listItem => {
            listItem.selected = false;
        });
        this.clearSearch();
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
        if (!item.visible) return null;
        return (
            <ContactImportItem
                key={item.phoneContactName}
                hideAvatar
                contact={item.contact}
                phoneContactName={item.phoneContactName}
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
                        {tx('title_inviteByEmail')}
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
    async inviteSelectedContacts() {
        const confirmed = await imagePopups.confirmInvites(
            tx('title_confirmEmailInvite', { numSelectedContacts: this.selectedContacts.length })
        );
        if (await confirmed) {
            contactState.batchInvite(this.selectedEmails);
            const contactsAdded = contactState.store.addedContacts.length;
            // TODO use contact store for invites sent
            const contactsInvited = this.selectedContacts.length;
            let message = '';
            if (contactsAdded && contactsInvited) {
                message = tx('title_contactsAddedAndInvited', { contactsAdded, contactsInvited });
            } else if (contactsAdded && !contactsInvited) {
                message = tx('title_contactsAdded', { contactsAdded });
            } else if (!contactsAdded && contactsInvited) {
                message = tx('title_contactsInvited', { contactsInvited });
            }
            if (message) snackbarState.pushTemporary(message);
            this.silentInvite(true);
            routes.main.contacts();
        }
    }

    footer() {
        if (uiState.keyboardHeight) return null;
        return (
            <View style={footerContainer}>
                <BlueButtonText
                    text={
                        this.selectedContacts.length === 1
                            ? 'button_sendInvite'
                            : 'button_sendInvites'
                    }
                    onPress={this.inviteSelectedContacts}
                    disabled={this.selectedContacts.length === 0}
                />
            </View>
        );
    }

    renderThrow() {
        return (
            <View style={container}>
                {this.header()}
                {this.body()}
                {this.footer()}
                <ActivityOverlay large visible={this.inProgress} />
            </View>
        );
    }
}
