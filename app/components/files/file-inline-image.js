import React from 'react';
import { observer } from 'mobx-react/native';
import { observable, when, reaction } from 'mobx';
import { View, Image, Text, Dimensions, LayoutAnimation, TouchableOpacity, ActivityIndicator } from 'react-native';
import SafeComponent from '../shared/safe-component';
import InlineUrlPreviewConsent from './inline-url-preview-consent';
import inlineImageCacheStore from './inline-image-cache-store';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import settingsState from '../settings/settings-state';
import { clientApp, config, util } from '../../lib/icebear';
import { T, tx } from '../utils/translator';

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

const forceShowMap = observable.map();

const toSettingsParser = { toSettings };

@observer
export default class FileInlineImage extends SafeComponent {
    @observable width = 0;
    @observable height = 0;
    @observable optimalContentWidth = 0;
    @observable optimalContentHeight = 0;
    @observable opened;
    @observable loaded;
    @observable tooBig;
    @observable oversizeCutoff;
    @observable loadImage;
    @observable showUpdateSettingsLink;
    @observable cachedImage;
    @observable errorLoading = false;
    outerPadding = 8;

    componentWillMount() {
        this.optimalContentHeight = Dimensions.get('window').height;
        when(() => this.cachedImage, () => this.fetchSize());
        const { image } = this.props;
        const { fileId, url, isOverInlineSizeLimit, isOversizeCutoff, tmpCachePath } = image;
        this.tooBig = isOverInlineSizeLimit || isOversizeCutoff;
        this.oversizeCutoff = isOversizeCutoff;
        this.loadImage = forceShowMap.get(url || fileId);
        if (fileId) {
            // we have local inline file
            when(() => clientApp.uiUserPrefs.peerioContentEnabled, () => { this.opened = true; });
            if (!this.loadImage) {
                when(() => clientApp.uiUserPrefs.peerioContentEnabled && !this.tooBig && !this.oversizeCutoff,
                    () => { this.loadImage = true; });
            }
            when(() => image.tmpCached, () => {
                this.cachedImage = inlineImageCacheStore.getImage(tmpCachePath);
            });
            if (!image.tmpCached) {
                when(() => this.loadImage, async () => {
                    if (await config.FileStream.exists(tmpCachePath)) {
                        image.tmpCached = true;
                        return;
                    }
                    image.tryToCacheTemporarily(true);
                });
            }
        } else {
            // we have external url
            when(() => clientApp.uiUserPrefs.externalContentConsented && clientApp.uiUserPrefs.externalContentEnabled,
                () => { this.loadImage = true; });
            this.opened =
                clientApp.uiUserPrefs.externalContentConsented && clientApp.uiUserPrefs.externalContentEnabled;
            when(() => this.loadImage, () => {
                this.cachedImage = inlineImageCacheStore.getImage(url);
                this.opened = true;
            });
        }
    }

    forceShow = () => {
        this.loadImage = true;
        const { url, fileId } = this.props.image;
        forceShowMap.set(url || fileId, true);
    }

    fetchSize() {
        const { cachedImage } = this;
        // if width or height is undefined, there was an error loading it
        when(() => cachedImage.width !== undefined && cachedImage.height !== undefined && this.optimalContentWidth, () => {
            const { width, height } = cachedImage;
            const { optimalContentWidth, optimalContentHeight } = this;
            if (width <= 0 && height <= 0) this.onErrorLoadingImage();
            Object.assign(this, vars.optimizeImageSize(width, height, optimalContentWidth, optimalContentHeight));
            // console.debug(`calculated width: ${this.width}, ${this.height}`);
        });
    }

    componentDidMount() {
        reaction(() => this.opened, () => LayoutAnimation.easeInEaseOut());
    }

    layout = (evt) => {
        this.optimalContentWidth = evt.nativeEvent.layout.width - this.outerPadding * 2 - 2;
    }

