import { DeviceEventEmitter, NativeEventEmitter, Platform } from 'react-native';
import { observable, action } from 'mobx';
import RNContacts from 'react-native-contacts';
import RoutedState from '../routes/routed-state';
import { clientApp, contactStore, warnings, User, config } from '../../lib/icebear';
import { tx } from '../utils/translator';
import contactAddState from './contact-add-state';
import chatState from '../messaging/chat-state';
import { popupContactPermission } from '../shared/popups';

class ContactState extends RoutedState {
    _prefix = 'contacts';
    @observable store = contactStore;
    _permissionHandler = null;

    @action
    async init() {
        // TODO: rewrite
        if (this.importContactsInBackground) {
            clientApp.uiUserPrefs.importContactsInBackground = this.importContactsInBackground;
        }
        if (!clientApp.uiUserPrefs.importContactsInBackground) return;
        this.cache = new config.CacheEngine('general_cache', 'id');
        await this.cache.open();
        // if we already ran import, do not reinvite existing contacts
        // and do not reinitialize cache
        this.importedEmails =
            this.importedEmails || (await this.cache.getValue('imported_emails')) || {};
        console.log(`loaded cached imported emails: ${Object.keys(this.importedEmails).length}`);
        // TODO: fix crash when revoking contact permissions on android
        if (Platform.OS !== 'android') {
            await this.syncCachedEmails();
        }
        // TODO: android implementation of RNContacts.subscribeToUpdates
        RNContacts.subscribeToUpdates &&
            RNContacts.subscribeToUpdates(() => {
                console.log(`contact-store.js: subscribed to updates`);
            });
    }

    @action.bound
    async syncCachedEmails() {
        const time = Date.now();
        const emails = await this.getPhoneContactEmails();
        console.log(`got contacts in background: ${emails.length}, ${Date.now() - time}ms`);
        const newEmails = [];
        emails.forEach(({ email }) => {
            if (this.importedEmails[email]) return;
            this.importedEmails[email] = email;
            newEmails.push(email);
            console.log(`got new email to import: ${email}`);
        });
        this.batchInvite(newEmails, true);
        await this.cache.setValue('imported_emails', this.importedEmails);
        console.log(`synced new email cache ${Object.keys(this.importedEmails).length}`);
    }

    @action
    exit() {
        this.routerModal.discard();
        this.clear();
    }

    @observable currentContact = null;
    @observable findUserText = process.env.PEERIO_SEARCH_USERNAME || '';
    @observable loading = false;
    @observable found = [];
    @observable recipients = [];
    @observable recipientsMap = observable.map(null, { deep: false });

    @action.bound
    async showUsernameProfile(username) {
        const contact = await this.resolveAndCache(username);
        if (contact.notFound) {
            console.error(`could not find username ${username}`);
        } else {
            this.contactView(contact);
        }
    }

    @action
    contactView(contact) {
        this.routerMain.resetMenus();
        this.currentContact = contact;
        this.routerModal.contactView();
    }

    findByUsername(username) {
        return this.recipients.filter(i => i.username === username);
    }

    exists(c) {
        return !!this.findByUsername(c.username).length;
    }

    getFiltered(findUserText, exclude = {}) {
        // TODO: it is actually debatable if we need to filter
        // contacts which are already in our contact list
        const result = this.store.whitelabel
            .filter(findUserText || '')
            .filter(c => c.username !== User.current.username && !exclude[c.username]);
        return result.length ? result : this.found.filter(c => !c.loading && !c.notFound);
    }

    @action
    sendTo(contact) {
        chatState.startChat([contact]);
        this.routerModal.discard();
    }

    get title() {
        if (this.routerMain.currentIndex === 0) return tx('title_contacts');
        return this.currentContact ? this.currentContact.username : '';
    }

    // if we have no contacts except User.current
    get empty() {
        const { addedContacts, invitedNotJoinedContacts, contacts } = this.store;
        return (
            !contacts ||
            (contacts.length <= 1 &&
                !contacts.filter(u => User.current.username !== u.username).length &&
                !invitedNotJoinedContacts.length &&
                !addedContacts.length)
        );
    }

    softRequestPermission = async () => {
        const hasPermissions =
            (await this.hasExistingPermissions()) ||
            ((await popupContactPermission(
                tx('title_permissionContacts'),
                tx('title_permissionContactsDescroption')
            )) &&
                (await this.hasPermissions()));
        clientApp.uiUserPrefs.importContactsInBackground = hasPermissions;
        return hasPermissions;
    };

    @action
    requestPermission() {
        console.log('contact-state.js: requesting permissions');
        return new Promise(resolve => {
            // TODO: this is currently android-only
            this.createPermissionHandler(resolve);
            RNContacts.requestPermission((err, permission) => {
                if (err) {
                    console.error(err);
                    resolve('denied');
                    return;
                }
                resolve(permission);
            });
        });
    }

    hasExistingPermissions() {
        return new Promise(resolve => {
            RNContacts.checkPermission((err, permission) => {
                console.log(`${err}, ${permission}`);
                resolve(!!err || permission === 'authorized');
            });
        });
    }

