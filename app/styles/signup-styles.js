import vars from './vars';

const pagePaddingLarge = vars.spacing.medium.maxi2x;
const pagePadding = vars.spacing.medium.mini2x;

const page = {
    backgroundColor: vars.white,
    flex: 1
};

const progressBarContainer = {
    marginTop: vars.spacing.small.mini,
    marginHorizontal: vars.spacing.small.mini,
    height: vars.progressBarHeight,
    flexDirection: 'row'
};

const filledProgressBar = {
    flex: 1,
    borderRadius: 8,
    backgroundColor: vars.peerioBlue
};

const emptyProgressBar = {
    flex: 1,
    borderRadius: 8,
    backgroundColor: vars.black12
};

const container = {
    flex: 0,
    paddingHorizontal: pagePadding,
    paddingTop:
        vars.spacing.huge.midi2x -
        // because container is always below the progressBar in the signup screens
        (progressBarContainer.marginTop + progressBarContainer.height) -
        // smaller distance on smaller phones
        (vars.isDeviceScreenSmall ? vars.spacing.medium.maxi2x : 0)
};

const container2 = {
    paddingHorizontal: pagePadding,
    // align title with the one from signup-step-3
    paddingTop: 68
};

const backupAkPage = {
    paddingHorizontal: pagePadding,
    paddingTop: vars.isDeviceScreenBig ? 96 : 68
};

const headerContainer = {
    marginTop: vars.spacing.small.maxi2x,
    marginBottom: vars.spacing.medium.maxi
};

const headerStyle = {
    fontSize: vars.font.size27,
    color: vars.darkBlue,
    marginBottom: vars.spacing.small.midi
};

const headerStyle2 = {
    fontSize: vars.font.size27,
    color: vars.darkBlue,
    marginBottom: vars.spacing.medium.midi
};

const descriptionStyle = {
    color: vars.textBlack87,
    marginBottom: vars.spacing.medium.maxi2x
};

const description = [
    descriptionStyle,
    {
        fontSize: vars.font.size18
    }
];

const description2 = [
    descriptionStyle,
    {
        fontSize: vars.isDeviceScreenBig ? vars.font.size16 : vars.font.size14
    }
];

const generateAkDescription = [
    descriptionStyle,
    {
        fontSize: vars.isDeviceScreenBig ? vars.font.size18 : vars.font.size14
    }
];

const subTitle = {
    color: vars.textBlack87,
    fontSize: vars.isDeviceScreenBig ? vars.font.size16 : vars.font.size14,
    marginBottom: 0
};

const separator = {
    height: 1,
    backgroundColor: vars.darkBlueDivider12,
    marginVertical: vars.spacing.medium.mini2x
};

const suggestionContainer = {
    maxHeight: 50,
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    overflow: 'hidden',
    // to allow possible third row in suggested usernames to be hidden
    borderBottomWidth: 1,
    borderBottomColor: page.backgroundColor
};

const suggestionTitle = {
    color: vars.textBlack54,
    marginRight: vars.spacing.small.midi2x
};

export default {
    pagePaddingLarge,
    pagePadding,
    page,
    progressBarContainer,
    filledProgressBar,
    emptyProgressBar,
    container,
    container2,
    backupAkPage,
    headerContainer,
    headerStyle,
    headerStyle2,
    description,
    description2,
    generateAkDescription,
    separator,
    suggestionContainer,
    suggestionTitle,
    subTitle
};
