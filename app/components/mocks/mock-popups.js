import React, { Component } from 'react';
import { View, StatusBar } from 'react-native';
import { observer } from 'mobx-react/native';
import PopupLayout from '../layout/popup-layout';
import { vars } from '../../styles/styles';
// import PaymentsInfoPopup from '../payments/payments-info-popup';
// import AccountUpgradePlan from '../settings/account-upgrade-plan';
// import { popupControl } from '../shared/popups';
import { gradient } from '../controls/effects';

const basicColor = '#82A9BE';
const premiumColor = 'rgba(44,149,207,1)';

@observer
export default class MockChatList extends Component {
    componentDidMount() {
        // popupControl(<PaymentsInfoPopup text={plans[1].paymentInfo} />);
    }

    render() {
        return (
            <View style={{ flex: 1, flexGrow: 1 }}>
                <StatusBar barStyle="default" />
                {gradient(
                    {
                        style: { flexGrow: 1, paddingTop: vars.layoutPaddingTop },
                        backgroundColor: 'transparent'
                    },
                    // <AccountUpgradePlan plan={plans[1]} />,
                    basicColor,
                    premiumColor
                )}
                <PopupLayout key="popups" />
            </View>
        );
    }
}
