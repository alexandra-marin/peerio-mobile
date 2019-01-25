import PropTypes from 'prop-types';
import React from 'react';
import { action, when } from 'mobx';
import { observer } from 'mobx-react/native';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import { tx } from '../utils/translator';
import fileState from '../files/file-state';
import icons from '../helpers/icons';
import FileInlineContainer from './file-inline-container';
import FileSignatureError from './file-signature-error';
import snackbarState from '../snackbars/snackbar-state';

@observer
export default class FileInlineProgress extends SafeComponent {
    get filePreviouslyDownloaded() {
        return !!this.file && this.file.cached;
    }

    get file() {
        return this.props.chatId
            ? fileState.store.getByIdInChat(this.props.file, this.props.chatId)
            : fileState.store.getById(this.props.file);
    }

    get downloadProgress() {
        if (!this.file) return 0;
        const { progress, progressMax } = this.file;
        return Math.min(Math.ceil((progress / progressMax) * 100), 100);
    }

    // If file is cached, open in viewer
    // If file is NOT cached, download and then when download is complete open in viewer
    @action.bound
    fileAction() {
        when(
            () => this.file.hasFileAvailableForPreview,
            () => {
                this.file.launchViewer().catch(() => {
                    snackbarState.pushTemporary(tx('snackbar_couldntOpenFile'));
                });
            }
        );
        if (!this.file.hasFileAvailableForPreview) fileState.download(this.file);
    }

    @action.bound
    onCancel() {
        fileState.cancelDownload(this.file);
    }

    renderThrow() {
        const { file } = this;
        if (!file) return null;

        const downloadStatusContainer = {
            alignItems: 'center',
            justifyContent: 'center',
            height: 48,
            marginTop: vars.spacing.small.midi2x,
            marginBottom: file.downloading ? vars.spacing.small.midi2x : 0,
            backgroundColor: vars.darkBlueBackground05,
            borderRadius: 4
        };
        const textStyle = {
            color: vars.peerioBlue,
            fontStyle: 'italic'
        };
        const onPress = file.downloading ? this.onCancel : this.fileAction;
        if (file.signatureError) return <FileSignatureError />;
        return (
            <FileInlineContainer
                file={file}
                onActionSheet={this.props.onActionSheet}
                onAction={this.fileAction}
                onLegacyFileAction={this.props.onLegacyFileAction}>
                {!this.filePreviouslyDownloaded && (
                    <TouchableOpacity
                        pressRetentionOffset={vars.retentionOffset}
                        style={downloadStatusContainer}
                        onPress={onPress}>
                        <Text semibold style={textStyle}>
                            {file.downloading &&
                                !file.cached && (
                                    <Text>
                                        {tx('button_cancelDownload')} ({this.downloadProgress}%)
                                    </Text>
                                )}
                            {!file.downloading &&
                                !file.cached && (
                                    <Text>
                                        {tx('button_downloadToView')} ({file.sizeFormatted})
                                    </Text>
                                )}
                            {!file.downloading &&
                                file.cached && <Text>{tx('button_openFile')}</Text>}
                        </Text>
                    </TouchableOpacity>
                )}
                <View style={{ flex: 0 }}>
                    {!file.uploading &&
                        this.props.transparentOnFinishUpload && <ActivityIndicator />}
                    {file.uploading &&
                        icons.darkNoPadding('close', () => fileState.cancelUpload(file))}
                </View>
            </FileInlineContainer>
        );
    }
}

FileInlineProgress.propTypes = {
    file: PropTypes.any,
    transparentOnFinishUpload: PropTypes.bool,
    onActionSheet: PropTypes.any
};
