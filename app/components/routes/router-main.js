import React from 'react';
import { observable, reaction, action, extendObservable } from 'mobx';
import Router from './router';
import uiState from '../layout/ui-state';
import WelcomeZeroState from '../layout/welcome-zero-state';
import SettingsLevel1 from '../settings/settings-level-1';
import SettingsLevel2 from '../settings/settings-level-2';
import SettingsLevel3 from '../settings/settings-level-3';
import Files from '../files/files';
import FileDetailView from '../files/file-detail-view';
import ContactAdd from '../contacts/contact-add';
import ContactSyncAdd from '../contacts/contact-sync-add';
import ContactSyncInvite from '../contacts/contact-sync-invite';
import ContactView from '../contacts/contact-view';
import ContactList from '../contacts/contact-list';
import ContactListInvite from '../contacts/contact-list-invite';
import {
    fileState,
    chatState,
    settingsState,
    contactState,
    contactAddState,
    invitationState
} from '../states';
// import { enablePushNotifications } from '../../lib/push';
import routes from './routes';
import { fileStore } from '../../lib/icebear';
import preferenceStore from '../settings/preference-store';
import whiteLabelComponents from '../../components/whitelabel/white-label-components';
import { timeoutWithAction } from '../utils/timeouts';
import { transitionAnimation } from '../helpers/animations';

const INACTIVE_DELAY = 5000;

class RouterMain extends Router {
    // current route object
    @observable current = null;
    @observable isBackVisible = false;
    @observable isInputVisible = false;
    @observable blackStatusBar = false;
    @observable currentIndex = 0;
    @observable chatStateLoaded = false;
    @observable fileStateLoaded = false;
    @observable contactStateLoaded = false;
    @observable loading = false;
    @observable invoked = false;
    @observable inactive = false;
    _initialRoute;

    constructor() {
        super();
        routes.main = this;
        reaction(
            () => this.currentIndex && this.route !== 'chats',
            i => {
                this.isBackVisible = i > 0;
            }
        );
        reaction(() => [this.route, this.currentIndex], () => uiState.hideAll());
        this.add('welcomeZeroState', [<WelcomeZeroState />]);
        this.add('files', [<Files />, <FileDetailView />], fileState);
        this.add(
            'chats',
            [<whiteLabelComponents.ChatList />, <whiteLabelComponents.Chat />],
            chatState
        );
        this.add('contacts', [<ContactList />, <ContactView nonModal />], contactState);
        this.add('contactAdd', [<ContactAdd />], contactAddState);
        this.add('contactSyncAdd', [<ContactSyncAdd />], contactAddState);
        this.add('contactSyncInvite', [<ContactSyncInvite />], contactAddState);
        this.add('contactInvite', [<ContactListInvite />], contactAddState);
        this.add(
            'settings',
            [<SettingsLevel1 />, <SettingsLevel2 />, <SettingsLevel3 />],
            settingsState
        );
        this.add('channelInvite', [<whiteLabelComponents.ChannelInvite />], invitationState);

        reaction(
            () => this.current || this.currentIndex,
            () => {
                timeoutWithAction(
                    this,
                    () => {
                        this.inactive = false;
                    },
                    () => {
                        this.inactive = true;
                    },
                    INACTIVE_DELAY
                );
            }
        );
    }

    @action
    initialRoute() {
        this._initialRoute = uiState.isFirstLogin ? 'welcomeZeroState' : 'chats';
        this[this._initialRoute](null, true);
        routes.modal.noticeOfClosure();
    }

    get isInitialRoute() {
        return this.route === this._initialRoute;
    }

    @action
    async initialize() {
        if (this.invoked) return;
        this.invoked = true;
        this.loading = true;
        // if (EN === 'peeriomobile') await enablePushNotifications();
        await preferenceStore.init();
        await chatState.init();
        this.chatStateLoaded = true;
        await fileState.init();
        this.fileStateLoaded = true;
        contactState.init();
        this.contactStateLoaded = true;
        this.loading = false;
        // TODO: refactor all this
        // wait for User object to be loaded
        if (whiteLabelComponents.extendRoutes) whiteLabelComponents.extendRoutes(this);
    }

    add(key, components, routeState) {
        const route = super.add(key, null);
        extendObservable(route, { components }, { components: observable.ref });
        route.routeState = routeState;
        this[key] = route.transition = async (item, suppressTransition, index) => {
            await uiState.hideAll();
            if (this.route !== key) {
                !suppressTransition && transitionAnimation();
                this.onTransition(this.current, false, item);
            }
            this.resetMenus();
            this.current = route;
            this.route = key;

            let newIndex = index;
            if (newIndex === undefined) newIndex = components.length > 1 && item ? 1 : 0;
            if (newIndex !== this.currentIndex) {
                !suppressTransition && transitionAnimation();
            }
            this.currentIndex = newIndex;
            this.onTransition(route, true, item);
            console.log(`router-main: transition to ${this.route}:${this.currentIndex}`);
        };
    }

    get title() {
        return this.current && this.current.routeState ? this.current.routeState.title : null;
    }

    get titleAction() {
        return this.current && this.current.routeState ? this.current.routeState.titleAction : null;
    }

    get pages() {
        return this.current ? this.current.components : [];
    }

    get currentComponent() {
        return this.current && this.current.components.length > this.currentIndex
            ? this.current.components[this.currentIndex].type.prototype
            : {};
    }

    onTransition(route, active, param) {
        try {
            route &&
                route.routeState &&
                route.routeState.onTransition &&
                route.routeState.onTransition(active, param);
        } catch (e) {
            console.error(e);
        }
    }

    @action
    fabAction() {
        console.log(`router-main.js: fab action`);
        this.current && this.current.routeState && this.current.routeState.fabAction();
    }

    @action
    async back() {
        await uiState.hideAll();
        if (this.currentIndex > 0) this.currentIndex--;
        this.onTransition(this.current, true);
        transitionAnimation();
        console.log(`router-main: transition to ${this.route}:${this.currentIndex}`);
    }

    @action
    resetMenus() {
        this.isInputVisible = false;
        this.modalRoute = null;
    }

    @action
    androidBackHandler() {
        if (this.route === 'files') {
            if (fileStore.folderStore.currentFolder.parent) {
                fileStore.folderStore.currentFolder = fileStore.folderStore.currentFolder.parent;
                return true;
            }
            if (fileState.isFileSelectionMode) {
                fileState.exitFileSelect();
                return true;
            }
        }
        if (this.currentIndex > 0) {
            this.back();
            return true;
        } else if (this.isInitialRoute) {
            return false;
        }
        this.initialRoute();
        return true;
    }
}

const routerMain = new RouterMain();

export default routerMain;
