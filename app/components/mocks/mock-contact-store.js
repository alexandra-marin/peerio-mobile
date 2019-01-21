import { observable } from 'mobx';
import MockCurrentUser from './mock-current-user';
import MockContact from './mock-contact';

class MockContactStore {
    addedContacts = [];
    invitedContacts = [];
    invitedNotJoinedContacts = [];
    contacts = [];
    contactsMap = observable.map();

    constructor() {
        for (let i = 0; i < 15; ++i) {
            this.createMock();
        }
    }

    get uiView() {
        return [
            {
                letter: 'A',
                items: this.contacts
            }
        ];
    }

    filter = text => {
        return text ? this.contacts.filter(c => c.username.indexOf(text) !== -1) : this.contacts;
    };

    addContact(contact) {
        if (typeof val === 'string') {
            throw new Error('Mocking string contact adding is not implemented');
        }
        const existingContact = this.contactsMap[contact.username];
        if (existingContact) {
            console.error(`There's already a contact with username ${existingContact.username}`);
            return existingContact;
        }
        this.contacts.push(contact);
        this.contactsMap.set(contact.username, contact);
        return contact;
    }

    createMock() {
        return this.addContact(new MockContact());
    }

    createMockCurrentUser() {
        const contact = new MockCurrentUser();
        return this.addContact(contact);
    }

    getContact(username) {
        const r = this.contactsMap.get(username);
        return r || { username, loading: false, notFound: true };
    }
}

export default MockContactStore;
