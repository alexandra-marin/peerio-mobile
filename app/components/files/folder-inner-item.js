import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import { observable, action } from 'mobx';
import { View, TouchableOpacity } from 'react-native';
import moment from 'moment';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars, helpers } from '../../styles/styles';
import icons from '../helpers/icons';
import { tx } from '../utils/translator';
import fileState from './file-state';
import { User, contactStore } from '../../lib/icebear';
import testLabel from '../helpers/test-label';

const height = vars.filesListItemHeight;
const width = vars.listItemHeight;
const checkBoxWidth = height;

const folderInfoContainerStyle = {
    flexGrow: 1,
    flexDirection: 'row'
};

const folderInfoStyle = {
    backgroundColor: 'transparent',
    color: vars.extraSubtleText,
    fontSize: vars.font.size12
};

const nameStyle = {
    color: vars.darkBlue,
    fontSize: vars.font.size14,
    backgroundColor: 'transparent'
};

@observer
export default class FolderInnerItem extends SafeComponent {
    @observable progressWidth = 0;

    @action.bound
    onPress() {
        const { folder, onPress } = this.props;
        onPress && onPress(folder);
    }

    @action.bound
    toggleSelected() {
        const { folder } = this.props;
        folder.selected = !folder.selected;
    }

    get currentProgress() {
        const { folder } = this.props;
        const { progressWidth } = this;
        if (!progressWidth) return 0;
        return (progressWidth * folder.progressPercentage) / 100;
    }

    @action.bound
    layout(evt) {
        this.progressWidth = evt.nativeEvent.layout.width;
    }

    get checkbox() {
        if (!fileState.isFileSelectionMode) return null;
        const { folder } = this.props;
        const sharedFoldersEnabled =
            process.env.SHARED_FOLDERS_ENABLED && !fileState.disableFoldersInSelection;
        const checked = folder && folder.selected;
        const v = vars;
        let iconColor = checked ? v.checkboxIconActive : v.checkboxIconInactive;
        iconColor = sharedFoldersEnabled ? iconColor : vars.checkboxDisabled;
        const iconBgColor = 'transparent';
        const icon = checked ? 'check-box' : 'check-box-outline-blank';
        const outer = {
            backgroundColor: checked ? vars.peerioBlueBackground05 : vars.filesBg,
            padding: vars.spacing.small.mini2x,
            flex: 0,
            width: checkBoxWidth,
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, .12)'
        };
        return (
            <TouchableOpacity
                style={outer}
                pointerEvents="none"
                onPress={this.toggleSelected}
                disabled={!sharedFoldersEnabled}
                pressRetentionOffset={vars.retentionOffset}>
                {icons.colored(
                    icon,
                    this.toggleSelected,
                    iconColor,
                    iconBgColor,
                    !sharedFoldersEnabled
                )}
            </TouchableOpacity>
        );
    }

    get radio() {
        const { radio, disabled } = this.props;
        if (!radio) return null;
        const outer = {
            width,
            height,
            alignItems: 'center',
            justifyContent: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, .12)'
        };
        const s = [
            helpers.circle(20),
            {
                backgroundColor: vars.white,
                borderColor: vars.txtMedium,
                borderWidth: 2
            }
        ];
        return (
            <TouchableOpacity
                disabled={disabled}
                style={{ opacity: disabled ? vars.opacity54 : null }}
                onPress={this.props.onSelect}
                pressRetentionOffset={vars.retentionOffset}>
                <View style={outer}>
                    <View style={s} />
                </View>
            </TouchableOpacity>
        );
    }

    get fileDetails() {
        const { folder } = this.props;
        const { progressPercentage, progressMax } = folder;
        if (progressMax) {
            return (
                <Text italic style={folderInfoStyle}>
                    {tx('title_sharingFolderPercent', { progressPercent: progressPercentage })}
                </Text>
            );
        }
        const owner =
            !folder.owner || folder.owner === User.current.username
                ? ``
                : `${contactStore.getContact(folder.owner).fullName} `;
        return (
            <Text style={folderInfoStyle}>
                <Text>{owner}</Text>
                {folder.size ? (
                    <Text>{folder.sizeFormatted}</Text>
                ) : (
                    <Text>{tx('title_empty')}</Text>
                )}
                &nbsp;&nbsp;
                {folder.createdAt ? moment(folder.createdAt).format('DD/MM/YYYY') : null}
            </Text>
        );
    }

    renderThrow() {
        const { folder, onSelect, hideOptionsIcon, onFolderAction, disabled } = this.props;
        const { isShared, convertingToVolume, convertingFromFolder } = folder;
        const checked = folder && folder.selected;
        const progressContainer = {
            backgroundColor: vars.fileUploadProgressColor,
            width: this.currentProgress,
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0
        };
        const itemContainerStyle = {
            flex: 1,
            flexGrow: 1,
            flexDirection: 'row',
            height,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: checked ? vars.peerioBlueBackground05 : vars.filesBg,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, .12)',
            paddingLeft: fileState.isFileSelectionMode ? 0 : vars.spacing.medium.mini2x
        };
        const optionsIcon =
            hideOptionsIcon || fileState.isFileSelectionMode ? null : (
                <View style={{ flex: 0 }}>
                    {icons.dark(
                        'more-vert',
                        onFolderAction,
                        null,
                        null,
                        'more-vert',
                        convertingToVolume || convertingFromFolder
                    )}
                </View>
            );
        return (
            <View
                style={{
                    backgroundColor: vars.chatItemPressedBackground,
                    opacity: disabled ? vars.opacity54 : null
                }}>
                <TouchableOpacity
                    disabled={disabled}
                    onPress={hideOptionsIcon ? onSelect : this.onPress}
                    style={{ backgroundColor: vars.filesBg }}
                    pressRetentionOffset={vars.retentionOffset}
                    {...testLabel(folder.name)}
                    accessible={false}>
                    <View style={folderInfoContainerStyle}>
                        {this.radio}
                        {this.checkbox}
                        <View style={itemContainerStyle} onLayout={this.layout}>
                            <View style={progressContainer} />
                            <View style={{ flex: 0 }}>
                                {icons.plaindark(
                                    isShared ? 'folder-shared' : 'folder',
                                    vars.iconSize,
                                    null
                                )}
                            </View>
                            <View
                                style={{
                                    flexGrow: 1,
                                    flexShrink: 1,
                                    marginLeft: vars.spacing.medium.maxi2x
                                }}>
                                <Text bold style={nameStyle} numberOfLines={1} ellipsizeMode="tail">
                                    {folder.parent ? folder.name : tx('title_files')}
                                </Text>
                                {this.fileDetails}
                            </View>
                            {optionsIcon}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

FolderInnerItem.propTypes = {
    onPress: PropTypes.func,
    onSelect: PropTypes.func,
    folder: PropTypes.any.isRequired,
    hideOptionsIcon: PropTypes.bool,
    radio: PropTypes.bool,
    onFolderAction: PropTypes.func,
    disabled: PropTypes.bool
};
