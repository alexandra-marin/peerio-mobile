import React from 'react';
import { View, TouchableOpacity, TextStyle, ViewStyle, LayoutChangeEvent } from 'react-native';
import { observer } from 'mobx-react/native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import FileTypeIcon from './file-type-icon';
import FileProgress from './file-progress';
import { fileHelpers } from '../../lib/icebear';
import { tx } from '../utils/translator';
import { File } from '../../lib/peerio-icebear/models';
import { ExternalContent } from '../../lib/peerio-icebear/helpers/unfurl/types';

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

const errorContainer = {
    backgroundColor: vars.legacyImageErrorBg,
    padding: vars.spacing.small.midi2x,
    borderRadius: 4
};
const errorStyle: TextStyle = {
    fontSize: vars.font.size12,
    color: vars.lighterBlackText,
    fontStyle: 'italic'
};
const learnMoreStyle = {
    fontSize: vars.font.size12,
    color: vars.peerioBlue
};

export interface FileInlineContainerProps {
    onLayout?: (event: LayoutChangeEvent) => void;
    extraActionIcon?: JSX.Element;
    isImage?: boolean;
    isOpen?: boolean;
    children?: Array<JSX.Element>;
    file: File | ExternalContent;
    onActionSheet?: Function;
    onAction?: () => void;
    onLegacyFileAction?: Function;
}

@observer
export default class FileInlineContainer extends SafeComponent<FileInlineContainerProps> {
    legacyNotification() {
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
        let extension;
        if (file instanceof File) extension = file.ext;
        return (
            <TouchableOpacity onPress={onAction} pressRetentionOffset={vars.retentionOffset}>
                <FileTypeIcon type={fileHelpers.getFileIconType(extension)} size="smaller" />
            </TouchableOpacity>
        );
    }

    get fileName() {
        const { file, onAction } = this.props;
        const name = file instanceof File ? `${file.name} (${file.sizeFormatted})` : '';
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
        let title, description, fileId, downloading, isLegacy;
        if (file instanceof File) {
            const { loaded, deleted } = file;
            ({ fileId, downloading, isLegacy } = file);
            if (!loaded) return null;
            if (deleted) return this.fileUnavailable;
        } else {
            const f = file;
            if (f.type === 'html') {
                ({ title, description } = f);
            }
        }
        const isLocal = !!fileId;
        // TODO: maybe a placeholder instead
        if (isLocal) {
        }
        const spacingDifference = padding - vars.progressBarHeight;
        let containerHeight = isLocal ? 30 : 0;
        if (isLocal && isOpen) containerHeight += padding;
        const outer = {
            padding,
            paddingBottom: downloading && !isImage ? spacingDifference : padding
        };
        const header: ViewStyle = {
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
                                        !isLegacy
                                            ? this.props.onActionSheet(file)
                                            : this.props.onLegacyFileAction(file),
                                    { marginHorizontal: vars.spacing.small.midi2x },
                                    vars.iconSize,
                                    downloading ? true : null
                                )}
                            </View>
                        )}
                    </View>
                    {isLegacy ? this.legacyNotification() : this.props.children}
                </View>
                {!isImage && file instanceof File && <FileProgress file={file} />}
            </View>
        );
    }
}
