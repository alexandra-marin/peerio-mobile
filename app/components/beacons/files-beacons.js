import { observable } from 'mobx';
import { chatStore, fileStore, User } from '../../lib/icebear';
import SpotBeacon from './spot-beacon';
import routes from '../routes/routes';
import beaconState from './beacon-state';
import AreaBeacon from './area-beacon';

const foldersBeacon = createBeacon({
    id: 'folders',
    condition: () => {
        const inFilesView = routes.main.route === 'files';
        const files = fileStore.files.length > 8;
        const noFolders = !fileStore.folderStore.root.folders.length;
        return inFilesView && files && noFolders;
    },
    priority: 11,
    component: SpotBeacon,
    headerText: 'title_folders_beacon',
    descriptionText: 'description_folders_beacon',
    position: null
});

const fileOptionsBeacon = createBeacon({
    id: 'fileOptions',
    condition: () => {
        const inFilesView = routes.main.route === 'files';
        const firstFile = fileStore.files.length === 1;
        return inFilesView && firstFile;
    },
    priority: 9,
    component: SpotBeacon,
    descriptionText: 'description_moreFiles_beacon',
    position: null
});

const fileReceivedBeacon = createBeacon({
    id: 'fileReceived',
    condition: () => {
        const inFilesView = routes.main.route === 'files';
        const hasChats = chatStore.directMessages.length > 0;
        const recentFilesReceived = chatStore.directMessages.filter(
            c => c.recentFiles.filter(f => f.owner !== User.current.username).length > 1
        );
        const hasLessThan4Folders = fileStore.folderStore.root.folders.length < 4;
        return inFilesView && hasChats && recentFilesReceived && hasLessThan4Folders;
    },
    priority: 10,
    component: AreaBeacon,
    descriptionText: 'description_receivedFile_beacon'
});

const filesBeacons = {
    foldersBeacon,
    fileOptionsBeacon,
    fileReceivedBeacon
};

function createBeacon(props) {
    return observable({
        ...props,
        position: null,
        onUnmount() {
            beaconState.markSeen([props.id]);
        }
    });
}

module.exports = filesBeacons;