    @action
    hasPermissions() {
        return new Promise(resolve => {
            console.log('contact-state.js: checking permissions');
            RNContacts.checkPermission((err, permission) => {
                console.log(`contact-state.js: permissions are: ${permission}`);
                // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
                if (err) {
                    console.error(err);
                    resolve('denied');
                    return;
                }
                if (permission === 'requested') {
                    this.createPermissionHandler(resolve);
                    return;
                }
                if (permission !== 'authorized') {
                    resolve(this.requestPermission());
                    return;
                }
                resolve(permission);
            });
        }).then(permission => {
            if (permission === 'authorized') {
                console.log('contact-state.js: authorized');
                return true;
            }
            if (permission === 'denied') {
                console.log('contact-state.js: denied');
            }
            return false;
        });
    }

    @action
    createPermissionHandler(resolve) {
        this.resolvePermissionHandler(false);
        this._permissionHandler = data => resolve(data ? 'authorized' : 'denied');
    }

    @action
    resolvePermissionHandler(data) {
        if (this._permissionHandler) {
            this._permissionHandler(data);
            this._permissionHandler = null;
        }
    }

    @action
    getPhoneContacts() {
        // cache contacts so they are not requested each time
        if (this._cachedPhoneContacts) return Promise.resolve(this._cachedPhoneContacts);
        return new Promise(resolve =>
            RNContacts.getAllWithoutPhotos((err, contacts) => {
                if (err) {
                    console.error(err);
                    resolve([]);
                    return;
                }
                this._cachedPhoneContacts = contacts;
                // free memory used by _cachedPhoneContacts after 120s
                setTimeout(() => {
                    this._cachedPhoneContacts = null;
                }, 120000);
                resolve(contacts);
            })
        );
    }

    @action.bound
    async syncContacts() {
        if (!(await this.softRequestPermission())) {
            return;
        }
        this.routerMain.contactSyncAdd();
    }

    @action.bound
    async inviteContacts() {
        if (!(await this.softRequestPermission())) {
            return;
        }
        this.routerMain.contactSyncInvite();
    }

    /**
     * Note: This functionality is currently unused anywhere but might be in the future
     * Automatically add contacts without confirming with user
     * Invites need to be confirmed by user
     */
    @action.bound
    async testImport() {
        if (!(await this.softRequestPermission())) {
            return;
        }
        this.isInProgress = true;
        const contacts = await this.getPhoneContacts();
        const emails = [];
        const hash = {};
        contacts.forEach(contact => {
            const { givenName, familyName, emailAddresses } = contact;
            if (emailAddresses) {
                emailAddresses.forEach(ea => {
                    const { email } = ea;
                    if (email) {
                        emails.push(email);
                        hash[email] = observable({
                            givenName,
                            familyName,
                            email,
                            username: email,
                            fullName: `${givenName} ${familyName}`,
                            color: '#EFEFEF',
                            invited: false
                        });
                    }
                });
            }
        });

        this.store
            .importContacts(emails)
            .then(success => {
                console.log('contact-state.js: import success');
                return success;
            })
            .catch(reject => {
                return reject;
            })
            .then(data => {
                const { imported, notFound } = data;
                warnings.add(tx('title_contactsImported', { count: imported.length }));
                warnings.add(tx('title_contactsProcessed', { count: emails.length }));
                contactAddState.imported = notFound.map(email => hash[email]).filter(i => !!i);
                if (notFound.length === 0) {
                    warnings.add(`No emails found to invite`);
                    return;
                }
                this.routerMain.contactInvite();
            })
            .finally(() => {
                this.isInProgress = false;
            });
    }

    /**
     * Searches users device for contacts which have one or more email addresses
     * @return Object which contains email and fullname pair of each phone contact
     */
    @action
    async getPhoneContactEmails() {
        const phoneContacts = await this.getPhoneContacts();
        const time = Date.now();
        const contactEmails = [];
        phoneContacts.forEach(phoneContact => {
            const { emailAddresses, givenName, familyName } = phoneContact;
            if (emailAddresses) {
                emailAddresses.forEach(emailAddress => {
                    const { email } = emailAddress;
                    if (email)
                        contactEmails.push({ email, fullName: `${givenName} ${familyName}` });
                });
            }
        });
        console.log(`parsed contacts in ${Date.now() - time}ms`);
        return contactEmails;
    }

    _resolveCache = {};

    async resolveAndCache(usernameOrEmail) {
        if (this._resolveCache[usernameOrEmail]) return this._resolveCache[usernameOrEmail];
        const contact = await this.store.whitelabel.getContact(usernameOrEmail);
        this._resolveCache[usernameOrEmail] = contact;
        return contact;
    }

    // TODO replace with bulk
    @action
    batchInvite(emails, isAutoImport) {
        emails.forEach(email => {
            if (!this.importedEmails) this.importedEmails = {};
            this.importedEmails[email] = email;
            this.store.inviteNoWarning(email, undefined, isAutoImport);
        });
    }

    onTransition(active, contact) {
        console.log('contacts on transition');
        this.currentContact = active ? contact : null;
    }

    fabAction = () => {
        console.log(`contact-state.js: fab action`);
        this.routerMain.contactAdd();
    };
}

const contactState = new ContactState();

// for android granting permissions
DeviceEventEmitter.addListener(`ContactPermissionsGranted`, data => {
    console.log(`contact-state.js: permissions result ${data}`);
    contactState.resolvePermissionHandler(data);
});

const emitter = new NativeEventEmitter(RNContacts);
emitter.addListener(`ContactsChanged`, () => {
    console.log(`contact-state.js: contacts changed`);
    contactState.syncCachedEmails();
});

global.contactState = contactState;

export default contactState;
