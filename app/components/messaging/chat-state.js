import { observable, action, when, reaction } from 'mobx';
import { chatStore, chatInviteStore, clientApp, warnings, contactStore } from '../../lib/icebear';
import RoutedState from '../routes/routed-state';
import sounds from '../../lib/sounds';
import { tx } from '../utils/translator';
import routes from '../routes/routes';
import { promiseWhen } from '../helpers/sugar';
import MockChannel from '../mocks/mock-channel';

const mockChannelNumber = 20;

class ChatState extends RoutedState {
    @observable store = chatStore;
    @observable chatInviteStore = chatInviteStore;
    @observable collapseChannels = false;
    @observable selfNewMessageCounter = 0;
    LIMIT_PEOPLE_DM = 1;

    // Only one list can be shown at a time
    @observable collapseFirstChannelInfoList = false;

    // to be able to easily refactor, keep the name "chatStore"
    get chatStore() {
        return this.store;
    }

    _loading = true;

    constructor() {
        super();
        this.chatStore.events.on(this.chatStore.EVENT_TYPES.messagesReceived, () => {
            console.log('chat-state.js: messages received');
            sounds.received();
        });

        reaction(
            () => this.chatStore.activeChat,
            chat => {
                if (chat) {
                    console.log(`chat-store switched to ${chat.id}`);
                    console.log(`chat-store: loading ${chat.id}`);
                    this.loading = false;
                } else if (this.routerMain && this.routerMain.route === 'chats')
                    this.routerMain.chats();
            },
            { fireImmediately: true }
        );
    }

    @action
    async init() {
        const { store } = this;
        await promiseWhen(() => store.loaded);
    }

    get currentChat() {
        return this.chatStore.activeChat;
    }

    @observable _loading = true;

    get loading() {
        const c = this.currentChat;
        return (
            this._loading ||
            this.chatStore.loading ||
            (c && (c.loadingMeta || c.loadingInitialPage))
        );
    }

    set loading(v) {
        this._loading = v;
    }

    titleFromChat = (chat, defaultName) => {
        if (defaultName) return tx('title_chats');
        return chat ? chat.name : '';
    };

    get title() {
        return this.titleFromChat(this.currentChat, this.routerMain.currentIndex === 0);
    }

    activate(chat) {
        if (chat.id) {
            console.log(`chat-state.js: activating chat ${chat.id}`);
            this.chatStore.activate(chat.id);
        }
    }

    onTransition(active, c) {
        console.log(`chat-state.js: loading all chats`);
        clientApp.isInChatsView = active && !!c;
        this.loading = c && c.loadingMeta;
        if (active) {
            when(
                () => !this.chatStore.loading,
                () => {
                    if (!this.chatStore.chats.length) this.loading = false;
                    c && this.activate(c);
                    console.log(
                        `chat-state.js: active: ${c && c.active}, isFocused: ${
                            clientApp.isFocused
                        }, isInChatsView: ${clientApp.isInChatsView}`
                    );
                }
            );
        }
    }

    get unreadMessages() {
        let r = 0;
        this.chatStore.chats.forEach(c => {
            r += c.unreadCount;
        });
        return r;
    }

    get canSend() {
        return this.currentChat && this.currentChat.id && !this.currentChat.loadingMessages;
    }

    get canSendAck() {
        return this.canSend && this.currentChat.canSendAck;
    }

    get canSendJitsi() {
        return this.canSend && this.currentChat.canSendJitsi;
    }

    @action
    async startChat(recipients, isChannel = false, name, purpose) {
        try {
            this.loading = true;
            const chat = await this.store.startChat(recipients, isChannel, name, purpose);
            this.loading = false;
            this.routerMain.chats(chat, true);
            return chat;
        } catch (e) {
            this.loading = false;
            warnings.add(e.message);
            console.error(e);
            return null;
        }
    }

    @action
    async startChatAndShareFiles(recipients, file) {
        if (!file) return;
        await this.store.startChatAndShareFiles(recipients, file);
        this.routerMain.chats(this.store.activeChat, true);
    }

    @action
    async addMessage(legacyText, richText) {
        const { currentChat } = this;
        if (!this.currentChat) return;
        this.selfNewMessageCounter++;
        try {
            if (richText) {
                currentChat.sendRichTextMessage(richText, legacyText);
            } else {
                currentChat.sendMessage(legacyText);
            }
        } catch (e) {
            console.error(e);
            sounds.destroy();
        }
    }

    @action
    shareFilesAndFolders(filesAndFolders) {
        this.selfNewMessageCounter++;
        this.currentChat &&
            filesAndFolders &&
            filesAndFolders.length &&
            this.currentChat.shareFilesAndFolders(filesAndFolders).catch(sounds.destroy);
    }

    @action
    addVideoMessage(link) {
        this.selfNewMessageCounter++;
        this.currentChat && this.currentChat.createVideoCall(link);
    }

    @action
    addAck() {
        this.selfNewMessageCounter++;
        this.currentChat && this.currentChat.sendAck().catch(sounds.destroy);
    }

    get titleAction() {
        if (this.routerMain.currentIndex === 0) return null;
        return this.currentChat
            ? () => {
                  this.currentChat.isChannel
                      ? this.routerModal.channelInfo()
                      : this.routerModal.chatInfo();
              }
            : null;
    }

    fabAction() {
        console.log(`chat-state.js: fab action`);
        routes.modal.compose();
    }

    @action.bound
    testFillWithMockChannels() {
        for (let i = 0; i < mockChannelNumber; ++i) {
            this.chatStore.chats.push(
                new MockChannel(`${Math.floor(Math.random() * 1000) + 1000}`)
            );
        }
    }

    @action
    startDMWithUsername(username) {
        this.startChat([contactStore.getContact(username)]);
    }

    @action
    async addContactAndStartChat(username) {
        const contact = await contactStore.whitelabel.getContact(username);
        this.startChat([contact]);
    }
}

const chatState = new ChatState();
global.chatState = chatState;
export default chatState;
