import React from 'react';
import { View, TouchableOpacity, ViewStyle, GestureResponderEvent } from 'react-native';
import { observable } from 'mobx';
import { observer } from 'mobx-react/native';
import Text from '../controls/custom-text';
import { tx } from '../utils/translator';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import SafeComponent from '../shared/safe-component';
import ButtonText from '../controls/button-text';
import popupState from '../layout/popup-state';
import routes from '../routes/routes';
import fileState, { FilePreviewProps } from './file-state';
import { User, fileHelpers, chatStore } from '../../lib/icebear';
import FilePreview from './file-preview';
import { File } from '../../lib/peerio-icebear/models';

// TODO Workaround negative margin
const buttonContainer: ViewStyle = {
    flex: 0,
    marginTop: vars.spacing.large.mini,
    marginBottom: -12,
    marginRight: -12,
    flexDirection: 'row',
    justifyContent: 'flex-end'
};

const shareContainer: ViewStyle = {
    marginVertical: vars.spacing.medium.mini,
    flexDirection: 'row',
    alignItems: 'center'
};

const shareTextStyle = {
    fontSize: vars.font.size12,
    color: vars.extraSubtleText,
    marginBottom: vars.spacing.small.mini
};

const recipientStyle = {
    fontSize: vars.font.size14,
    color: vars.lighterBlackText
};

export interface FileSharePreviewProps {
    file?: File;
    files?: Array<File>;
    onSubmit: Function;
    onChooseRecipients: (event: GestureResponderEvent) => void;
    state: { fileName: string; path: string; name: string; ext: string };
    onCancel?: Function;
}

@observer
export default class FileSharePreview extends SafeComponent<FileSharePreviewProps> {
    static popup(path, fileName) {
        console.debug(`path: ${path}, filename: ${fileName}`);
        fileState.previewFile = observable({
            path,
            fileName,
            ext: fileHelpers
                .getFileExtension(fileName || path)
                .trim()
                .toLowerCase(),
            name: fileHelpers.getFileNameWithoutExtension(fileName || path),
            // message to send with shared file
            message: '',
            // chat in which we uploading the file
            chat: chatStore.activeChat || {},
            // contact to be selected in "change recipient"
            contact: {}
        });
        return new Promise<FilePreviewProps | false>(resolve => {
            const showPopup = () =>
                popupState.showPopup({
                    title: tx('title_uploadAndShare'),
                    contents: (
                        <FileSharePreview
                            state={fileState.previewFile}
                            onSubmit={() => {
                                popupState.discardPopup();
                                const { previewFile } = fileState;
                                fileState.previewFile = null;
                                resolve(previewFile);
                            }}
                            onCancel={() => {
                                popupState.discardPopup();
                                resolve(false);
                            }}
                            onChooseRecipients={async () => {
                                await routes.modal.changeRecipient();
                                showPopup();
                            }}
                        />
                    )
                });
            showPopup();
        });
    }

    recipientText(text, italicText?) {
        return (
            <Text style={recipientStyle}>
                {text}
                <Text italic>{italicText}</Text>
            </Text>
        );
    }

    getRecipient(state) {
        const { contact, chat } = state;
        if (contact && contact.firstName) {
            // Share with selected User
            return this.recipientText(
                `${contact.firstName} ${contact.lastName} `,
                `@${contact.username}`
            );
        } else if (!chat.isChannel) {
            // Share with current User
            const recipient = chatStore.activeChat.otherParticipants[0];
            if (!recipient) {
                // DM with self, i.e; there are no other participants
                const user = User.current;
                return this.recipientText(`${user.fullName} `, `@${user.username}`);
            }
            return this.recipientText(`${recipient.fullName} `, `@${recipient.username}`);
        } // Share with current Room
        return this.recipientText(`# ${chat.name}`);
    }

    renderThrow() {
        const { state } = this.props;
        const recipient = this.getRecipient(state);

        return (
            <View>
                <FilePreview state={state} />
                <TouchableOpacity
                    onPress={this.props.onChooseRecipients}
                    pressRetentionOffset={vars.retentionOffset}
                    style={shareContainer}>
                    <View style={{ flexGrow: 1 }}>
                        <Text style={shareTextStyle}>{tx('title_shareWith')}</Text>
                        {recipient}
                    </View>
                    {icons.plaindark('keyboard-arrow-right')}
                </TouchableOpacity>
                <View style={buttonContainer}>
                    <ButtonText
                        text={tx('button_cancel')}
                        onPress={this.props.onCancel}
                        secondary
                        testID="cancel"
                    />
                    <ButtonText
                        text={tx('button_share')}
                        onPress={this.props.onSubmit}
                        testID="share"
                    />
                </View>
            </View>
        );
    }
}
