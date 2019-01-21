const EN = process.env.EXECUTABLE_NAME || 'peeriomobile';
console.log(`Branding ${EN}`);

const brandingDefines = {
    name: EN,
    peeriomobile: {
        bg: '#2C95CF',
        bgGradient: '#32CEC3',
        tabsBg: '#f7f7f7',
        logo: require('../assets/logo-with-tag.png'),
        darkBlue: '#040B40',
        darkTeal: '#004E69',
        peerioBlue: '#408CFF',
        peerioPurple: '#5461CC',
        peerioTeal: '#02CEDB',
        yellow: '#FDC700',
        red: '#E90162',
        tabsFg: '#757575',
        badgeText: '#040B40',
        chatItemPressedBackground: '#D7E5FA',
        filesBg: '#F2F2F5',
        invitedBadgeColor: '#408CFF',
        invitedBadgeText: '#FFFFFF',
        peerioBlueBackground15: '#D6E2F5',
        darkBlueBackground15: '#D9DAE2',
        usernameHighlight: '#accdfd',
        selfUsernameHighlight: '#32CEC3',
        confirmColor: '#02CEDB',
        lightGrayBg: '#f0f0f0',
        darkBlueBackground05: '#F2F2F5',
        snackbarBg: '#040B40',
        channelInfoBg: '#F2F2F5',
        separatorColor: '#f0f0f0'
    },
    expandoo: {
        bg: '#009dfd',
        bgGradient: '#009dfd',
        tabsBg: '#f7f7f7',
        tabsFg: '#757575',
        logo: require('../assets/expandoo-logo-white.png')
    },
    medcryptor: {
        bg: '#FF6600',
        bgGradient: '#FFFFFF',
        logo: require('../assets/logo-with-tag.png'),
        darkBlue: '#FF8C00',
        snackbarBg: '#444444',
        darkTeal: '#004E69',
        peerioBlue: '#FF8C00',
        peerioPurple: '#FF6600',
        peerioTeal: '#FF8C00',
        confirmColor: '#00DF3F',
        yellow: '#F5AB3F',
        red: '#FF6666',
        tabsFg: '#757575',
        badgeText: '#FFFFFF',
        chatItemPressedBackground: '#FFF6E1',
        filesBg: '#FFFFFF',
        invitedBadgeColor: '#00DF3F',
        invitedBadgeText: '#000000',
        peerioBlueBackground15: '#FFF6E1',
        darkBlueBackground15: '#EDEDED',
        lightGrayBg: '#FFFFFF',
        darkBlueBackground05: '#F5F5F5',
        usernameHighlight: '#FFB300',
        selfUsernameHighlight: '#32CEC3',
        channelInfoBg: '#FFFFFF',
        separatorColor: '#f0f0f0'
    }
};

const branding = brandingDefines[EN];
branding.name = EN;

export default branding;
