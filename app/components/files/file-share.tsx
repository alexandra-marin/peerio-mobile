import React, { Component } from 'react';
import { observer } from 'mobx-react/native';
import ContactSelectorUniversal from '../contacts/contact-selector-universal';
import chatState from '../messaging/chat-state';
import { File } from '../../lib/peerio-icebear/models';

@observer
export default class FileShare extends Component<{ file: File }> {
    exit = () => chatState.routerModal.discard();
    action = contacts => chatState.startChatAndShareFiles(contacts, this.props.file);

    render() {
        return (
            <ContactSelectorUniversal
                onExit={this.exit}
                action={this.action}
                title="title_shareWith"
                inputPlaceholder="title_TryUsernameOrEmail"
                limit={chatState.LIMIT_PEOPLE_DM}
            />
        );
    }
}
