import { LocalizationStrings } from '../utils/translator';

export default interface ButtonProps {
    text: keyof LocalizationStrings;
    subtitle?: keyof LocalizationStrings;
    onPress: Function;
    disabled?: boolean;
    hidden?: boolean;
    accessibilityId?: string;
    style?: any;
    extraTextStyle?: any;
    noPadding?: boolean;
}
