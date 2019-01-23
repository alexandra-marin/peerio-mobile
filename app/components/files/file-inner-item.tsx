import React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react/native';
import { Dimensions, View, TouchableOpacity, ViewStyle } from 'react-native';
import moment from 'moment';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import fileState from './file-state';
import FileSignatureError from './file-signature-error';
import FileTypeIcon from './file-type-icon';
import testLabel from '../helpers/test-label';
import FileProgress from './file-progress';
import { fileHelpers, contactStore, User } from '../../lib/icebear';
import MeasureableIcon from '../layout/measureable-icon';
import filesBeacons from '../beacons/files-beacons';
import { File } from '../../lib/peerio-icebear/models';

const { width } = Dimensions.get('window');
const height = vars.filesListItemHeight;
const checkBoxWidth = height;

const fileInfoContainerStyle: ViewStyle = {
    flexGrow: 1,
    flexDirection: 'row'
};

export interface FileInnerItemProps {
    onPress: Function;
    file: File;
    checkbox?: string;
    hideArrow?: boolean;
    onFileAction?: Function;
    rowID?: string;
}

@observer
export default class FileInnerItem extends SafeComponent<FileInnerItemProps> {
    @action.bound
    onPress() {
        const { file } = this.props;
        this.props.onPress && !fileState.isFileSelectionMode
            ? this.props.onPress(file)
            : (file.selected = !file.selected);
    }

    checkbox() {
        if (!fileState.isFileSelectionMode) return null;
        const checked = this.props.file && this.props.file.selected;
        const v = vars;
        const iconColor = checked ? v.checkboxIconActive : v.checkboxIconInactive;
        const iconBgColor = 'transparent';
        const icon = checked ? 'check-box' : 'check-box-outline-blank';
        const outer: ViewStyle = {
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
            <View style={outer} pointerEvents="none">
                {icons.colored(icon, null, iconColor, iconBgColor)}
            </View>
        );
    }

    get iconRight() {
        const { file, onFileAction } = this.props;
        const beforeUploadIcon = icons.dark('close', () => fileState.cancelUpload(file));
        const uploadedIcon = (
            <MeasureableIcon
                icon="more-vert"
                testId="more-vert"
                beacon={filesBeacons.fileOptionsBeacon}
                color={vars.darkIcon}
                onPress={onFileAction}
                spotBgColor={vars.filesBg}
            />
        );

        return file.uploading ? beforeUploadIcon : uploadedIcon;
    }

    renderThrow() {
        const { file } = this.props;
        if (file.signatureError)
            return (
                <View style={{ marginHorizontal: vars.spacing.small.midi }}>
                    <FileSignatureError />
                </View>
            );
        const checked = this.props.file && this.props.file.selected;
        const nameStyle = {
            color: vars.txtDark,
            fontSize: vars.font.size14
        };
        const infoStyle = {
            color: vars.extraSubtleText,
            fontSize: vars.font.size12
        };
        const itemContainerStyle: ViewStyle = {
            flex: 1,
            flexGrow: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0, 0, 0, .12)',
            backgroundColor: checked ? vars.peerioBlueBackground05 : vars.filesBg,
            height,
            width,
            borderWidth: 0,
            borderColor: 'red',
            paddingLeft: fileState.isFileSelectionMode ? 0 : vars.spacing.medium.mini2x
        };
        let icon = null;
        if (file.downloading) icon = 'file-download';
        if (file.uploading) icon = 'file-upload';
        let opacity = 1;
        if (file.uploading /* || !file.readyForDownload */) {
            opacity = 0.5;
        }
        if (icon) icon = icons.darkNoPadding(icon);
        const loadingStyle = null;
        const optionsIcon =
            this.props.hideArrow || fileState.isFileSelectionMode ? null : (
                <View style={{ flex: 0 }}>{this.iconRight}</View>
            );
        const testID = file.nameWithoutExtension;
        const owner =
            !file.fileOwner || file.fileOwner === User.current.username
                ? ``
                : `${contactStore.getContact(file.fileOwner).fullName} `;
        return (
            <View style={{ backgroundColor: vars.chatItemPressedBackground }}>
                <TouchableOpacity
                    pressRetentionOffset={vars.retentionOffset}
                    onPress={this.onPress}
                    {...testLabel(testID)}
                    accessible={false}
                    style={{ backgroundColor: vars.filesBg }}>
                    <View style={[fileInfoContainerStyle, { opacity }]}>
                        {this.checkbox()}
                        <View style={[itemContainerStyle, { width }]}>
                            <View
                                style={[
                                    loadingStyle,
                                    { flex: 0, paddingRight: vars.fileInnerItemPaddingRight }
                                ]}>
                                {icon || (
                                    <FileTypeIcon
                                        size="smaller"
                                        type={fileHelpers.getFileIconType(file.ext)}
                                    />
                                )}
                            </View>
                            <View
                                style={{
                                    flexGrow: 1,
                                    flexShrink: 1,
                                    marginLeft: vars.spacing.medium.mini2x
                                }}>
                                <Text bold style={nameStyle} numberOfLines={1} ellipsizeMode="tail">
                                    {file.name}
                                </Text>
                                <Text style={infoStyle}>
                                    <Text>{owner}</Text>
                                    {file.size && <Text>{file.sizeFormatted}</Text>}
                                    &nbsp;&nbsp;
                                    {moment(file.uploadedAt).format('DD/MM/YYYY')}
                                </Text>
                            </View>
                            {optionsIcon}
                        </View>
                    </View>
                </TouchableOpacity>
                <FileProgress file={file} />
            </View>
        );
    }
}
