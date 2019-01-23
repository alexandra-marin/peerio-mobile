import { vars } from './styles';
import { ViewStyle } from 'react-native';

const formStyle = {
    flex: 1,
    padding: vars.spacing.medium.midi2x,
    alignItems: 'center'
};

const textNormal = {
    color: vars.lighterBlackText,
    fontSize: vars.font.size14,
    lineHeight: 24,
    marginBottom: vars.spacing.small.maxi,
    justifyContent: 'center',
    textAlign: 'center'
};

const titleDark = [
    textNormal,
    {
        color: vars.black,
        fontSize: vars.font.size16
    }
];

const container = {
    flex: 1,
    backgroundColor: 'white'
};

const headerContainer = {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: vars.headerHeight,
    backgroundColor: vars.darkBlue
};

const textStyle = {
    flex: 1,
    color: vars.white,
    fontSize: vars.font.size18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'transparent'
};

const skipButtonStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0
};

const listHeader: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: vars.black05,
    height: vars.sectionHeaderHeight,
    paddingRight: vars.spacing.small.maxi2x
};

const textListTitle = {
    paddingLeft: vars.spacing.medium.maxi2x,
    color: vars.textBlack54
};

// TODO add shadow
const footerContainer: ViewStyle = {
    height: vars.contactlistItemHeight,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: vars.spacing.small.maxi2x,
    borderTopWidth: 1,
    borderTopColor: vars.black25
};

export {
    formStyle,
    textNormal,
    titleDark,
    container,
    headerContainer,
    textStyle,
    skipButtonStyle,
    listHeader,
    textListTitle,
    footerContainer
};
