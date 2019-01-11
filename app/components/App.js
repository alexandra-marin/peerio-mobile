import React from 'react';
import {
    View,
    PanResponder,
    Linking,
    DeviceEventEmitter,
    AppState,
    ActivityIndicator,
    NativeModules,
    Dimensions,
    PixelRatio,
    Platform,
    StatusBar
} from 'react-native';
// import RNShakeEvent from 'react-native-shake-event';
import KeyEvent from 'react-native-key-event';
import { observer } from 'mobx-react/native';
import emojione from 'emojione';
import SafeComponent from './shared/safe-component';
import PopupLayout from './layout/popup-layout';
import ModalLayout from './layout/modal-layout';
import RouteNavigator from './routes/route-navigator';
import routerApp from './routes/router-app';
import uiState from './layout/ui-state';
import { clientApp, crypto, startSocket, config, User } from '../lib/icebear';
import { scryptNative, signDetachedNative, verifyDetachedNative } from '../lib/scrypt-native';
import push from '../lib/push';
import consoleOverride from '../lib/console-override';
import '../lib/sounds';
import './utils/bridge';
// import socketResetIfDead from './utils/socket-reset';
import TestHelper from './helpers/test-helper';
import MockComponent from './mocks';
import ActionSheetLayout from './layout/action-sheet-layout';
import Text from './controls/custom-text';
import BeaconLayout from './beacons/beacon-layout';
import loginState from './login/login-state';
import { uploadFileAndroid, uploadFileiOS, wakeUpAndUploadFileiOS } from './utils/shared-files';
import { TopDrawerAutoMount } from './shared/top-drawer-components';
import DebugMenu from './shared/debug-menu';
import createAutomationSocket from '../lib/create-automation-socket';
import whiteLabelComponents from './whitelabel/white-label-components';

const { height, width } = Dimensions.get('window');
@observer
export default class App extends SafeComponent {
    constructor(props) {
        super(props);
        uiState.load();

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => {
                uiState.hidePicker();
                return false;
            }
        });

        console.logVersion = () => {
            console.log(
                `App.js: app version ${config.appVersion}, SDK version: ${config.sdkVersion}, OS: ${
                    Platform.OS
                }, OS version: ${Platform.Version}`
            );
            console.log(`App.js: screen specs: ${width}, ${height}, ${PixelRatio.get()}`);
        };

        this._handleAppStateChange = this._handleAppStateChange.bind(this);
        this._handleMemoryWarning = this._handleMemoryWarning.bind(this);

        consoleOverride.configureConsole().then(() => {
            startSocket();
            if (__DEV__) {
                this.automationSocket = createAutomationSocket();
            }
        });
    }

    async componentWillMount() {
        if (MockComponent) return;
        // this is the route we send our user to
        let route = null;
        // Have existing user that isn't logged in
        if (await loginState.haveLoggedOutUser()) {
            route = routerApp.routes.loginWelcomeBack;
        }
        // No existing user
        if (!(await User.getLastAuthenticated())) {
            route = routerApp.routes.loginWelcome;
        }
        if (route) {
            route.transition();
        } else {
            // LoadingScreen will forward our user to the next route
            loginState.showLoadingScreen = true;
        }
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
        AppState.addEventListener('memoryWarning', this._handleMemoryWarning);
        NativeModules.PrivacySnapshot && NativeModules.PrivacySnapshot.enabled(true);
        if (NativeModules.RNSodium && NativeModules.RNSodium.scrypt) {
            console.log(`App.js: using native scrypt`);
            crypto.setScrypt(scryptNative);
        }
        console.log(`App.js: settings worker sign/verify`);
        if (NativeModules.RNSodium) {
            const { signDetached, verifyDetached } = NativeModules.RNSodium;
            if (signDetached && verifyDetached) {
                crypto.sign.setImplementation(signDetachedNative, verifyDetachedNative);
            }
        }

        Linking.getInitialURL().then(wakeUpAndUploadFileiOS);
        Linking.addEventListener('url', uploadFileiOS);

        uploadFileAndroid(this.props.sharedFile);
        DeviceEventEmitter.addListener('sharedFile', uploadFileAndroid);

        KeyEvent.onKeyUpListener(keyCode => {
            if (keyCode.unicodeChar === 78 && keyCode.isShiftPressed) uiState.showDebugMenu = true;
        });

        // RNShakeEvent.addEventListener('shake', () => { uiState.showDebugMenu = true; });
    }

    componentWillUnmount() {
        // RNShakeEvent.removeEventListener('shake');
    }

    _handleAppStateChange(appState) {
        console.log(`App.js: AppState change: ${appState}`);
        /* if (uiState.appState === 'background' && appState === 'active') {
            socketResetIfDead();
        } */
        uiState.appState = appState;
        if (appState === 'active') {
            push.clearBadge();
            push.disableServerSide();
            clientApp.isFocused = true;
        }
        if (appState === 'background') {
            push.enableServerSide();
            clientApp.isFocused = false;
        }
    }

    _handleMemoryWarning() {
        console.log(`App.js: AppState memory warning`);
    }

    _placeHolder() {
        return (
            <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    renderThrow() {
        if (!uiState.locale) return this._placeHolder();
        if (MockComponent) return <MockComponent />;
        const tabletHack = { top: 0, height, left: 0, right: 0 };
        return (
            <View style={height < 500 ? tabletHack : { flex: 1, flexGrow: 1 }}>
                <RouteNavigator key="navigator" routes={routerApp} />
                {/* BeaconLayout.debugHelper */}
                <ModalLayout key="modals" />
                <BeaconLayout />
                <DebugMenu />
                <ActionSheetLayout key="actionSheets" />
                {uiState.picker}
                <Text key="debug" style={{ height: 0 }} testID="debugText">
                    {uiState.debugText}
                </Text>
                <StatusBar barStyle="light-content" hidden={false} key="statusBar" />
                <TopDrawerAutoMount />
                {loginState.showLoadingScreen && <whiteLabelComponents.LoadingScreen />}
                <PopupLayout key="popups" />
                {!process.env.NO_DEV_BAR && <TestHelper key="testHelper" />}
            </View>
        );
    }
}

global.emojione = emojione;
