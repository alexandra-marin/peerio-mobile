import React from 'react';
import { observer } from 'mobx-react/native';
import { observable, when, reaction, action } from 'mobx';
import {
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    ViewStyle,
    TextStyle
} from 'react-native';
import FLAnimatedImage from 'react-native-gif';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import Progress from '../shared/progress';
import FileProgress from './file-progress';
import FileInlineContainer from './file-inline-container';
import InlineUrlPreviewConsent from './inline-url-preview-consent';
import inlineImageCacheStore, { CachedImage } from './inline-image-cache-store';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import fileState from './file-state';
import settingsState from '../settings/settings-state';
import { clientApp, config, util } from '../../lib/icebear';
import { T, tx } from '../utils/translator';
import { transitionAnimation } from '../helpers/animations';
import { File } from '../../lib/peerio-icebear/models';
import { ExternalContent } from '../../lib/peerio-icebear/helpers/unfurl/types';

const toSettings = text => (
    <Text
        onPress={() => {
            settingsState.transition('preferences');
            settingsState.transition('display');
        }}
        style={{ textDecorationLine: 'underline' }}>
        {text}
    </Text>
);

const toSettingsParser = { toSettings };

const textMessageTextStyle: TextStyle = {
    color: vars.txtDark,
    backgroundColor: 'transparent',
    textAlign: 'center'
};

const text0: TextStyle = {
    color: vars.txtDark,
    backgroundColor: vars.lightGrayBg,
    paddingVertical: 54,
    textAlign: 'center'
};

export interface FileInlineImageProps {
    image: File | ExternalContent;
    onActionSheet: Function;
    isClosed: boolean;
    onAction: Function;
    onLegacyFileAction: Function;
}

const text: TextStyle = {
    color: vars.peerioBlue,
    textAlign: 'center',
    marginVertical: 10
};

// TODO: image urls are now handled by inline-url-container
// remove the URL support from this component

@observer
export default class FileInlineImage extends SafeComponent<FileInlineImageProps> {
    @observable cachedImage;
    @observable width = 0;
    @observable height = 0;
    @observable optimalContentWidth = 0;
    @observable optimalContentHeight = 0;
    @observable opened;
    @observable loaded;
    // image is a bit big but we still can display it manually
    @observable tooBig;
    // image is too big to be displayed
    @observable oversizeCutoff;
    // force loading image
    @observable loadImage;
    @observable showUpdateSettingsLink;
    // set this to true when we have network download problems
    @observable downloadSlow;
    // set this to true, when we have decoding problems
    @observable errorDisplayingImage;
    // TODO: fix icebear behaviour when it doesn't redownload cachingFailed images
    @observable cachingFailed = false;
    @observable loadedBytesCount = 0;
    @observable totalBytesCount = 0;
    outerPadding = 8;
    loadingTimeoutId: NodeJS.Timeout;

    textMessageOuter: ViewStyle = {
        padding: this.outerPadding,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        justifyContent: 'center'
    };

    componentWillMount() {
        this.optimalContentHeight = Dimensions.get('window').height;
        when(() => !!this.cachedImage, () => this.fetchSize());
        const { image } = this.props;
        let fileId, url, isOverInlineSizeLimit, isOversizeCutoff, tmpCachePath, tmpCached;
        if (image instanceof File) {
            ({ fileId, isOverInlineSizeLimit, isOversizeCutoff, tmpCachePath, tmpCached } = image);
            this.tooBig = isOverInlineSizeLimit || isOversizeCutoff;
            this.oversizeCutoff = isOversizeCutoff;
            this.loadImage = fileState.forceShowMap.get(url || fileId);
            when(
                () => image.cachingFailed,
                () => {
                    this.cachingFailed = true;
                }
            );
            // we have local inline file
            when(
                () => clientApp.uiUserPrefs.peerioContentEnabled,
                () => {
                    this.opened = !this.props.isClosed;
                }
            );
            if (!this.loadImage) {
                when(
                    () =>
                        clientApp.uiUserPrefs.peerioContentEnabled &&
                        !this.tooBig &&
                        !this.oversizeCutoff,
                    () => {
                        this.loadImage = true;
                    }
                );
            }
            when(
                () => tmpCached || image.tmpCached,
                () => {
                    this.cachedImage = inlineImageCacheStore.getImage(tmpCachePath);
                }
            );
            if (!image.tmpCached) {
                when(
                    () => this.loadImage,
                    async () => {
                        // TODO: HACK FOR ANDROID
                        // should be replaced with FileStream update to handle content paths
                        if (
                            tmpCachePath.startsWith('content:/') ||
                            (await config.FileStream.exists(tmpCachePath))
                        ) {
                            image.tmpCached = true;
                            return;
                        }
                        image.tryToCacheTemporarily(true);
                        this.handleLoadStart();
                    }
                );
            }
        } else {
            ({ url } = image);
            // we have external url
            when(
                () =>
                    clientApp.uiUserPrefs.externalContentConsented &&
                    clientApp.uiUserPrefs.externalContentEnabled,
                () => {
                    this.loadImage = true;
                }
            );
            this.opened =
                clientApp.uiUserPrefs.externalContentConsented &&
                clientApp.uiUserPrefs.externalContentEnabled &&
                !this.props.isClosed;
            when(
                () => this.loadImage,
                () => {
                    this.cachedImage = inlineImageCacheStore.getImage(url);
                    this.opened = !this.props.isClosed;
                    this.handleLoadStart();
                }
            );
        }

        // if we uploaded the image ourselves and we have it cached
        // TODO: this should be moved to icebear
        const selfTmpCachePath = fileId && fileState.localFileMap.get(fileId);
        if (selfTmpCachePath) {
            this.loadImage = true;
            tmpCached = true;
            tmpCachePath = selfTmpCachePath;
        }
    }

