import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Animated } from 'react-native';
import { observable, action, computed } from 'mobx';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import FilesZeroStatePlaceholder from './files-zero-state-placeholder';
import ProgressOverlay from '../shared/progress-overlay';
import FileItem from './file-item';
import FileUploadActionSheet from './file-upload-action-sheet';
import FileActionSheet from '../files/file-action-sheet';
import FoldersActionSheet from '../files/folder-action-sheet';
import fileState from './file-state';
import PlusBorderIcon from '../layout/plus-border-icon';
import { upgradeForFiles } from '../payments/payments';
import BackIcon from '../layout/back-icon';
import { vars } from '../../styles/styles';
import { tx } from '../utils/translator';
import icons from '../helpers/icons';
import ButtonText from '../controls/button-text';
import uiState from '../layout/ui-state';
import SharedFolderRemovalNotif from './shared-folder-removal-notif';
import SearchBar from '../controls/search-bar';
import FlatListWithDrawer from '../shared/flat-list-with-drawer';
import zeroStateBeacons from '../beacons/zerostate-beacons';
import filesBeacons from '../beacons/files-beacons';
import MeasureableView from '../shared/measureable-view';
import beaconState from '../beacons/beacon-state';
import routes from '../routes/routes';

const iconClear = require('../../assets/file_icons/ic_close.png');

const INITIAL_LIST_SIZE = 20;
const PAGE_SIZE = 20;

function backFolderAction() {
    fileState.store.folderStore.currentFolder = fileState.store.folderStore.currentFolder.parent;
}

@observer
export default class Files extends SafeComponent {
    @observable findFilesText;
    @observable refresh = 0;

    get leftIcon() {
        if (!fileState.store.folderStore.currentFolder.parent) return null;
        return <BackIcon action={backFolderAction} />;
    }

    get rightIcon() {
        return (
            !fileState.isFileSelectionMode && (
                <PlusBorderIcon
                    action={() => FileUploadActionSheet.show({ createFolder: true })}
                    beacon={[zeroStateBeacons.uploadFileBeacon, filesBeacons.foldersBeacon]}
                    testID="buttonUploadFileToFiles"
                />
            )
        );
    }

    get layoutTitle() {
        if (!fileState.store.folderStore.currentFolder.parent) return null;
        return fileState.store.folderStore.currentFolder.name;
    }

    actionsHeight = new Animated.Value(0);

    @computed
    get data() {
        let data = fileState.store.searchQuery
            ? fileState.store.filesAndFoldersSearchResult
            : fileState.store.folderStore.currentFolder.filesAndFoldersDefaultSorting;
        if (fileState.isFileSelectionMode) {
            data = data.filter(item => !item.isLegacy && (item.isFolder || item.readyForDownload));
        }
        return data;
    }

    componentDidMount() {
        // download last uploaded file
        uiState.testAction1 = () => routes.main.files(this.data.filter(f => !f.isFolder)[0]);
    }

    componentWillUnmount() {
        // remove icebear hook for deletion
        fileState.store.bulk.deleteFolderConfirmator = null;
        uiState.testAction1 = null;
    }

    onChangeFolder = folder => {
        fileState.store.folderStore.currentFolder = folder;
    };

    item = ({ item, index }) => {
        // fileId for file, id for folder
        return (
            <FileItem
                key={item.fileId || item.id}
                file={item}
                rowID={index}
                onChangeFolder={this.onChangeFolder}
                onFileAction={() => FileActionSheet.show({ file: item })}
                onFolderAction={() => FoldersActionSheet.show(item)}
            />
        );
    };

    keyExtractor = fsObject => (fsObject ? fsObject.fileId || fsObject.id : null);

    get noFilesMatchSearch() {
        if (this.data.length || !fileState.findFilesText || fileState.store.loading) return null;
        return (
            <View>
                <Text style={{ marginTop: vars.headerSpacing, textAlign: 'center' }}>
                    {tx('title_noFilesMatchSearch')}
                </Text>
            </View>
        );
    }

    onMeasure = position => {
        const beacon = filesBeacons.fileReceivedBeacon;
        beacon.position = position;
        beaconState.requestBeacon(beacon);
    };

