import React from 'react';
import { observer } from 'mobx-react/native';
import { View } from 'react-native';
import SafeComponent from '../shared/safe-component';
import InputMain from './input-main';
import chatState from '../messaging/chat-state';
import FileUploadProgress from '../files/file-upload-progress';
import FileUploadActionSheet from '../files/file-upload-action-sheet';
import { vars } from '../../styles/styles';
import inputMessageParser from '../messaging/input-message-parser';

@observer
export default class InputMainContainer extends SafeComponent {
    send = v => {
        const message = v;
        if (!message || !message.length) {
            this.sendAck();
            return;
        }
        let richTextJSON;
        try {
            richTextJSON = inputMessageParser(message);
        } catch (e) {
            console.error(e);
        }
        chatState.addMessage(message, richTextJSON);
    };

    sendAck = () => chatState.addAck();

    plus = () =>
        FileUploadActionSheet.show({
            inline: true,
            createFolder: false,
            disableFolders: chatState.chatStore.activeChat.isChannel
        });

    uploadQueue() {
        const chat = chatState.currentChat;
        const q = (chat && chat.uploadQueue) || [];
        return q.map(f => <FileUploadProgress file={f} key={f.fileId} transparentOnFinishUpload />);
    }

    renderThrow() {
        const outer = {
            backgroundColor: vars.white
        };
        const s = {
            backgroundColor: vars.white,
            borderTopColor: vars.separatorColor,
            borderTopWidth: 1
        };
        return (
            <View style={outer}>
                <View>{this.uploadQueue()}</View>
                <View style={s}>
                    <InputMain
                        {...this.props}
                        plus={this.plus}
                        sendAck={this.sendAck}
                        send={this.send}
                    />
                </View>
            </View>
        );
    }
}
