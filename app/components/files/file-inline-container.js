import PropTypes from 'prop-types';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react/native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import FileTypeIcon from './file-type-icon';
import FileProgress from './file-progress';
import { fileHelpers } from '../../lib/icebear';
import { tx } from '../utils/translator';

const padding = 8;
const borderWidth = 1;

const container = {
    borderColor: vars.lightGrayBg,
    borderWidth,
    marginVertical: 4,
    borderRadius: 2
};

const titleText = {
    color: vars.peerioBlue,
    marginVertical: 2,
    ellipsizeMode: 'tail'
};

const descText = {
    color: vars.txtDark,
    marginBottom: 2
};

const text = {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: vars.font.size14,
    color: vars.txtMedium,
    paddingLeft: padding
};

@observer
export default class FileInlineContainer extends SafeComponent {
    legacyNotification() {
        const errorContainer = {
            backgroundColor: vars.legacyImageErrorBg,
            padding: vars.spacing.small.midi2x,
            borderRadius: 4
        };
        const errorStyle = {
            fontSize: vars.font.size12,
            color: vars.lighterBlackText,
            fontStyle: 'italic'
        };
        const learnMoreStyle = {
            fontSize: vars.font.size12,
            color: vars.peerioBlue
        };
        return (
            this.props.isOpen && (
                <View style={errorContainer}>
                    <Text style={errorStyle}> {tx('title_newfsUpgradeImageError')} </Text>
                    <Text semibold style={learnMoreStyle}>
                        {' '}
                        {tx('title_learnMoreLegacyFiles')}{' '}
                    </Text>
                </View>
            )
        );
    }

    get fileTypeIcon() {
        const { file, onAction } = this.props;
        return (
            <TouchableOpacity onPress={onAction} pressRetentionOffset={vars.retentionOffset}>
                <FileTypeIcon type={fileHelpers.getFileIconType(file.ext)} size="smaller" />
            </TouchableOpacity>
        );
    }

    get fileName() {
        const { file, isImage, onAction } = this.props;
        const name = isImage ? file.name : `${file.name} (${file.sizeFormatted})`;
        return (
            !!name && (
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexGrow: 1,
                        flexShrink: 1
                    }}
                    onPress={onAction}
                    pressRetentionOffset={vars.retentionOffset}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={text}>
                        {name}
                    </Text>
                </TouchableOpacity>
            )
        );
    }

    get fileUnavailable() {
        return (
            <View style={container}>
                <View style={{ padding }}>
                    <Text italic style={{ color: vars.txtMedium }}>
                        {tx('error_fileRemoved')}
                    </Text>
                </View>
            </View>
        );
    }

    render() {
        const { file, isImage, isOpen, extraActionIcon } = this.props;
        const { title, description, fileId, downloading } = file;
        const isLocal = !!fileId;
        // TODO: maybe a placeholder instead
        if (isLocal) {
            if (!file.loaded) return null;
            if (file.deleted) return this.fileUnavailable;
        }
        const spacingDifference = padding - vars.progressBarHeight;
        let containerHeight = isLocal ? 30 : 0;
        if (isLocal && isOpen) containerHeight += padding;
        const outer = {
            padding,
            paddingBottom: downloading && !isImage ? spacingDifference : padding
        };
        const header = {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: isLocal && isOpen ? padding + borderWidth : 0,
            height: containerHeight
        };
        return (
            <View style={container}>
                <View style={outer} {...this.props}>
                    <View>
                        {!!title && <Text style={titleText}>{title}</Text>}
                        {!!description && <Text style={descText}>{description}</Text>}
                    </View>
                    <View style={header}>
                        {isLocal && this.fileTypeIcon}
                        {this.fileName}
                        {isLocal && (
                            <View style={{ flexDirection: 'row' }}>
                                {extraActionIcon}
                                {icons.darkNoPadding(
                                    'more-vert',
                                    () =>
                                        !file.isLegacy
                                            ? this.props.onActionSheet(file)
                                            : this.props.onLegacyFileAction(file),
                                    { marginHorizontal: vars.spacing.small.midi2x },
                                    vars.iconSize,
                                    downloading ? true : null
                                )}
                            </View>
                        )}
                    </View>
                    {file.isLegacy ? this.legacyNotification() : this.props.children}
                </View>
                {!isImage && <FileProgress file={file} />}
            </View>
        );
    }
}

FileInlineContainer.propTypes = {
    file: PropTypes.any,
    onLayout: PropTypes.any,
    extraActionIcon: PropTypes.any,
    onActionSheet: PropTypes.any,
    onAction: PropTypes.any,
    isImage: PropTypes.bool,
    isOpen: PropTypes.bool
};