    forceShow = () => {
        this.loadImage = true;
        let key;
        let data = this.props.image;
        if (data instanceof File) {
            key = data.fileId;
        } else {
            key = data.url;
        }
        fileState.forceShowMap.set(key, true);
    };

    fetchSize() {
        const { cachedImage } = this;
        // if width or height is undefined, there was an error loading it
        when(
            () =>
                !!(
                    cachedImage.width !== undefined &&
                    cachedImage.height !== undefined &&
                    this.optimalContentWidth
                ),
            () => {
                const { width, height } = cachedImage;
                const { optimalContentWidth, optimalContentHeight } = this;
                if (width <= 0 && height <= 0) this.onErrorLoadingImage();
                Object.assign(
                    this,
                    vars.optimizeImageSize(width, height, optimalContentWidth, optimalContentHeight)
                );
                // console.debug(`calculated width: ${this.width}, ${this.height}`);
            }
        );
    }

    componentDidMount() {
        reaction(() => this.opened, transitionAnimation);
    }

    layout = evt => {
        this.optimalContentWidth = evt.nativeEvent.layout.width - this.outerPadding * 2 - 2;
    };

    get displayTooBigImageOffer() {
        const outer = {
            padding: this.outerPadding
        };
        const text0 = {
            color: vars.txtDark
        };
        const text = {
            color: vars.peerioBlue,
            marginVertical: 10
        };
        return (
            <View style={outer}>
                <Text style={text0}>
                    {tx('title_imageSizeWarning', {
                        size: util.formatBytes(config.chat.inlineImageSizeLimit)
                    })}
                </Text>
                <TouchableOpacity
                    pressRetentionOffset={vars.retentionOffset}
                    onPress={this.forceShow}>
                    <Text italic style={text}>
                        {tx('button_displayThisImageAfterWarning')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    get displayCutOffImageOffer() {
        const outer: ViewStyle = {
            padding: this.outerPadding,
            height: vars.imageInnerContainerHeight,
            justifyContent: 'center'
        };
        const text0 = {
            color: vars.txtDark
        };
        return (
            <TouchableOpacity
                style={outer}
                onPress={this.imageAction}
                pressRetentionOffset={vars.retentionOffset}>
                <Text style={text0}>
                    {tx('title_imageTooBigCutoff', {
                        size: util.formatBytes(config.chat.inlineImageSizeLimitCutoff)
                    })}
                </Text>
            </TouchableOpacity>
        );
    }

    get displayPoorConnectionDownload() {
        const outer = {
            padding: this.outerPadding
        };
        return (
            <View style={outer}>
                <Text style={text0}>{tx('title_poorConnectionInlineImage')}</Text>
            </View>
        );
    }

    get displayImageOffer() {
        return (
            <TouchableOpacity
                pressRetentionOffset={vars.retentionOffset}
                onPress={() => {
                    this.loadImage = true;
                }}>
                <Text italic style={text}>
                    {tx('button_displayThisImage')}
                </Text>
            </TouchableOpacity>
        );
    }

    get updateSettingsOffer() {
        const text = {
            color: vars.txtDate,
            marginBottom: 4
        };
        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ paddingTop: 2, marginRight: 4 }}>
                    {icons.coloredAsText('check-circle', vars.confirmColor, 14)}
                </View>
                <Text italic style={text}>
                    <T k="title_updateSettingsAnyTime">{toSettingsParser}</T>
                </Text>
            </View>
        );
    }

    get downloadErrorMessage() {
        return (
            <View style={this.textMessageOuter}>
                <Text style={textMessageTextStyle}>{tx('error_messageErrorNotAvailable')}</Text>
            </View>
        );
    }

    get downloadSlowMessage() {
        return (
            <View style={this.textMessageOuter}>
                <Text style={textMessageTextStyle}>{tx('title_poorConnectionExternalURL')}</Text>
            </View>
        );
    }

    @action.bound
    handleLoadStart() {
        this.loadingTimeoutId = setTimeout(() => {
            if (!this.loaded) {
                this.downloadSlow = true;
            }
        }, vars.loadingTimeout);
    }

    @action.bound
    handleLoadEnd() {
        if (this.loadingTimeoutId) {
            clearTimeout(this.loadingTimeoutId);
            this.loadingTimeoutId = null;
        }
    }

