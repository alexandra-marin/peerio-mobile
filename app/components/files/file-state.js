import { Linking, Platform } from 'react-native';
import { observable, action, when } from 'mobx';
import chatState from '../messaging/chat-state';
import RoutedState from '../routes/routed-state';
import {
    fileStore,
    TinyDb,
    socket,
    fileHelpers,
    clientApp,
    chatStore,
    User
} from '../../lib/icebear';
import { tx } from '../utils/translator';
import { rnAlertYesNo } from '../../lib/alerts';
import { popupInputWithPreview, popupYesCancel, popupOkCancel } from '../shared/popups';
import { promiseWhen } from '../helpers/sugar';

class FileState extends RoutedState {
    // the current selected file for FileDetailView
    @observable currentFile = null;
    @observable previewFile = null;
    @observable isFileSelectionMode = null;
    @observable disableFoldersInSelection;
    @observable findFilesText;
    localFileMap = observable.map();
    forceShowMap = observable.map();
    store = fileStore;
    _prefix = 'files';
    selectedFile = null;

    @action
    async init() {
        fileStore.folderStore.currentFolder = fileStore.folderStore.root;
        return new Promise(resolve => when(() => this.store.cacheLoaded, resolve));
    }

    get showSelection() {
        return fileStore.hasSelectedFilesOrFolders;
    }

    get selected() {
        return fileStore.selectedFilesOrFolders;
    }

    @action
    delete(noTransition) {
        const f = this.currentFile ? [this.currentFile] : this.selected;
        const count = f.length;
        const shared = !!f.filter(i => !!i.shared).length;
        let t = tx(count > 1 ? 'dialog_confirmDeleteFiles' : 'dialog_confirmDeleteFile', { count });
        if (shared) t += `\n${tx('title_confirmRemoveSharedFiles')}`;
        rnAlertYesNo(t)
            .then(() => {
                f.forEach(item => {
                    item.remove();
                });
                if (!noTransition) this.routerMain.files();
            })
            .catch(e => console.error(e));
    }

    @action
    async unshareFile(file) {
        return file.remove();
    }

    @action
    async deleteFile(fileInfo) {
        const id = fileInfo.fileId;
        let file = fileStore.getById(id);
        if (!file) {
            file = await fileStore.loadKegByFileId(id);
            if (!file) {
                console.error(`could not resolve a file ${id}`);
                return Promise.resolve();
            }
        }
        const isOwner = file.owner === User.current.username;
        const title = isOwner ? tx('dialog_confirmDeleteFile') : tx('title_confirmRemoveFile');
        let subtitle = '';
        if (file.shared)
            subtitle += isOwner
                ? tx('title_confirmRemoveSharedFiles')
                : tx('dialog_confirmRemoveFileNonOwner');
        const result = await popupOkCancel(title, subtitle);
        console.log(result);
        if (result) {
            await file.remove();
        }
        return result; // Used to trigger events after deleting
    }

    async remindAboutEncryption() {
        if (Platform.OS !== 'android') return;
        let text = null;
        switch (global.fileEncryptionStatus) {
            case undefined:
            case 2:
                return;
            case 1:
                text = 'dialog_androidEncryptionStatusPartial';
                break;
            default:
                text = 'dialog_androidEncryptionStatusOff';
        }
        if (await TinyDb.system.getValue('fileEncryptionStatusShown')) return;
        try {
            await rnAlertYesNo(null, tx(text));
            Linking.openURL('https://support.google.com/nexus/answer/2844831?hl=en');
        } catch (e) {
            console.log('file-state: user tap cancelled');
        }
        await TinyDb.system.setValue('fileEncryptionStatusShown', true);
    }

    async remindAboutExternal() {
        if (Platform.OS !== 'android') return true;
        if (await TinyDb.system.getValue('saved_toExternalShown')) return true;
        try {
            await rnAlertYesNo(null, tx('dialog_toExternal'));
            TinyDb.system.setValue('saved_toExternalShown', true);
        } catch (e) {
            return false;
        }
        return true;
    }

    @action
    async download(fp) {
        await this.remindAboutEncryption();
        if (!(await this.remindAboutExternal())) {
            console.log('file-state.js: user denied saving to external');
            return;
        }
        const singleFile = fp || this.currentFile;
        const f = singleFile ? [singleFile] : this.selected;
        f.forEach(file => {
            file.selected = false;
            if (file.downloading || file.uploading) return;
            file.readyForDownload && file.download(file.cachePath);
        });
    }

    @action
    resetSelection() {
        this.selectedFile = null;
        this.selected.forEach(f => {
            f.selected = false;
        });
    }

    @action
    selectFilesAndFolders(params = {}) {
        const { disableFolders } = params;
        this.resetSelection();
        fileStore.folderStore.currentFolder = this.store.folderStore.root;
        this.isFileSelectionMode = true;
        this.disableFoldersInSelection = disableFolders;
        return new Promise((resolve, reject) => {
            this.resolveFileSelection = resolve;
            this.rejectFileSelection = reject;
            this.routerMain.files();
        });
    }

    // TODO modify after router push logic is implemented
    @action
    exitFileSelect() {
        this.resetSelection();
        this.isFileSelectionMode = false;
        this.disableFoldersInSelection = false;
        this.routerMain.chats(chatStore.activeChat);
        this.rejectFileSelection &&
            this.rejectFileSelection(new Error(`file-state.js: user cancel`));
        this.rejectFileSelection = null;
    }

    @action
    submitSelectedFiles() {
        this.resolveFileSelection(this.selected.slice());
        this.resolveFileSelection = null;
        this.isFileSelectionMode = false;
        this.disableFoldersInSelection = false;
        this.exitFileSelect();
    }

    preprocess = async ({ fileName, ext, url }) => {
        const fileProps = {
            fileName,
            ext,
            path: url,
            name: fileHelpers.getFileNameWithoutExtension(fileName)
        };
        const { shouldUpload, newName } = await popupInputWithPreview(
            tx('title_fileName'),
            fileProps
        );
        const newFileName = `${newName}.${ext}`;

        return { shouldUpload, newFileName };
    };

    uploadInline = async data => {
        await promiseWhen(() => socket.authenticated);
        const chat = chatState.currentChat;
        if (!chat) throw new Error('file-state.js, uploadInline: no chat selected');
        data.file = chat.uploadAndShareFile(data.url, data.fileName, false, data.message);
        await promiseWhen(() => data.file.fileId);
        // TODO: move this to icebear
        this.localFileMap.set(data.file.fileId, data.url);
        return data.file;
    };

    uploadInFiles = async data => {
        await promiseWhen(() => socket.authenticated);
        const folder = fileStore.folderStore.currentFolder;
        const { shouldUpload, newFileName } = await this.preprocess(data);
        let file;
        if (shouldUpload) {
            file = fileStore.upload(data.url, newFileName, folder);
        }
        return file;
    };

    cancelUpload(file) {
        return popupYesCancel(tx('title_confirmCancelUpload')).then(r => r && file.cancelUpload());
    }

    cancelDownload(file) {
        file.cancelDownload();
    }

    onTransition(active, file) {
        console.log('files on transition');
        clientApp.isInFilesView = active && !!file;
        this.currentFile = active ? file : null;
    }

    goToRoot() {
        fileStore.folderStore.currentFolder = fileStore.folderStore.root;
    }

    get title() {
        return this.currentFile ? this.currentFile.name : tx('title_fileFilterAll');
    }
}

export default new FileState();
