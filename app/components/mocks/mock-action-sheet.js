import React, { Component } from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react/native';
import { action } from 'mobx';
import ActionSheetLayout from '../layout/action-sheet-layout';
import FileActionSheetHeader from '../files/file-action-sheet-header';
import BlueButtonText from '../buttons/blue-text-button';

class FileActionSheet {
    static show(file) {
        const header = (
            <FileActionSheetHeader file={file} onPress={() => console.log('Go to file')} />
        );
        const actionButtons = [
            {
                title: 'button_share',
                action: () => console.log('share')
            },
            {
                title: 'button_delete',
                isDestructive: true,
                action: () => console.log('delete')
            },
            {
                title: 'button_move',
                action: () => console.log('move')
            },
            {
                title: 'jump',
                action: () => console.log('jump')
            }
        ];
        ActionSheetLayout.show({
            header,
            hasCancelButton: true,
            actionButtons
        });
    }
}

@observer
export default class MockActionSheet extends Component {
    @action.bound
    showActionSheet() {
        const file = {
            name: 'Karim File',
            sizeFormatted: '22 MB',
            uploadedAt: new Date().getTime()
        };
        FileActionSheet.show({ file });
    }

    render() {
        return (
            <View style={{ flexGrow: 1 }}>
                <View style={{ justifyContent: 'center', flexGrow: 1 }}>
                    <BlueButtonText text="Select image" onPress={this.showActionSheet} />
                </View>
                <ActionSheetLayout />
            </View>
        );
    }
}