    @action.bound
    handleProgress(e) {
        const { loaded, total } = e.nativeEvent;
        this.loadedBytesCount = loaded;
        this.totalBytesCount = total;
    }

    @action.bound
    onLoad() {
        this.loaded = true;
    }

    @action.bound
    onErrorLoadingImage() {
        this.errorDisplayingImage = true;
    }

    @action.bound
    onLoadGif() {
        this.handleLoadEnd();
        this.onLoad();
    }

    get displayErrorMessage() {
        const outer = {
            padding: this.outerPadding
        };
        const text0: TextStyle = {
            color: vars.txtDark,
            backgroundColor: vars.lightGrayBg,
            paddingVertical: vars.spacing.large.midi2x,
            textAlign: 'center',
            paddingHorizontal: vars.spacing.small.maxi
        };
        return (
            <View style={outer}>
                <Text style={text0}>{tx('error_loadingImage')}</Text>
            </View>
        );
    }

    // Opens the image using exists, else attempts to download it
    @action.bound
    imageAction() {
        const { image } = this.props;
        if (image instanceof File) {
            if (image.hasFileAvailableForPreview) {
                image.launchViewer();
            } else {
                fileState.download(image);
            }
        } else {
            console.error('applying file action to external content');
        }
    }

    renderThrow() {
        const { image, onLegacyFileAction } = this.props;
        let fileId, downloading;
        if (image instanceof File) {
            ({ fileId, downloading } = image);
        }
        const { width, height, loaded, showUpdateSettingsLink, cachingFailed } = this;
        const { source, acquiringSize, shouldUseFLAnimated } =
            this.cachedImage || new CachedImage();
        // console.log(`render ${source ? source.uri : null}, shouldUseFLAnimated: ${shouldUseFLAnimated}`);
        const isLocal = !!fileId;
        if (!clientApp.uiUserPrefs.externalContentConsented && !isLocal) {
            return (
                <InlineUrlPreviewConsent
                    onChange={() => {
                        this.showUpdateSettingsLink = true;
                    }}
                />
            );
        }

        const inner: ViewStyle = {
            backgroundColor: loaded ? vars.white : vars.lightGrayBg,
            minHeight: loaded ? undefined : vars.imageInnerContainerHeight,
            justifyContent: 'center'
        };

        const borderRadius = 2;
        const imageStyle = { width, height, borderRadius };
        return (
            <View>
                <FileInlineContainer
                    onLayout={this.layout}
                    file={image}
                    onActionSheet={this.props.onAction}
                    onAction={shouldUseFLAnimated ? null : this.imageAction}
                    onLegacyFileAction={onLegacyFileAction}
                    isImage
                    isOpen={this.opened}
                    extraActionIcon={
                        !downloading &&
                        icons.darkNoPadding(
                            this.opened ? 'arrow-drop-up' : 'arrow-drop-down',
                            () => {
                                this.opened = !this.opened;
                            },
                            { marginHorizontal: vars.spacing.small.midi2x }
                        )
                    }>
                    {this.opened && (
                        <View style={inner}>
                            {!downloading && this.loadImage && width && height ? (
                                /* TODO: make a separate preview for GIF images on iOS */
                                <TouchableOpacity
                                    onPress={shouldUseFLAnimated ? null : this.imageAction}>
                                    {shouldUseFLAnimated ? (
                                        <FLAnimatedImage
                                            source={{ uri: source.uri }}
                                            onLoadEnd={this.onLoadGif}
                                            style={imageStyle}
                                        />
                                    ) : (
                                        <Image
                                            onProgress={this.handleProgress}
                                            onLoadEnd={this.handleLoadEnd}
                                            onLoad={this.onLoad}
                                            onError={this.onErrorLoadingImage}
                                            source={{ uri: source.uri, width, height }}
                                            style={imageStyle}
                                        />
                                    )}
                                </TouchableOpacity>
                            ) : null}
                            {!this.loadImage && !this.tooBig && this.displayImageOffer}
                            {!this.loadImage &&
                                this.tooBig &&
                                !this.oversizeCutoff &&
                                this.displayTooBigImageOffer}
                            {!this.loadImage && this.oversizeCutoff && this.displayCutOffImageOffer}
                            {!this.loaded && cachingFailed && this.downloadErrorMessage}
                            {!this.loaded &&
                                !cachingFailed &&
                                this.downloadSlow &&
                                this.downloadSlowMessage}
                            {this.errorDisplayingImage && this.displayErrorMessage}
                            {(acquiringSize || downloading) &&
                                !this.downloadSlow &&
                                !cachingFailed && <ActivityIndicator />}
                            {this.totalBytesCount > 0 && (
                                <Progress
                                    max={this.totalBytesCount}
                                    value={this.loadedBytesCount}
                                />
                            )}
                        </View>
                    )}
                    {isLocal && image instanceof File && <FileProgress file={image} />}
                </FileInlineContainer>
                {!isLocal && showUpdateSettingsLink && this.updateSettingsOffer}
            </View>
        );
    }
}
