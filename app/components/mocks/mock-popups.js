import React, { Component } from 'react';
import { View, StatusBar } from 'react-native';
import { observer } from 'mobx-react/native';
import PopupLayout from '../layout/popup-layout';

@observer
export default class MockChatList extends Component {
    componentDidMount() {
        // popupControl(<PaymentsInfoPopup text={plans[1].paymentInfo} />);
    }

    render() {
        return (
            <View style={{ flex: 1, flexGrow: 1 }}>
                <StatusBar barStyle="default" />
                <PopupLayout key="popups" />
            </View>
        );
    }
}
