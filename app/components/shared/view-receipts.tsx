import React from 'react';
import _ from 'lodash';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { reaction, observable } from 'mobx';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import ReadReceipt from './read-receipt';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import Text from '../controls/custom-text';
import { transitionAnimation } from '../helpers/animations';
import { action } from 'mobx';

const receiptRow: ViewStyle = {
    backgroundColor: vars.black25,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    width: 40,
    marginHorizontal: 8,
    borderRadius: 16,
    paddingHorizontal: 2
};

const emptyReceiptRow: ViewStyle = {
    alignSelf: 'flex-end',
    height: 20,
    width: 40,
    marginHorizontal: 8
};

const half: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center'
};

const textStyle = {
    fontSize: vars.readReceiptFontSize,
    color: vars.darkBlue
};

interface ViewReceiptsProps {
    receipts: any;
    onPressReceipt;
}

@observer
export default class ViewReceipts extends SafeComponent<ViewReceiptsProps> {
    @observable forceLastAvatar;
    prev = 1;
    _observer: any;
    updateTimeout: any;

    componentDidMount() {
        this._observer = reaction(
            () => this.props.receipts && this.props.receipts.length,
            this.updateAnimation,
            { fireImmediately: true }
        );
    }

    componentWillUnmount() {
        if (this._observer) this._observer();
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    }

    componentWillUpdate() {
        transitionAnimation();
    }

    get receiptComponent() {
        if (this.props.receipts.length > 1 && !this.forceLastAvatar) return this.receiptNumber;
        return this.receiptAvatar;
    }

    get receiptAvatar() {
        const { receipts } = this.props;
        const { username } = _.last(receipts);
        return <ReadReceipt username={username} avatarSize={vars.iconSizeSmall} />;
    }

    get receiptNumber() {
        const { receipts } = this.props;
        if (receipts.length < 10) {
            return <Text style={textStyle}>{receipts.length}</Text>;
        }
        return <Text style={textStyle}>9+</Text>;
    }

    @action.bound
    updateAnimation() {
        const { receipts } = this.props;
        if (!receipts || !receipts.length) return;
        const viewsIncreased = receipts.length > this.prev;
        if (viewsIncreased) {
            this.forceLastAvatar = true;
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
            }
            this.updateTimeout = setTimeout(() => {
                this.forceLastAvatar = false;
                this.updateTimeout = null;
            }, 3000);
        }
        this.prev = receipts.length;
    }

    renderThrow() {
        const { receipts, onPressReceipt } = this.props;
        if (!receipts || !receipts.length) return <View style={emptyReceiptRow} />;

        return (
            <TouchableOpacity
                onPress={onPressReceipt}
                pressRetentionOffset={vars.retentionOffset}
                style={receiptRow}>
                <View style={half}>{icons.plain('remove-red-eye', 12, vars.darkBlue)}</View>
                <View style={half}>{this.receiptComponent}</View>
            </TouchableOpacity>
        );
    }
}
