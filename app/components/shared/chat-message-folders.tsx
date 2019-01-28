import React from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import FolderInlineContainer from '../files/folder-inline-container';
import { ChatMessageProps } from './chat-message-props';

@observer
export default class ChatMessageFolders extends SafeComponent<ChatMessageProps> {
    get folders() {
        const { folders, chat } = this.props;
        return folders.map(folderId => (
            <FolderInlineContainer key={folderId} folderId={folderId} chat={chat} />
        ));
    }

    renderThrow() {
        const { folders } = this.props;
        if (!folders || !folders.length) return null;
        return <View>{this.folders}</View>;
    }
}
