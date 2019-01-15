import { Platform, Dimensions, PixelRatio } from 'react-native';
import deviceInfo from 'react-native-device-info';

import branding from './branding';

const { width, height } = Dimensions.get('window');

function getDevicePixelRatio() {
    const result = PixelRatio.get();
    switch (result) {
        case 1:
            return 160;
        case 1.5:
            return 240;
        case 2:
            return 320;
        case 3:
            return 480;
        case 3.5:
            return 560;
        case 4:
            return 640;
        default:
            return -1;
    }
}

const devicePixelRatio = getDevicePixelRatio();

function isIphoneX() {
    return deviceInfo.hasNotch();
}

const iPhoneXTop = isIphoneX() ? 16 : 0;
const iPhoneStatusBar = Platform.OS === 'ios' ? 18 + iPhoneXTop : 0;
const iPhoneXBottom = isIphoneX() ? 16 : 0;

const isDeviceScreenBig = isBigScreenSize();
const isDeviceScreenSmall = !isDeviceScreenBig;

// Find a better way to determine if a device is considered 'big' or 'small'
function isBigScreenSize() {
    if (width >= 350 || height >= 600) return true;
    return false;
}

const { bg, bgGradient, tabsFg } = branding;
const {
    darkBlue,
    darkTeal,
    peerioBlue,
    peerioPurple,
    confirmColor,
    peerioTeal,
    yellow,
    red,
    badgeText,
    filesBg,
    selfUsernameHighlight,
    usernameHighlight,
    chatItemPressedBackground,
    invitedBadgeColor,
    invitedBadgeText,
    peerioBlueBackground15,
    darkBlueBackground15,
    snackbarBg,
    lightGrayBg,
    darkBlueBackground05,
    channelInfoBg,
    separatorColor
} = branding;
const statusBarHeight = iPhoneStatusBar;
const layoutPaddingTop = iPhoneStatusBar;

const r = 40;
const retentionOffset = { top: r, left: r, bottom: r, right: r };

const tabCellHeight = 56;

// pixel ratio should be factored into scaleDim somehow: const pixRatio = PixelRatio.get();
// const defaultHeight = 667;
// scaleDim takes a size value and returns one that is adjusted to the height of the device as it compares to an iPhone 6
// const scaleDim = size => height / defaultHeight * size;
function scaleDim(size: number) {
    return size; // temporary making scaleDim do nothing
}

