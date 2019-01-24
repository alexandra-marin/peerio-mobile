import React from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import FileInlineProgress from '../files/file-inline-progress';
import fileState from '../files/file-state';

interface ChatMessageFilesProps {
    message: any;
    chat: any;
    onFileAction: any;
    onLegacyFileAction: any;
}

@observer
export default class ChatMessageFiles extends SafeComponent<ChatMessageFilesProps> {
    get files() {
        const { message, chat } = this.props;

        const allFiles =
            message.files.map(id => fileState.store.getByIdInChat(id, chat.id)).filter(f => f) ||
            [];

        const nonImageFiles = allFiles.filter(f => !f.isImage) || [];

        const filesToRender = nonImageFiles.map(f => f.fileId);
        return filesToRender;
    }

    get renderFiles() {
        const { onFileAction, onLegacyFileAction, chat } = this.props;
        return this.files.map(file => (
            <FileInlineProgress
                key={file}
                file={file}
                onActionSheet={onFileAction}
                onLegacyFileAction={onLegacyFileAction}
                chatId={chat.id}
            />
        ));
    }

    renderThrow() {
        const { message } = this.props;
        if (!message.files || !message.files.length) return null;

        return <View>{this.renderFiles}</View>;
    }
}
