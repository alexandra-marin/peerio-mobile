import { GestureResponderEvent } from 'react-native';
import { Contact } from './lib/icebear';
import { ImageCropPicker } from 'react-native-image-crop-picker';

declare global {
    type OnPressResponder = (event: GestureResponderEvent) => any;

    interface ContactInvitable extends Contact {
        invited?: boolean;
    }

    interface RNNavigator {
        userAgent?: string;
    }

    interface GlobalExtended extends NodeJS.Global {
        navigator: RNNavigator;
        icebear: object;
        // test functions
        testConfirmEmail: () => Promise<any>;
        fileEncryptionStatus: number;
    }

    interface ImagePickerExtended extends ImageCropPicker {
        getImageDimensions: Function;
    }
}
