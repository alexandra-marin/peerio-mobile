import { Platform, DeviceEventEmitter, NativeModules } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import moment from 'moment';
import { fileHelpers } from '../../lib/icebear';

// uses react-native-file-picker || react-native-file-picker-clean
// do not delete
const { FilePickerManager } = NativeModules;

let lastCall = null;

const launchGallery = async options =>
    new Promise(resolve => ImagePicker.launchImageLibrary(options, resolve));

const launchCamera = async options =>
    new Promise(resolve => ImagePicker.launchCamera(options, resolve));

const showFilePicker = async () =>
    new Promise(resolve => FilePickerManager.showFilePicker(null, resolve));

function waitForPermissions() {
    return new Promise(resolve => {
        lastCall = resolve;
    });
}

function normalizeUri(response) {
    const { uri } = response;
    if (Platform.OS === 'ios') {
        return uri.replace('file://', '');
    }
    return uri;
}

/**
 * Returns object with the following fields:
 * url - local path
 * fileName - human-readable filename
 * ext - original extension
 * response - original response
 * @param {Function} functor picks up the actual source
 * @param {Object} params for functor
 */
async function processResponse(functor, params?) {
    let response = await functor(params);
    if (response.error) {
        console.log('imagepicker.js: ', response.error);
        throw new Error(response.error);
    }
    if (response.didRequestPermission) {
        console.log('imagepicker.js: permissions requested');
        await waitForPermissions();
        response = await functor(params);
    }
    if (!response.path && response.uri) {
        response.path = response.uri;
    }
    if (!response.path) {
        console.log(`user cancelled image selection. no path returned`);
        return null;
    }
    // if it's a HEIF or HEIC file, it would still give you path to JPG asset
    // for the sake of compatibility
    const ext = fileHelpers
        .getFileExtension(response.path)
        .trim()
        .toLowerCase();
    if (params && params.isCamera) {
        response.fileName = `${moment(Date.now()).format('llll')}`;
    }
    // we may or may not have fileName, path or uri, depending on platform
    const { fileName, path, uri } = response;
    const normalizedFileName = fileHelpers.getFileNameWithoutExtension(fileName || path || uri);
    return { url: normalizeUri(response), fileName: `${normalizedFileName}.${ext}`, ext, response };
}

const cameraSettings = {
    isCamera: true,
    noData: true,
    storageOptions: {
        skipBackup: true,
        waitUntilSaved: true
    }
};

const gallerySettings = { noData: true, mediaType: 'mixed' };

export default {
    launchGallery,
    showFilePicker,

    getImageFromCamera() {
        return processResponse(launchCamera, cameraSettings);
    },

    getImageFromGallery() {
        return processResponse(launchGallery, gallerySettings);
    },

    getImageFromAndroidFilePicker() {
        return processResponse(showFilePicker);
    }
};

// for android granting permissions
DeviceEventEmitter.addListener(`CameraPermissionsGranted`, response => {
    console.log(`imagepicker.js: permissions result: ${response}`);
    if (response && lastCall) lastCall();
});
