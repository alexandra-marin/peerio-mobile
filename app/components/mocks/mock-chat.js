import { observable } from 'mobx';
import MockChannel from './mock-channel';
import MockContact from './mock-contact';
import contactState from '../contacts/contact-state';

class MockChat extends MockChannel {
    @observable isChannel = false;

    initParticipants() {
        // exactly one participant
        this.participants.push(contactState.store.addContact(new MockContact()));
    }
}

export default MockChat;
