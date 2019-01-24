import React from 'react';
import { View, Image, ViewStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import { observable, when, action, reaction } from 'mobx';
import ImagePicker from 'react-native-image-crop-picker';
import { vars } from '../../styles/styles';
import SafeComponent from './safe-component';

const imagePreviewStyle = {
    borderRadius: 2
};

interface ThumbnailProps {
    path: string;
    style: ViewStyle;
}

@observer
export default class Thumbnail extends SafeComponent<ThumbnailProps> {
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

    @action.bound
    async updatePath(path) {
        this.width = 0;
        this.height = 0;
        this.previewSmallWidth = 0;
        this.previewSmallHeight = 0;
        if (!path) return;
        when(
            () => this.previewContainerWidth && this.width && this.height,
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
        console.log(`file-share-preview: trying to make thumbnail for ${path}`);
        try {
            const { width, height } = await (ImagePicker as any).getImageDimensions(path);
            console.log(`file-share-preview: got width ${width} and height ${height}`);
            Object.assign(this, { width, height });
        } catch (e) {
            console.log(`file-share-preview: got an error`);
            console.error(e);
        }
    }

    componentWillMount() {
        reaction(() => this.props.path, this.updatePath, { fireImmediately: true });
    }

    @action.bound
    layoutPreviewContainer(e) {
        const { width, height } = e.nativeEvent.layout;
        this.previewContainerWidth = width;
        this.previewContainerHeight = height;
    }

    get readyToDisplay() {
        return this.width && this.height && this.previewSmallHeight && this.previewSmallWidth;
    }

    get image() {
        if (!this.readyToDisplay) return null;
        return (
            <Image
                source={{
                    uri: this.props.path,
                    width: this.previewSmallWidth,
                    height: this.previewSmallHeight
                }}
                style={imagePreviewStyle}
            />
        );
    }

    render() {
        if (!this.props.path) return null;
        return (
            <View
                onLayout={this.layoutPreviewContainer}
                style={[{ alignItems: 'center', justifyContent: 'center' }, this.props.style]}>
                {this.image}
            </View>
        );
    }
}
