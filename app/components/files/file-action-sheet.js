import React from 'react';
import { when } from 'mobx';
import { tx } from '../utils/translator';
import { fileState } from '../states';
import routes from '../routes/routes';
import ActionSheetLayout from '../layout/action-sheet-layout';
import { fileHelpers, config, User } from '../../lib/icebear';
import FileActionSheetHeader from '../files/file-action-sheet-header';
import { popupFileRename } from '../shared/popups';
import snackbarState from '../snackbars/snackbar-state';

export default class FileActionSheet {
    static async show(params) {
        const { file, fileAutoOpen, routeAfterDelete, canUnshare } = params;
        // TODO: remove when SDK is ready and/or move to SDK
        try {
            if (await config.FileStream.exists(file.tmpCachePath)) {
                file.tmpCached = true;
            } else if (await config.FileStream.exists(file.cachePath)) {
                file.cached = true;
            }
        } catch (e) {
            console.log(e);
        }
        if (!file) {
            snackbarState.pushTemporary(tx('snackbar_fileNotFound'));
            return;
        }
        const { isLegacy, readyForDownload } = file;
        const header = (
            <FileActionSheetHeader
                file={file}
                onPress={() => {
                    routes.modal.discard();
                    routes.main.files(file);
                    ActionSheetLayout.hide();
                }}
            />
        );

        // Files that exist can be opened right away
        // Files that dont exist need to be downloaded firs
        const title = file.hasFileAvailableForPreview ? tx('button_open') : tx('button_download');
        const actionButtons = [];

        // Share
        actionButtons.push({
            title: tx('button_share'),
            disabled: isLegacy || !readyForDownload,
            action: () => routes.modal.shareFileTo({ file })
        });

        // Open / Download
        if (file.isImage) {
            actionButtons.push({
                title,
                // Opens the image using the right path if it exists, else attempts to download it
                action: () => {
                    if (file.hasFileAvailableForPreview) {
                        file.launchViewer();
                    } else {
                        fileState.download(file);
                    }
                }
            });
        } else {
            // If file is cached, open in viewer
            // If file is NOT cached, download and then when download is complete open in viewer
            actionButtons.push({
                title,
                action: () => {
                    if (file.hasFileAvailableForPreview) {
                        file.launchViewer();
                    } else {
                        fileState.download(file);
                        if (fileAutoOpen) when(() => file.cached, () => file.launchViewer());
                    }
                }
            });
        }

        // Move
        // TODO: a better way to not show move option in DMs and rooms
        routes.main.route !== 'chats' &&
            actionButtons.push({
                title: tx('button_move'),
                disabled: isLegacy,
                action: async () => {
                    await routes.modal.moveFileTo({ fsObject: file });
                }
            });

        // Rename
        actionButtons.push({
            title: tx('button_rename'),
            disabled: isLegacy,
            action: async () => {
                const newFileName = await popupFileRename(
                    tx('title_fileName'),
                    '',
                    fileHelpers.getFileNameWithoutExtension(file.name),
                    { autoCapitalize: 'sentences' }
                );
                if (newFileName) await file.rename(`${newFileName}.${file.ext}`);
            }
        });

        // Unshare
        canUnshare &&
            file.owner === User.current.username &&
            actionButtons.push({
                title: 'button_unshare',
                action: async () => {
                    await fileState.unshareFile(file);
                    ActionSheetLayout.hide();
                }
            });

        // Delete
        actionButtons.push({
            title: file.owner === User.current.username ? 'button_delete' : 'button_remove',
            isDestructive: true,
            action: async () => {
                const result = await fileState.deleteFile(file);
                if (result) {
                    ActionSheetLayout.hide();
                    if (routeAfterDelete) routes.main[routeAfterDelete]();
                }
            }
        });

        ActionSheetLayout.show({
            header,
            actionButtons,
            hasCancelButton: true
        });
    }
}
