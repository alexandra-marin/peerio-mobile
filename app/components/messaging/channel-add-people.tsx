import React from 'react';
import { View } from 'react-native';
import { computed } from 'mobx';
import { observer } from 'mobx-react/native';
import { tx } from '../utils/translator';
import ContactSelectorUniversal from '../contacts/contact-selector-universal';
import chatState from '../messaging/chat-state';
import SafeComponent from '../shared/safe-component';

const fillView = { flex: 1, flexGrow: 1 };

@observer
export default class ChannelAddPeople extends SafeComponent {
    @computed
    get excluded() {
        const excluded = {};
        chatState.currentChat.allJoinedParticipants.forEach(i => {
            excluded[i.username] = i;
            console.log(`excluded: ${i.username}`);
        });
        return excluded;
    }

    addPeople = contacts => {
        const { excluded } = this;
        chatState.currentChat.addParticipants(contacts.filter(c => !excluded[c.username]));
    };

    render() {
        return (
            <View style={fillView}>
                <ContactSelectorUniversal
                    onExit={() => chatState.routerModal.discard()}
                    action={this.addPeople}
                    title={tx('title_addPeopleToRoom')}
                    inputPlaceholder={tx('title_TryUsernameOrEmail')}
                />
            </View>
        );
    }
}
