import React from 'react';
import { observer } from 'mobx-react/native';
import { View, FlatList } from 'react-native';
import { observable, computed } from 'mobx';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import FolderInnerItem from './folder-inner-item';
import fileState from './file-state';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import routes from '../routes/routes';
import { popupMoveToSharedFolder } from '../shared/popups';
import { tx } from '../utils/translator';
import preferenceStore from '../settings/preference-store';
import ModalHeader from '../shared/modal-header';

const INITIAL_LIST_SIZE = 10;
const PAGE_SIZE = 2;

@observer
export default class FolderSelect extends SafeComponent {
    @observable currentFolder = fileState.store.folderStore.root;

    @computed
    get data() {
        const { currentFolder } = this;
        const folders = currentFolder.foldersSortedByName.slice();
        currentFolder.isRoot && folders.unshift(fileState.store.folderStore.root);
        return folders;
    }

    componentWillUnmount() {
        this.reaction && this.reaction();
        this.reaction = null;
    }

    item = ({ item }) => {
        const folder = item;
        const selectFolder = async () => {
            // filesystem object, may be file or folder
            const { fsObject } = this.props;
            if (!fsObject) return;
            if (folder.isShared) {
                if (!preferenceStore.prefs.showMoveSharedFolderPopup) folder.attach(fsObject);
                else {
                    const result = await popupMoveToSharedFolder();
                    if (result) {
                        preferenceStore.prefs.showMoveSharedFolderPopup = !result.checked;
                        folder.attach(fsObject);
                    }
                }
            } else folder.attach(fsObject);
            routes.modal.discard();
        };
        const changeFolder = () => {
            this.currentFolder = folder;
        };
        return (
            <FolderInnerItem
                radio
                key={folder.id}
                folder={folder}
                hideOptionsIcon
                onSelect={selectFolder}
                disabled={fileState.hasLegacyObjectsInSelection}
                onPress={folder.hasNested ? changeFolder : selectFolder}
            />
        );
    };

    list() {
        return (
            <FlatList
                initialListSize={INITIAL_LIST_SIZE}
                pageSize={PAGE_SIZE}
                data={this.data}
                renderItem={this.item}
                onEndReached={this.onEndReached}
                onEndReachedThreshold={20}
            />
        );
    }

    get noFilesInFolder() {
        if (this.data.length || this.currentFolder.isRoot) return null;
        const s = {
            color: vars.txtMedium,
            textAlign: 'center',
            marginTop: vars.headerSpacing
        };
        return <Text style={s}>{tx('title_noFilesInFolder')}</Text>;
    }

    exitRow() {
        const leftIcon = this.currentFolder.isRoot
            ? icons.dark('close', () => routes.modal.discard())
            : icons.dark('arrow-back', () => {
                  this.currentFolder = this.currentFolder.parent;
              });
        const fontSize = vars.font.size14;
        const title = 'title_moveFileTo';
        const outerStyle = { marginBottom: 0 };
        return <ModalHeader {...{ leftIcon, title, fontSize, outerStyle }} />;
    }

    renderThrow() {
        return (
            <View style={{ flex: 1, flexGrow: 1, backgroundColor: vars.white }}>
                {this.exitRow()}
                {!this.data.length && !this.currentFolder.isRoot ? this.noFilesInFolder : null}
                {this.list()}
            </View>
        );
    }
}
