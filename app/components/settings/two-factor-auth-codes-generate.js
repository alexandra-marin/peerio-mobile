import React from 'react';
import { observer } from 'mobx-react/native';
import { observable } from 'mobx';
import { View } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import { tx } from '../utils/translator';
import { User } from '../../lib/icebear';
import routes from '../routes/routes';
import TwoFactorAuthCodes from './two-factor-auth-codes';
import RedTextButton from '../buttons/red-text-button';
import BlueRoundButton from '../buttons/blue-round-button';

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

const buttonCenterStyle = {
    marginVertical: paddingVertical,
    flexDirection: 'row',
    justifyContent: 'center'
};

@observer
export default class TwoFactorAuthCodesGenerate extends SafeComponent {
    @observable backupCodes;

    disable2fa() {
        User.current.disable2fa();
        routes.main.settings('security');
    }

    reissueCodes = async () => {
        this.backupCodes = await User.current.reissueBackupCodes();
    };

    renderThrow() {
        if (this.backupCodes) return <TwoFactorAuthCodes codes={this.backupCodes} />;
        return (
            <View style={bgStyle}>
                <View>
                    <Text bold style={headerStyle}>
                        {tx('title_2FAEnabled')}
                        {tx('title_2FABackupCode')}
                    </Text>
                    <View style={buttonCenterStyle}>
                        <BlueRoundButton
                            text="button_2FAGenerateCodes"
                            onPress={this.reissueCodes}
                            style={{ width: vars.wideRoundedButtonWidth }}
                        />
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
