import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { observable, action, when } from 'mobx';
import { observer } from 'mobx-react/native';
import ImagePicker, { ImageCropPicker } from 'react-native-image-crop-picker';
import Text from '../controls/custom-text';
import { tx } from '../utils/translator';
import { vars } from '../../styles/styles';
import FileTypeIcon from './file-type-icon';
import SafeComponent from '../shared/safe-component';
import { fileHelpers, config, warnings } from '../../lib/icebear';
import Thumbnail from '../shared/thumbnail';
import testLabel from '../helpers/test-label';
import TextInputUncontrolled from '../controls/text-input-uncontrolled';
import fonts from '../../styles/fonts';

const nameContainer = {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: vars.spacing.small.midi2x,
    paddingTop: vars.spacing.small.mini,
    paddingBottom: vars.spacing.small.midi2x,
    flexGrow: 1,
    flex: 1
};

// Padding 0 should be kept
const inputStyle = {
    color: vars.lighterBlackText,
    paddingVertical: 0,
    paddingLeft: 0,
    height: vars.searchInputHeight,
    fontFamily: fonts.peerioFontFamily
};

const thumbnailDim = vars.searchInputHeight * 2;

const previewContainerSmall: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: thumbnailDim,
    marginRight: vars.spacing.small.maxi,
    flex: 0
};

interface ImageDimensions {
    width: number;
    height: number;
}

// TODO: move the type definition to plugin
interface ImagePickerPlugin extends ImageCropPicker {
    getImageDimensions: (path: string) => ImageDimensions;
}

export interface FilePreviewProps {
    state: {
        fileName: string;
        path: string;
        name: string;
        ext: string;
    };
}

@observer
export default class FilePreview extends SafeComponent<FilePreviewProps> {
    // width of the container in which image or file type icon is shown
    @observable previewContainerWidth;
    // height of the container in which image or file type icon is shown
    @observable previewContainerHeight;
    // original width of the image we preview
    @observable width;
    // original height of the image we preview
    @observable height;
    // scaled down width of the image we preview
    @observable previewSmallWidth;
    // scaled down height of the image we preview
    @observable previewSmallHeight;

    async componentWillMount() {
        when(
            () => this.previewContainerWidth && this.width,
            () => {
                const { previewContainerWidth, previewContainerHeight, width, height } = this;
                const dims = vars.optimizeImageSize(
                    width,
                    height,
                    previewContainerWidth,
                    previewContainerHeight
                );
                this.previewSmallWidth = dims.width;
                this.previewSmallHeight = dims.height;
            }
        );
        const { path } = this.props.state;
        const { width, height } = await (ImagePicker as ImagePickerPlugin).getImageDimensions(path);
        Object.assign(this, { width, height });
    }

    @action.bound
    layoutPreviewContainer(e) {
        const { width, height } = e.nativeEvent.layout;
        this.previewContainerWidth = width;
        this.previewContainerHeight = height;
    }

    @action.bound
    launchPreviewViewer() {
        config.FileStream.launchViewer(this.props.state.path /*, this.props.state.fileName*/).catch(
            () => {
                warnings.add('snackbar_couldntOpenFile');
            }
        );
    }

    get previewImage() {
        const width = thumbnailDim;
        const height = width;
        return (
            <TouchableOpacity
                pressRetentionOffset={vars.retentionOffset}
                onPress={this.launchPreviewViewer}>
                <Thumbnail path={this.props.state.path} style={{ width, height }} />
            </TouchableOpacity>
        );
    }

    onChangeText = text => {
        this.props.state.name = text;
    };

    renderThrow() {
        const { state } = this.props;
        const fileImagePlaceholder = fileHelpers.isImage(state.ext) ? (
            this.previewImage
        ) : (
            <FileTypeIcon type={fileHelpers.getFileIconType(state.ext)} size="small" />
        );

        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={previewContainerSmall} onLayout={this.layoutPreviewContainer}>
                    {fileImagePlaceholder}
                </View>
                <View style={nameContainer}>
                    <Text style={{ fontSize: vars.font.size12, color: vars.txtLightGrey }}>
                        {tx('title_name')}
                    </Text>
                    <TextInputUncontrolled
                        {...testLabel('title_name')}
                        autoCorrect={false}
                        autoCapitalize="sentences"
                        value={state.name}
                        onChangeText={this.onChangeText}
                        underlineColorAndroid="transparent"
                        style={inputStyle}
                    />
                </View>
            </View>
        );
    }
}
