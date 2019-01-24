import React, { Component } from 'react';
import { observer } from 'mobx-react/native';
import FolderSelect from './folder-select';

@observer
export default class FileMove extends Component {
    render() {
        return <FolderSelect {...this.props} />;
    }
}
