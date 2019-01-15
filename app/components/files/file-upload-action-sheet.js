import { Platform } from 'react-native';
import { observable } from 'mobx';
import fileState from '../files/file-state';
import chatState from '../messaging/chat-state';
import { tx } from '../utils/translator';
import { popupInputCancel } from '../shared/popups';
import imagepicker from '../helpers/imagepicker';
import FileSharePreview from './file-share-preview';
import { fileStore } from '../../lib/icebear';
import ActionSheetLayout from '../layout/action-sheet-layout';

async function doUpload(sourceFunction, inline) {
    const uploader = inline ? fileState.uploadInline : fileState.uploadInFiles;
    const uploadInfo = await sourceFunction();
    if (!uploadInfo) {
        console.log(`no upload info provided. skipping upload`);
        return;
    }
    const source = observable(uploadInfo);
    if (inline) {
        const userSelection = await FileSharePreview.popup(source.url, source.fileName);
        if (!userSelection) return;
        source.fileName = `${userSelection.name}.${source.ext}`;
        source.message = userSelection.message;
        let { chat } = userSelection;
        if (userSelection.contact && chat === null) {
            chat = await chatState.startChat([userSelection.contact]);
            // TODO: switching to new DMs without timeout causes file
            // to be shared in previous chat. Couldn't figure out why
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    uploader(source);
}

export default class FileUploadActionSheet {
    static show(params = {}) {
        const { inline, createFolder, disableFolders } = params;
        const actionButtons = [
            {
                title: tx('button_takeAPicture'),
                action() {
                    doUpload(imagepicker.getImageFromCamera, inline);
                }
            },
            {
                title: tx('title_chooseFromGallery'),
                action() {
                    doUpload(imagepicker.getImageFromGallery, inline);
                }
            }
        ];

        if (Platform.OS === 'android') {
            actionButtons.push({
                title: tx('title_chooseFromFiles'),
                action() {
                    doUpload(imagepicker.getImageFromAndroidFilePicker, inline);
                }
            });
        }

        if (inline) {
            actionButtons.push({
                title: tx('title_shareFromFiles'),
                disabled: fileState.store.isEmpty,
                async action() {
                    chatState.shareFilesAndFolders(
                        await fileState.selectFilesAndFolders({ disableFolders })
                    );
                }
            });
        }

        if (createFolder) {
            actionButtons.push({
                title: tx('title_createFolder'),
                async action() {
                    const result = await popupInputCancel(
                        tx('title_createFolder'),
                        tx('title_createFolderPlaceholder'),
                        true
                    );
                    if (!result) return;
                    requestAnimationFrame(() => {
                        fileStore.folderStore.currentFolder.createFolder(result.value);
                    });
                }
            });
        }

        ActionSheetLayout.show({
            header: null,
            actionButtons,
            hasCancelButton: true
        });
    }
}
