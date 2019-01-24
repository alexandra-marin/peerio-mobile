import React from 'react';
import { View, Dimensions, ViewStyle } from 'react-native';
import { when, observable } from 'mobx';
import { observer } from 'mobx-react/native';
import { config, overrideServer, socket } from '../../lib/icebear';
import loginState from '../login/login-state';
import { vars } from '../../styles/styles';
import Button from '../controls/button';
import Logs from '../logs/logs';
import consoleOverride from '../../lib/console-override';
import SafeComponent from './safe-component';
import uiState from '../layout/ui-state';
import { transitionAnimation } from '../helpers/animations';
import TextInputUncontrolled from '../controls/text-input-uncontrolled';
import fonts from '../../styles/fonts';

const { height } = Dimensions.get('window');

const container: ViewStyle = {
    backgroundColor: vars.darkBlueBackground15,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    paddingTop: vars.statusBarHeight
};
const debugContainer = {
    paddingHorizontal: vars.spacing.medium.maxi2x,
    marginVertical: vars.spacing.small.maxi2x
};
const buttonContainer: ViewStyle = {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between'
};
const button = {
    height: 36,
    padding: vars.spacing.small.mini2x,
    justifyContent: 'center',
    backgroundColor: vars.darkBlue,
    borderColor: '#FFFFFF50',
    borderWidth: 1,
    borderRadius: 6
};
const input = {
    height: 40,
    backgroundColor: '#FFFFFF90',
    marginTop: vars.spacing.small.maxi2x,
    fontFamily: fonts.peerioFontFamily,
    borderColor: vars.darkBlue,
    borderWidth: 1,
    borderRadius: 8
};

@observer
export default class DebugMenu extends SafeComponent {
    @observable showDebugLogs = false;
    @observable switchServerValue = '';
    @observable disableButtons = true;

    componentDidMount() {
        when(
            () => socket.connected,
            () => {
                this.switchServerValue = config.socketServerUrl;
            }
        );
        when(
            () => uiState.showDebugMenu,
            () => {
                transitionAnimation();
                setTimeout(() => {
                    transitionAnimation();
                    this.disableButtons = false;
                }, 2000);
            }
        );
    }

    componentWillUnmount() {}

    async debugServer(serverName) {
        await overrideServer(serverName);
        loginState.restart();
    }

    renderThrow() {
        if (!uiState.showDebugMenu) return null;
        return (
            <View style={[container, { opacity: this.disableButtons ? 0.5 : 1 }]}>
                <View style={debugContainer}>
                    <View>
                        <Button
                            style={button}
                            onPress={() => {
                                uiState.showDebugMenu = false;
                            }}
                            text="Hide Debug Menu"
                            textStyle={{ textAlign: 'center' }}
                            disabled={this.disableButtons}
                        />
                    </View>
                    <View style={buttonContainer}>
                        <View style={{ flex: 1 }}>
                            <Button
                                style={button}
                                onPress={() => {
                                    this.showDebugLogs = !this.showDebugLogs;
                                }}
                                text="Toggle logs"
                                textStyle={{ textAlign: 'center' }}
                                disabled={this.disableButtons}
                            />
                            <Button
                                style={button}
                                onPress={() => {
                                    consoleOverride.verbose = !consoleOverride.verbose;
                                }}
                                text="Toggle Verbose"
                                textStyle={{ textAlign: 'center' }}
                                disabled={this.disableButtons}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Button
                                style={button}
                                onPress={() => this.debugServer(this.switchServerValue)}
                                text="Override server"
                                textStyle={{ textAlign: 'center' }}
                                disabled={this.disableButtons}
                            />
                            <Button
                                style={button}
                                onPress={() => this.debugServer(null)}
                                text="Reset Server"
                                textStyle={{ textAlign: 'center' }}
                                disabled={this.disableButtons}
                            />
                        </View>
                    </View>
                    <View style={{ flex: 0 }}>
                        <TextInputUncontrolled
                            autoCorrect={false}
                            autoCapitalize="none"
                            value={this.switchServerValue}
                            onChangeText={text => {
                                this.switchServerValue = text;
                            }}
                            style={input}
                        />
                    </View>
                </View>
                {this.debugLogs}
            </View>
        );
    }

    get debugLogs() {
        return this.showDebugLogs ? (
            <View style={{ backgroundColor: 'white', height: height * 0.6, marginHorizontal: 8 }}>
                <Logs />
            </View>
        ) : null;
    }
}
