import React from 'react';
import { Platform } from 'react-native';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';
import ActionSheet from 'react-native-actionsheet';
import SafeComponent from '../shared/safe-component';
import fileState from '../files/file-state';
import chatState from '../messaging/chat-state';
import { tx } from '../utils/translator';
import { popupInputCancel } from '../shared/popups';
import imagepicker from '../helpers/imagepicker';
import FileSharePreview from './file-share-preview';

@observer
export default class FilesActionSheet extends SafeComponent {
    @observable image;

    async doUpload(sourceFunction) {
        const uploader = this.props.inline ?
            fileState.uploadInline : fileState.uploadInFiles;
        const source = observable(await sourceFunction());
        if (this.props.inline) {
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

    get takePhoto() {
        return {
            title: tx('title_takePhoto'),
            action: () => this.doUpload(imagepicker.getImageFromCamera)
        };
    }

    get chooseFromGallery() {
        return {
            title: tx('title_chooseFromGallery'),
            action: () => this.doUpload(imagepicker.getImageFromGallery)
        };
    }

    get androidFilePicker() {
        return {
            title: tx('title_chooseFromFiles'),
            action: () => this.doUpload(imagepicker.getImageFromAndroidFilePicker)
        };
    }

    get shareFromPeerio() {
        return {
            title: tx('title_shareFromFiles'),
            async action() {
                chatState.shareFiles(await fileState.selectFiles());
            }
        };
    }

    get createFolder() {
        const action = async () => {
            const result = await popupInputCancel(
                tx('title_createFolder'), tx('title_createFolderPlaceholder'), true);
            if (!result) return;
            requestAnimationFrame(() => {
                fileState.store.folders.createFolder(result.value, fileState.currentFolder);
                fileState.store.folders.save();
            });
        };
        return { title: tx('title_createFolder'), action };
    }

    get items() {
        const result = [this.takePhoto, this.chooseFromGallery];
        (Platform.OS === 'android') && result.push(this.androidFilePicker);
        this.props.inline && result.push(this.shareFromPeerio);
        this.props.createFolder && result.push(this.createFolder);
        result.push({ title: tx('button_cancel') });
        return result;
    }

    onPress = index => {
        const { action } = this.items[index];
        action && action();
    };

    show = () => this._actionSheet.show();

    renderThrow() {
        return (
            <ActionSheet
                ref={sheet => { this._actionSheet = sheet; }}
                options={this.items.map(i => i.title)}
                cancelButtonIndex={this.items.length - 1}
                onPress={this.onPress}
            />
        );
    }
}