const vars = {
    // TODO categorize vars
    darkBlue,
    darkTeal,
    peerioBlue,
    peerioPurple,
    peerioTeal,
    yellow,
    red,
    badgeText,
    filesBg,
    chatItemPressedBackground,
    invitedBadgeColor,
    invitedBadgeText,
    confirmColor,
    snackbarBg,
    channelInfoBg,
    separatorColor,
    chatFadingOutBg: 'rgb(237,237,238)',
    textWhite100: '#FFF',
    textWhite70: 'rgba(255, 255, 255, .7)',
    textWhite50: 'rgba(255, 255, 255, .5)',
    textDarkGrey: '#343434',
    // Text
    textBlack38: 'rgba(0, 0, 0, .38)',
    textBlack54: 'rgba(0, 0, 0, .54)',
    textBlack87: 'rgba(0, 0, 0, .87)',
    textDarkBlue54: 'rgba(4, 11, 64, 0.54)',
    linkColor: '#0e94cb',
    // Non-text
    black03: 'rgba(0, 0, 0, 0.03)',
    black05: 'rgba(0, 0, 0, 0.05)',
    black07: 'rgba(0, 0, 0, 0.07)',
    black12: 'rgba(0, 0, 0, 0.12)',
    black25: 'rgba(0, 0, 0, 0.25)',
    black38: 'rgba(0, 0, 0, .38)',
    black54: 'rgba(0, 0, 0, .54)',
    darkBlueBackground05, // darkBlue 5%
    darkBlueBackground15, // darkBlue 15%
    peerioBlueBackground05: '#E9EDF6', // peerioBlue 5%
    peerioBlueBackground15, // peerioBlue 15%
    darkBlueDivider12: '#E0E1E8', // darkBlue 12%
    darkBlueTransparent30: 'rgba(4, 11, 64, 0.3)', // darkBlue 30%
    roomInviteCircleHeight: 18,
    roomInviteCircleWidth: 31,
    unreadCircleHeight: 22,
    unreadCircleWidth: 31,
    unreadTextColor: '#040B40',
    adminBadgeColor: 'rgba(0, 0, 0, 0.12)',
    progressBarBackground: 'rgba(0, 0, 0, .12)',
    toggleDefault: '#747474',
    toggleActive: peerioBlue,
    toggleInactive: '#9B9B9B',
    toggleLineActive: '#B6D3FF',
    toggleLineInactive: '#CFCFCF',
    imageInnerContainerHeight: 140,
    chatUnreadIndicatorBg: 'rgba(255, 255, 255, 0.95)',
    chatUnreadIndicatorWidth: 70,
    chatUnreadIndicatorHeight: 32,
    contactInviteSuggestionBg: '#D2EDF1',
    contactInviteSuggestionHeight: 64,
    popupPadding: scaleDim(20),
    popupHorizontalMargin: scaleDim(16),
    topDrawerHeight: 192,
    tfaInputWidth: scaleDim(124),
    beaconWidth: scaleDim(272),
    beaconBorderWidth: 4,
    beaconBg: '#5461CC',
    beaconPadding: 8,
    pointerPadding: 16,
    pointerHeight: 12,
    pointerWidth: 28,
    beaconLineHeight: scaleDim(16),
    signupButtonWidth: 82,
    scrollOffset: 500, // arbitrary large offset

    circle: 10,
    circleSize: 4,
    bg,
    bgGradient,
    tabsFg,
    bgGreen: '#38CE86',
    bgHighlight: 'rgba(50, 176, 227, 0.38)',
    semiTransparentBg: 'rgba(44, 149, 207, 0.24)',
    disabled: '#00000020',
    highlight: '#FFFFFFCC',
    midlight: '#FFFFFF55',
    redWarning: '#D0021B',
    black: '#000',
    white: '#fff',
    whiteIcon: '#fff',
    selfUsernameHighlight,
    usernameHighlight,
    darkIcon: '#0000008A',
    disabledIcon: '#0000000D',
    txtLight: '#bfdfef',
    txtAlert: '#ff0000aa',
    txtLightGrey: '#7B7B7B',
    txtDark: 'rgba(28, 28, 28, 1)',
    txtMedium: 'rgba(98, 98, 98, 1)',
    txtDate: 'rgba(0, 0, 0, .38)',
    inputBg: '#fff',
    legacyImageErrorBg: 'rgba(196, 196, 196, 0.12)',
    legacyFileTitle: '#ECECEC',
    legacyFileTitleBg: 'rgba(0, 0, 0, 0.54)',
    lightGrayBg,
    mediumGrayBg: '#D0D0D0',
    opacity54: 0.54,
    pickerBg: 'rgba(255, 255, 255, .12)',
    pickerText: '#fff',
    subtleBg: '#c3dfee',
    subtleText: 'rgba(0, 0, 0, .54)',
    extraSubtleText: 'rgba(0, 0, 0, .38)',
    subtleTextBold: 'rgba(0, 0, 0, .54)',
    lighterBlackText: 'rgba(0, 0, 0, .87)',
    inputBgInactive: 'rgba(255, 255, 255, .5)',
    inputBgInactiveText: 'rgba(0,0,0, .54)',
    checkboxDisabled: 'rgba(0,0,0,.12)',
    inputBorderColor: 'rgba(0,0,0, .38)',
    checkboxInactive: 'rgba(0,0,0,.06)',
    checkboxIconInactive: 'rgba(0, 0, 0, .54)',
    checkboxIconActive: peerioBlue,
    snackbarBgGreen: '#38CE86',
    snackbarHeight: 48,
    popupMinHeight: scaleDim(110),
    settingsListPadding: 16,
    settingsItemHeight: 56,
    largeSettingsItemHeight: 72,
    accountSettingsIconColor: '#5461CC',
    helpSettingsIconColor: '#A35EAA',
    signoutSettingsButtonBg: 'rgba(255, 255, 255, .6)',
    headerBorderColor: 'rgba(0,0,0,.06)',
    folderRemoveNotifBg: 'rgba(0,0,0,.06)',
    folderRemoveNotifHeight: 95,
    gold: '#ffd700',
    fabEnabled: '#FF7D00',
    fabDisabled: '#CFCFCF',
    buttonGreen: '#2CCF84',
    fileUploadProgressColor: 'rgba(50, 206, 195, 0.12)',
    footerMarginX: 24,
    statusBarHeight,
    layoutPaddingTop,
    welcomeHeaderHeight: isDeviceScreenBig ? 80 + iPhoneXTop : 64,
    headerHeight: 56,
    headerSpacing: 56 + layoutPaddingTop,
    headerIconMargin: 16,
    iconSize: 24,
    iconSizeSmall: 16,
    iconSizeMedium: 32,
    iconSizeMedium2x: 40,
    iconSizeLarge: 48,
    iconSizeLarge2x: 56,
    iconSizeHuge: 64,
    iconFileViewSize: 72,
    iconPadding: 12,
    iconPaddingLarge: 16,
    iconSizeBigger: 25,
    iconMargin: 30,
    imagePreviewSize: 48,
    sectionHeaderHeight: 48,
    chatListItemDMHeight: 61,
    removeButtonHeight: 44,
    warningHeight: 70,
    roundedButtonWidth: 155,
    wideRoundedButtonWidth: 190,
    menuWidthRatio: 0.8,
    animationDuration: 200,
    progressBarHeight: 4,
    inlineFolderContainerHeight: 48,
    filesListItemHeight: 64,
    contactlistItemHeight: 56,
    listItemHeight: 56,
    listViewPaddingVertical: 18,
    listViewPaddingHorizontal: 8,
    avatarDiameter: 36,
    disabledButtonFontColor: '#DDDDDD',
    actionSheetOptionHeight: 56,
    actionSheetFontColor: '#0076FF',
    destructiveButtonFontColor: '#D0021B',
    actionSheetButtonColor: '#f6f6f8',
    actionSheetButtonBorderColor: '#dbdbe2',
    pinnedChatIconSize: 16,
    pinnedChatPaddingHorizontal: 2,
    fileListHorizontalPadding: scaleDim(16),
    fileInnerItemPaddingRight: 8,
    loadingScreenMarginTop: scaleDim(206),
    loadingScreenMarginBottom: scaleDim(170),
    dmInvitePaddingTop: scaleDim(90),
    verificationMessageWidth: scaleDim(260),
    modalPaddingVertical: 40,
    modalPaddingHorizontal: 40,
    wizardPadding: 36,
    height80: height * 0.8,
    topCircleSizeSmall: 52,
    contactZeroStateArrowWidth: 50,
    contactZeroStateArrowWidthSmall: 40,
    contactZeroStateArrowHeight: 30,
    contactZeroStateArrowHeightSmall: 24,

    font: {
        size8: 8,
        size9: 9,
        size10: 10,
        size11: 11,
        size12: 12,
        size14: 14,
        size16: 16,
        size18: 18,
        size20: 20,
        size24: 24,
        size27: 27,
        size30: 30,
        size36: 36
    },

    accountTitleFontSize: scaleDim(37),
    accountListFontSize: scaleDim(21),
    signupFontSize: scaleDim(36),
    profileEditFontSize: scaleDim(60),
    avatarLetterSize: scaleDim(9),
    readReceiptFontSize: scaleDim(12),
    sharedWithNumberFontColor: '#F2F2F2',
    sharedWithNumberBackground: 'grey',
    fontTitleSize: 16,
    largeInputWidth: 240,
    inputHeight: 48,
    searchInputHeight: 32,
    inputPaddingLeft: 10,
    inputPaddingHorizontal: 8,
    inputMarginHorizontal: 16,
    inputPaddedHeight: 56,
    inputHeightLarge: 68,
    fabSize: 60,
    fabRight: 16,
    fabBottom: 32,
    devicePixelRatio,
    retentionOffset,
    iPhoneXBottom,
    tabCellHeight,
    tabsHeight: tabCellHeight + iPhoneXBottom,
    spacing: {
        one: scaleDim(1),
        small: {
            mini: scaleDim(2),
            mini2x: scaleDim(4),
            midi: scaleDim(6),
            midi2x: scaleDim(8),
            maxi: scaleDim(10),
            maxi2x: scaleDim(12)
        },
        medium: {
            mini: scaleDim(14),
            mini2x: scaleDim(16),
            midi: scaleDim(18),
            midi2x: scaleDim(20),
            maxi: scaleDim(22),
            maxi2x: scaleDim(24)
        },
        large: {
            mini: scaleDim(25),
            minix: scaleDim(28),
            mini2x: scaleDim(30),
            midi: scaleDim(32),
            midixx: scaleDim(34),
            midi2x: scaleDim(36),
            maxi: scaleDim(40),
            maxi2x: scaleDim(44),
            maxi3x: scaleDim(48)
        },
        huge: {
            mini: scaleDim(50),
            minixx: scaleDim(54),
            mini2x: scaleDim(56),
            midi: scaleDim(60),
            midi2x: scaleDim(64),
            midi3x: scaleDim(68),
            maxi: scaleDim(74),
            maxi2x: scaleDim(75),
            maxi3x: scaleDim(80)
        }
    },
    loadingTimeout: 15000,
    isDeviceScreenBig,
    isDeviceScreenSmall,
    fileType: {
        icon: 16,
        smaller: 24,
        small: 32,
        medium: 48,
        large: 72
    },
    button: {
        touchableHeight: 48,
        buttonHeight: 36,
        minWidth: 96,
        borderRadius: 24,
        paddingHorizontal: scaleDim(12),
        marginVertical: scaleDim(8),
        fontSize: scaleDim(14)
    },
    // TODO
    iconLayoutSize: 0,
    optimizeImageSize
};

vars.iconLayoutSize = vars.iconSize + vars.iconPadding * 2;

function optimizeImageSize(
    sourceWidth: number,
    sourceHeight: number,
    containerWidth: number,
    containerHeight: number
) {
    let w = sourceWidth + 0.0,
        h = sourceHeight + 0.0;
    if (w > containerWidth) {
        h *= containerWidth / w;
        w = containerWidth;
    }
    if (h > containerHeight) {
        w *= containerHeight / h;
        h = containerHeight;
    }
    return {
        width: Math.floor(w),
        height: Math.floor(h)
    };
}

export default vars;
