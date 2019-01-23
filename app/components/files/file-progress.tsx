import React from 'react';
import { observer } from 'mobx-react/native';
import SafeComponent from '../shared/safe-component';
import Progress from '../shared/progress';
import { File } from '../../lib/peerio-icebear/models';

export interface FileProgressProps {
    file: File;
}

@observer
export default class FileProgress extends SafeComponent<FileProgressProps> {
    prevFile = null;

    get hidden() {
        const { file } = this.props;
        return !file || (!file.downloading && !file.uploading);
    }

    get max() {
        const { file } = this.props;
        if (!file) return 0;
        const max = file.progressMax || 1;
        return max;
    }

    get value() {
        const { file } = this.props;
        if (!file) return 0;
        return file.progress;
    }

    renderThrow() {
        if (this.hidden) return null;
        return <Progress value={this.value} max={this.max} />;
    }
}