    list() {
        return (
            <MeasureableView onMeasure={this.onMeasure}>
                <FlatListWithDrawer
                    ListHeaderComponent={!this.isZeroState && this.searchTextbox()}
                    ListFooterComponent={this.noFilesMatchSearch}
                    keyExtractor={this.keyExtractor}
                    initialNumToRender={INITIAL_LIST_SIZE}
                    pageSize={PAGE_SIZE}
                    data={this.data}
                    extraData={this.refresh}
                    renderItem={this.item}
                />
            </MeasureableView>
        );
    }

    get isZeroState() {
        return fileState.store.isEmpty;
    }

    get isEmpty() {
        const folder = fileState.store.folderStore.currentFolder;
        if (this.data.length || (!folder.isShared && folder.isRoot)) return false;
        return true;
    }

    get noFilesInFolder() {
        if (!this.isEmpty) return null;
        return <FilesZeroStatePlaceholder emptyFolder />;
    }

    onChangeFindFilesText(text) {
        const items = text.split(/[ ,;]/);
        if (items.length > 1) {
            fileState.findFilesText = items[0].trim();
            return;
        }
        fileState.findFilesText = text;
        this.searchFileTimeout(text);
    }

    searchFileTimeout(filename) {
        if (this._searchTimeout) {
            clearTimeout(this._searchTimeout);
            this._searchTimeout = null;
        }
        if (!filename) {
            fileState.store.searchQuery = '';
            return;
        }
        this._searchTimeout = setTimeout(() => this.searchFile(filename), 500);
    }

    searchFile = val => {
        fileState.store.searchQuery = val;
    };

    @action.bound
    onChangeText(text) {
        this.clean = !text.length;
        this.onChangeFindFilesText(text);
    }

    searchTextbox() {
        if (this.isEmpty) return null;
        const leftIcon = icons.plain('search', vars.iconSize, vars.black12);
        let rightIcon = null;
        if (fileState.findFilesText) {
            rightIcon = icons.imageButton(
                iconClear,
                () => {
                    fileState.findFilesText = '';
                    this.onChangeFindFilesText('');
                },
                null,
                vars.opacity54
            );
        }
        return (
            <SearchBar
                textValue={fileState.findFilesText}
                placeholderText={tx('title_searchAllFiles')}
                onChangeText={this.onChangeText}
                onSubmit={this.onSubmit}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
            />
        );
    }

    toolbar() {
        const container = {
            height: vars.listItemHeight,
            backgroundColor: vars.darkBlueBackground05,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            shadowColor: '#000000',
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: {
                height: 1,
                width: 1
            },
            elevation: 10,
            paddingRight: vars.spacing.small.midi2x
        };
        return (
            fileState.isFileSelectionMode && (
                <View style={container}>
                    <ButtonText
                        testID="fileShareButtonCancel"
                        onPress={this.handleExit}
                        secondary
                        text={tx('button_cancel')}
                    />
                    <ButtonText
                        testID="fileShareButtonShare"
                        onPress={this.submitSelection}
                        text={tx('button_share')}
                        disabled={!fileState.showSelection}
                    />
                </View>
            )
        );
    }

    handleExit() {
        fileState.exitFileSelect();
    }

    submitSelection() {
        fileState.submitSelectedFiles();
    }

    sharedFolderRemovalNotifs() {
        // TODO: add any missed conditions for when to NOT show this
        if (!fileState.store.folderStore.currentFolder.isRoot) return null;
        // TODO: map them from a list of notifications from SDK
        const folderNames = [
            'test-folder-name-1',
            'test-folder-name-2',
            'test-folder-name-3',
            'test-folder-name-4'
        ];
        return <SharedFolderRemovalNotif folderNames={folderNames} />;
    }

    body() {
        if (
            this.data.length ||
            fileState.findFilesText ||
            !fileState.store.folderStore.currentFolder.isRoot
        )
            return this.list();
        return this.isZeroState && <FilesZeroStatePlaceholder />;
    }

    renderThrow() {
        const { noFilesInFolder } = this;
        return (
            <View ref={this.flatListRef} style={{ flex: 1, flexGrow: 1 }}>
                <View style={{ flex: 1, flexGrow: 1, backgroundColor: vars.darkBlueBackground05 }}>
                    {upgradeForFiles()}
                    {noFilesInFolder || this.body()}
                    {/* this.sharedFolderRemovalNotifs() */}
                </View>
                <ProgressOverlay enabled={fileState.store.loading} />
                {this.toolbar()}
            </View>
        );
    }
}
