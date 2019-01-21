import randomWords from 'random-words';
import capitalize from 'capitalize';
import { observable } from 'mobx';
import { TinyDb } from '../../lib/icebear';
import Chat from '../../lib/peerio-icebear/models/chats/chat';
import fileState from '../files/file-state';
import contactState from '../contacts/contact-state';
import MockContact from './mock-contact';

const randomImages = [
    'https://i.ytimg.com/vi/xC5n8f0fTeE/maxresdefault.jpg',
    'http://cdn-image.travelandleisure.com/sites/default/files/styles/1600x1000/public/1487095116/forest-park-portland-oregon-FORESTBATH0217.jpg?itok=XVmUfPQB',
    'http://cdn-image.travelandleisure.com/sites/default/files/styles/1600x1000/public/1487095116/yakushima-forest-japan-FORESTBATH0217.jpg?itok=mnXAvDq3',
    'http://25.media.tumblr.com/865fb0f33ebdde6360be8576ad6b1978/tumblr_n08zcnLOEf1t8zamio1_250.png',
    'http://globalforestlink.com/wp-content/uploads/2015/07/coniferous.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Grand_Anse_Beach_Grenada.jpg/1200px-Grand_Anse_Beach_Grenada.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5RzVGnDGecjd0b7YqxzvkkRo-6jiraf9FOMQAgChfa4WKD_6c',
    'http://www.myjerseyshore.com/wp-content/themes/directorypress/thumbs//Beaches-Page-Picture.jpg',
    'http://www.shoreexcursionsgroup.com/img/article/region_bermuda2.jpg'
];

class MockChannel extends Chat {
    participants = [];
    adminMap = observable.map();

    get headLoaded() {
        return true;
    }

    get allParticipants() {
        return this.participants;
    }

    get allJoinedParticipants() {
        return this.participants;
    }
    get otherParticipants() {
        return this.participants;
    }

    constructor(name) {
        super();
        TinyDb.userCollection = TinyDb.open('testuser');
        this.id = randomWords({ min: 7, max: 7, join: ':' });
        this.chatHead = {
            name: name || randomWords({ min: 1, max: 4, join: '-' }),
            loaded: true
        };
        this.topic = `${capitalize(randomWords({ min: 2, max: 4, join: ' ' }))}!`;
        this.loaded = true;
        this.isChannel = true;
        this.initParticipants();

        for (let i = 0; i < 10; ++i) {
            this.addInlineImageMessage();
            // this.addRandomMessage();
        }

        // this.addInlineImageMessage();
        // this.addExternalUrlMessage();
    }

    initParticipants() {
        for (let i = 0; i < 8; ++i)
            this.participants.push(contactState.store.addContact(new MockContact()));
        this.addAdmin(this.participants[0]);
        this.addAdmin(this.participants[1]);
    }

    toggleFavoriteState() {
        this.isFavorite = !this.isFavorite;
    }

    toggleMuted() {
        this.isMuted = !this.isMuted;
    }

    removeChannelMember(contact) {
        const i = this.participants.indexOf(contact);
        if (i !== -1) this.participants.splice(i, 1);
    }

    isAdmin(contact) {
        return this.adminMap.has(contact.username);
    }

    addAdmin(contact) {
        this.adminMap.set(contact.username, contact);
    }

    removeAdmin(contact) {
        this.adminMap.delete(contact.username);
    }

    sendInvites(contacts) {
        contacts.forEach(i => {
            if (this.participants.filter(p => p.username === i.username).length === 0) {
                this.participants.push(i);
            }
        });
    }

    createMock(message) {
        const id = randomWords({ min: 1, max: 4, join: '-' });
        let text = message;
        if (!message && message !== false) text = randomWords({ min: 1, max: 4, join: ' ' });
        const sender = this.participants[0];
        const groupWithPrevious = Math.random() > 0.5;
        const externalWebsites = [];
        return { id, text, sender, groupWithPrevious, externalWebsites };
    }

    addRandomMessage(message) {
        const m = this.createMock(message);
        this.messages.push(m);
    }

    addInlineImageMessage() {
        const m = this.createMock(false);
        const name = `${randomWords({ min: 8, max: 12, join: '_' })}.png`;
        const url = randomImages.random();
        m.hasUrls = true;
        m.externalImages = [{ url, name, oversized: true /* , fileId: 1 */ }];
        this.messages.push(m);
    }

    addExternalUrlMessage() {
        const m = this.createMock('https://eslint.org/docs/rules/operator-assignment');
        const name = `${randomWords({ min: 1, max: 2, join: '_' })}.png`;
        const title = capitalize(randomWords({ min: 3, max: 5, join: ' ' }));
        const description = capitalize(randomWords({ min: 5, max: 10, join: ' ' }));
        const url = randomImages.random();
        m.inlineImage = { url, name, title, description, isLocal: false };
        this.messages.push(m);
    }

    addFileMessage() {
        const m = this.createMock(false);
        m.files = [fileState.store.files[0].id];
        this.messages.push(m);
    }

    async addInlineImageMessageFromFile(path) {
        const m = this.createMock(false);
        const name = `${randomWords({ min: 1, max: 2, join: '_' })}.png`;
        const url = path;
        m.inlineImage = { url, name, isLocal: true };
        this.messages.push(m);
    }

    get uploadQueue() {
        const f = fileState.store.files[0];
        f.uploading = true;
        return [f];
    }
}

export default MockChannel;
