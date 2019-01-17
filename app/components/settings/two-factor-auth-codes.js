import React from 'react';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';
import { View, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import FileOpener from 'react-native-file-opener';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import { tx } from '../utils/translator';
import { User } from '../../lib/icebear';
import routes from '../routes/routes';
import testLabel from '../helpers/test-label';
import BlueButtonText from '../buttons/blue-text-button';
import RedTextButton from '../buttons/red-text-button';

const paddingVertical = vars.listViewPaddingVertical;
const paddingHorizontal = vars.listViewPaddingHorizontal;

const bgStyle = {
    flexGrow: 1,
    flex: 1,
    paddingVertical,
    paddingHorizontal,
    backgroundColor: vars.darkBlueBackground05
};

const headerStyle = {
    color: vars.txtDark,
    fontSize: vars.font.size16,
    marginLeft: vars.spacing.small.midi2x
};

const infoStyle = {
    color: vars.txtDark,
    marginLeft: vars.spacing.small.midi2x,
    marginVertical: vars.spacing.medium.maxi2x
};

const labelStyle = {
    color: vars.txtDate,
    marginBottom: vars.spacing.small.mini2x,
    fontSize: vars.font.size12,
    marginLeft: vars.spacing.small.midi2x
};

const whiteStyle = {
    backgroundColor: vars.white,
    paddingVertical: vars.spacing.small.maxi,
    paddingHorizontal
};

const row = { flexDirection: 'row' };

const rowRight = [row, { justifyContent: 'flex-end', marginTop: vars.spacing.small.maxi2x }];

const column = { flex: 0.5, alignItems: 'center' };

const textStyle = { color: vars.txtDark, marginVertical: vars.spacing.small.maxi };

/*
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatTableHTML(codes) {
    let result = '';
    for (let i = 1; i < codes.length; i += 2) {
        result += `<tr><td>${codes[i - 1]}</td><td>${codes[i]}</td></tr>`;
    }
    result = `<table>${result}</table>`;
    return result;
}
*/

function formatTableTxt(codes) {
    return `Your backup codes: \n\n${codes.join('\n')}`;
}

@observer
export default class TwoFactorAuthCodes extends SafeComponent {
    @observable codes = [];

    componentDidMount() {
        this.codes = this.props.codes || this.randomCodes;
    }

    get randomCodes() {
        const count = 12;
        const result = [];
        for (let i = 0; i < count; ++i) {
            result.push(Math.floor(Math.random() * 899999) + 100000);
        }
        return result;
    }

    downloadCodes = async () => {
        let mimeType = 'application/pdf';
        let filePath = '';

        // if (Platform.OS === 'android') {
        mimeType = 'text/plain';
        filePath = `${
            Platform.OS === 'android' ? RNFS.ExternalDirectoryPath : RNFS.DocumentDirectoryPath
        }/backup codes for ${User.current.username}.txt`;
        await RNFS.writeFile(filePath, formatTableTxt(this.codes), 'utf8');
        /* } else {
            const html = formatTableHTML(this.codes);
            filePath = (await RNHTMLtoPDF.convert({ html })).filePath;
        } */
        console.log(filePath);
        await FileOpener.open(filePath, mimeType, '2fa');
        // await RNFS.unlink(filePath);
    };

    disable2fa() {
        User.current.disable2fa();
        routes.main.settings('security');
    }

    renderThrow() {
        return (
            <View style={bgStyle}>
                <View>
                    <Text bold style={headerStyle} {...testLabel('title_2FABackupCode')}>
                        {tx('title_2FABackupCode')}
                    </Text>
                    <Text style={infoStyle}>
                        {`Save these backup codes in a safe place so that you
still login if you're unable to access your
authenticator app.`}
                    </Text>
                    <Text style={labelStyle}>{tx('title_2FABackupCode')}</Text>
                </View>
                <View style={whiteStyle}>
                    <View style={row}>
                        <View style={column}>
                            {this.codes.slice(0, this.codes.length / 2).map(i => (
                                <Text bold style={textStyle} key={i}>
                                    {i}
                                </Text>
                            ))}
                        </View>
                        <View style={column}>
                            {this.codes.slice(this.codes.length / 2, this.codes.length).map(i => (
                                <Text bold style={textStyle} key={i}>
                                    {i}
                                </Text>
                            ))}
                        </View>
                    </View>
                    <View style={rowRight}>
                        <BlueButtonText text="title_download" onPress={this.downloadCodes} />
                    </View>
                </View>
                <View
                    style={{
                        left: paddingHorizontal + 12,
                        bottom: paddingVertical,
                        position: 'absolute'
                    }}>
                    <RedTextButton text="title_2FADisableAuth" onPress={this.disable2fa} />
                </View>
            </View>
        );
    }
}
