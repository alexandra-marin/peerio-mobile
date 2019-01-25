import React from 'react';
import { tx } from '../utils/translator';
import { fileState } from '../states';
import { popupFileRename, popupFolderDelete } from '../shared/popups';
import { fileHelpers, volumeStore, config, User } from '../../lib/icebear';
import FileActionSheetHeader from '../files/file-action-sheet-header';
import ActionSheetLayout from '../layout/action-sheet-layout';
import routes from '../routes/routes';
import chatState from '../messaging/chat-state';

export default class FoldersActionSheet {
    static show(folder, canUnshare) {
        const { hasLegacyFiles, isShared, owner } = folder;
        const isOwner = !owner || owner === User.current.username;

        const header = <FileActionSheetHeader file={folder} />;
        const folderShareAction = {
            title: 'button_share',
            disabled: hasLegacyFiles,
            action: async () => {
                const contacts = await routes.modal.shareFolderTo({ folder });
                if (!contacts) return;
                await volumeStore.shareFolder(folder, contacts);
            }
        };
        const actionButtons = [
            {
                title: tx('button_move'),
                disabled: isShared,
                action: async () => {
                    await routes.modal.moveFileTo({ fsObject: folder });
                }
            },
            {
                title: tx('button_rename'),
                action: async () => {
                    const newFolderName = await popupFileRename(
                        tx('title_folderName'),
                        '',
                        fileHelpers.getFileNameWithoutExtension(folder.name)
                    );
                    if (newFolderName) {
                        await folder.rename(`${newFolderName}`);
                    }
                }
            }
        ];

        if (canUnshare) {
            actionButtons.push({
                title: tx('button_unshare'),
                action: async () => {
                    folder.removeParticipants([chatState.currentChat.otherParticipants[0]]);
                }
            });
        }

        actionButtons.push({
            title: tx('button_delete'),
            isDestructive: true,
            action: async () => {
                // icebear will call this function to confirm file deletion
                fileState.store.bulk.deleteFolderConfirmator = () => {
                    return popupFolderDelete(isShared, isOwner);
                };
                await fileState.store.bulk.removeOne(folder);
                fileState.store.bulk.deleteFolderConfirmator = null;
            }
        });

        if (config.enableVolumes) actionButtons.unshift(folderShareAction);
        ActionSheetLayout.show({
            header,
            hasCancelButton: true,
            actionButtons
        });
    }
}
