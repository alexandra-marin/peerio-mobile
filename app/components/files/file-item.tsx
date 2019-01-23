import React from 'react';
import { observer } from 'mobx-react/native';
import { View } from 'react-native';
import { observable, action } from 'mobx';
import SafeComponent from '../shared/safe-component';
import FileInnerItem from './file-inner-item';
import FolderInnerItem from './folder-inner-item';
import fileState from './file-state';
import { vars } from '../../styles/styles';
import { File, FileFolder } from '../../lib/peerio-icebear/models';

const fileContainer = {
    backgroundColor: vars.filesBg,
    paddingHorizontal: vars.spacing.medium.mini2x
};

export interface FileItemProps {
    file: File | FileFolder;
    rowID: string;
    onChangeFolder: Function;
    onFileAction: Function;
    onFolderAction: Function;
}

@observer
export default class FileItem extends SafeComponent<FileItemProps> {
    @observable
    store = {
        get checkBoxHidden() {
            return !fileState.showSelection;
        },

        set checkBoxHidden(value) {
            console.log(value);
            // noop
        }
    };

    select() {
        this.props.file.selected = true;
    }

    press(file) {
        if (fileState.showSelection) {
            file.selected = !file.selected;
        } else {
            fileState.routerMain.files(file);
        }
    }

    @action.bound
    onFileAction() {
        const { file, onFileAction } = this.props;
        onFileAction(file);
    }

    @action.bound
    onFolderPress(folder) {
        const { onChangeFolder } = this.props;
        onChangeFolder(folder);
    }

    @action.bound
    onFolderAction() {
        const { file, onFolderAction } = this.props;
        onFolderAction(file);
    }

    renderThrow() {
        const { file } = this.props;
        return (
            <View style={fileContainer}>
                {file.isFolder ? (
                    <FolderInnerItem
                        folder={file as FileFolder}
                        onPress={this.onFolderPress}
                        onFolderAction={this.onFolderAction}
                    />
                ) : (
                    <FileInnerItem
                        file={file as File}
                        onPress={f => this.press(f)}
                        onFileAction={this.onFileAction}
                        rowID={this.props.rowID}
                    />
                )}
            </View>
        );
    }
}
