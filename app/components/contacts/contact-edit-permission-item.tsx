import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react/native';
import SafeComponent from '../shared/safe-component';
import { tx, tu } from '../utils/translator';
import icons from '../helpers/icons';
import { vars } from '../../styles/styles';
import AvatarCircle from '../shared/avatar-circle';
import Text from '../controls/custom-text';
import GrayLabel from '../controls/gray-label';
import { transitionAnimation } from '../helpers/animations';
import { Contact } from '../../lib/icebear';

const avatarPadding = 16;
let currentContactItem = null;
const marginBottom = 8;

const buttonStyle: ViewStyle = {
    paddingHorizontal: vars.spacing.small.maxi,
    backgroundColor: vars.redWarning,
    height: vars.removeButtonHeight,
    justifyContent: 'center'
};

const containerStyle: ViewStyle = {
    height: vars.warningHeight - marginBottom,
    marginBottom,
    marginLeft: vars.avatarDiameter + avatarPadding * 2,
    paddingLeft: vars.spacing.medium.mini2x,
    borderLeftWidth: 1,
    borderLeftColor: vars.black12,
    flex: 1,
    justifyContent: 'center'
};

const outerContainerStyle: ViewStyle = {
    height: vars.listItemHeight,
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    paddingLeft: avatarPadding
};

const nameStyle = {
    fontSize: vars.font.size14,
    color: vars.lighterBlackText,
    paddingLeft: vars.spacing.medium.mini2x
};

const iconStyle = {
    paddingRight: vars.spacing.medium.mini2x
};

const ownerStyle: ViewStyle = {
    flex: 0,
    paddingRight: vars.spacing.medium.mini2x,
    flexDirection: 'row',
    alignItems: 'center'
};

interface ContactEditPermissionItemProps {
    contact: Contact;
    isOwner?: boolean;
    onUnshare?: Function;
}

@observer
export default class ContactEditPermissionItem extends SafeComponent<
    ContactEditPermissionItemProps
> {
    @observable _showWarning = false;
    @observable collapsed = false;
    get showWarning() {
        return this._showWarning;
    }

    set showWarning(value) {
        console.log(value);
        transitionAnimation();
        if (currentContactItem) {
            currentContactItem._showWarning = false;
        }
        currentContactItem = this;
        currentContactItem._showWarning = true;
    }

    @action.bound
    handleShowWarningClick() {
        this.showWarning = true;
    }

    // To prevent animation bug caused by how react native updates lists
    // We hide the item, then do "unshare" logic after hide animation ends
    // Finally reset the UI state of the list item
    @action.bound
    removeClick() {
        transitionAnimation();
        this.collapsed = true;
        // wait for animation to finish before removing item
        setTimeout(() => {
            this.props.onUnshare(this.props.contact);
            currentContactItem = null;
        }, 500);
    }

    get removeLabel() {
        return this.showWarning
            ? this.removeButton()
            : icons.darkNoPadding('remove-circle-outline', this.handleShowWarningClick, iconStyle);
    }

    removeButton() {
        return (
            <TouchableOpacity
                pressRetentionOffset={vars.retentionOffset}
                style={buttonStyle}
                onPress={this.removeClick}>
                <Text style={{ backgroundColor: 'transparent', color: vars.white }}>
                    {tu('button_remove')}
                </Text>
            </TouchableOpacity>
        );
    }

    deleteWarning() {
        const { firstName } = this.props.contact;
        const textStyle = {
            color: vars.subtleText,
            paddingRight: vars.spacing.medium.mini2x
        };
        return (
            <View style={containerStyle}>
                <Text semibold style={textStyle}>
                    {tx('title_filesSharedRemoved', { firstName })}
                </Text>
            </View>
        );
    }

    get ownerLabel() {
        return (
            <View style={ownerStyle}>
                <GrayLabel label="owner" />
            </View>
        );
    }

    get rightButton() {
        const { isOwner } = this.props;
        return isOwner ? this.ownerLabel : this.removeLabel;
    }

    renderThrow() {
        const { contact } = this.props;
        const { fullName } = contact;
        return (
            <View
                style={{
                    backgroundColor: this.showWarning ? vars.black05 : vars.white,
                    height: this.collapsed ? 0 : undefined
                }}>
                <View style={outerContainerStyle}>
                    <View
                        style={{
                            flex: 1,
                            flexGrow: 1,
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                        <AvatarCircle contact={this.props.contact} />
                        <Text style={nameStyle}>{fullName}</Text>
                    </View>
                    {this.rightButton}
                </View>
                {this.showWarning && this.deleteWarning()}
            </View>
        );
    }
}