    get displayTooBigImageOffer() {
        const outer = {
            padding: this.outerPadding
        };
        const text0 = {
            color: vars.txtDark
        };
        const text = {
            color: vars.bg,
            fontStyle: 'italic',
            marginVertical: 10
        };
        return (
            <View style={outer}>
                <Text style={text0}>
                    {tx('title_imageSizeWarning', { size: util.formatBytes(config.chat.inlineImageSizeLimit) })}
                </Text>
                <TouchableOpacity pressRetentionOffset={vars.pressRetentionOffset} onPress={this.forceShow}>
                    <Text style={text}>{tx('button_displayThisImageAfterWarning')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    get displayCutOffImageOffer() {
        const outer = {
            padding: this.outerPadding
        };
        const text0 = {
            color: vars.txtDark
        };
        return (
            <View style={outer}>
                <Text style={text0}>
                    {tx('title_imageTooBigCutoff', { size: util.formatBytes(config.chat.inlineImageSizeLimitCutoff) })}
                </Text>
            </View>
        );
    }

    get displayImageOffer() {
        const text = {
            color: vars.bg,
            fontStyle: 'italic',
            textAlign: 'center',
            marginVertical: 10
        };
        return (
            <TouchableOpacity pressRetentionOffset={vars.pressRetentionOffset} onPress={() => { this.loadImage = true; }}>
                <Text style={text}>{tx('button_displayThisImage')}</Text>
            </TouchableOpacity>
        );
    }

    get updateSettingsOffer() {
        const text = {
            color: vars.txtDate,
            fontStyle: 'italic',
            marginBottom: 4
        };
        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ paddingTop: 2, marginRight: 4 }}>
                    {icons.coloredAsText('check-circle', vars.snackbarBgGreen, 14)}
                </View>
                <Text style={text}>
                    <T k="title_updateSettingsAnyTime">{toSettingsParser}</T>
                </Text>
            </View>
        );
    }

    handleOnLoad = async() => {
        this.loaded = true;
    }

    onErrorLoadingImage = () => {
        this.errorLoading = true;
    }

    get displayErrorLoading() {
        const outer = {
            padding: this.outerPadding
        };
        const text0 = {
            color: vars.txtDark,
            backgroundColor: vars.lightGrayBg,
            paddingVertical: vars.spacing.large.midi2x,
            textAlign: 'center',
            paddingHorizontal: vars.spacing.small.maxi
        };
        return (
            <View style={outer}>
                <Text style={text0}>
                    {tx('error_loadingImage')}
                </Text>
            </View>
        );
    }

    renderThrow() {
        const { image } = this.props;
        const { name, title, description, fileId, downloading } = image;
        const { width, height, loaded, showUpdateSettingsLink } = this;
        const { source } = this.cachedImage || {};
        const isLocal = !!fileId;
        if (!clientApp.uiUserPrefs.externalContentConsented && !isLocal) {
            return <InlineUrlPreviewConsent onChange={() => { this.showUpdateSettingsLink = true; }} />;
        }

        console.debug(`received source: ${width}, ${height}, ${JSON.stringify(source)}`);
        const outer = {
            padding: this.outerPadding,
            borderColor: vars.lightGrayBg,
            borderWidth: 1,
            marginVertical: 4,
            borderRadius: 2
        };

        const header = {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: !downloading && this.opened ? 10 : 0
        };

        const text = {
            flexGrow: 1,
            flexShrink: 1,
            fontWeight: 'bold',
            color: vars.txtMedium,
            textAlignVertical: 'top',
            lineHeight: 25
        };

        const titleText = {
            color: vars.bg,
            marginVertical: 2,
            ellipsizeMode: 'tail'
        };

        const descText = {
            color: vars.txtDark,
            marginBottom: 2
        };

        const inner = {
            backgroundColor: loaded ? vars.white : vars.lightGrayBg
        };

        return (
            <View>
                <View style={outer} onLayout={this.layout}>
                    <View>
                        {!!title && <Text style={titleText}>{title}</Text>}
                        {!!description && <Text style={descText}>{description}</Text>}
                    </View>
                    <View style={header}>
                        {!!name && <Text numberOfLines={1} ellipsizeMode="tail" style={text}>{name}</Text>}
                        {isLocal && <View style={{ flexDirection: 'row' }}>
                            {!downloading && icons.darkNoPadding(
                                this.opened ? 'arrow-drop-up' : 'arrow-drop-down',
                                () => { this.opened = !this.opened; },
                                { marginHorizontal: vars.spacing.small.maxi2x }
                            )}
                            {!downloading && icons.darkNoPadding(
                                'more-vert',
                                () => this.props.onAction(this.props.image),
                                { marginHorizontal: vars.spacing.small.maxi2x }
                            )}
                            {downloading && <ActivityIndicator />}
                        </View>}
                    </View>
                    {this.opened &&
                        <View style={inner}>
                            {!downloading && this.loadImage && width && height ?
                                <Image
                                    source={source}
                                    style={{ width, height }}
                                    onLoad={this.handleOnLoad}
                                    onError={this.onErrorLoadingImage}
                                /> : null}
                            {!this.loadImage && !this.tooBig && this.displayImageOffer}
                            {!this.loadImage && this.tooBig && !this.oversizeCutoff && this.displayTooBigImageOffer}
                            {this.oversizeCutoff && this.displayCutOffImageOffer}
                            {this.errorLoading && this.displayErrorLoading}
                        </View>}
                </View>
                {!isLocal && showUpdateSettingsLink && this.updateSettingsOffer}
            </View>
        );
    }
}
