import React from 'react';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import SafeComponent from '../shared/safe-component';
import ProgressWide from '../shared/progress-wide';
import fileState from '../files/file-state';

@observer
export default class FileUploadProgress extends SafeComponent {
    get max() {
        const { file } = this.props;
        const max = file.progressMax || 1;
        return max;
    }

    get value() {
        const { file } = this.props;
        return file.progress;
    }

    get path() {
        const { fileId } = this.props.file;
        return fileId && fileState.localFileMap.get(fileId);
    }

    @action.bound
    cancel() {
        this.props.file.cancelUpload();
    }

    renderThrow() {
        const { file } = this.props;
        if (!file || !file.progressMax) return null;
        return (
            <ProgressWide
                title={file.name}
                path={this.path}
                {...this.props}
                onCancel={this.cancel}
                value={this.value}
                max={this.max}
            />
        );
    }
}
