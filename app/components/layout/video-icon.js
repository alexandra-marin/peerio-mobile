import { Platform } from 'react-native';
import HeaderIconBase from './header-icon-base';
// import { vars } from '../../styles/styles';

const androidJitsi = 'https://play.google.com/store/apps/details?id=org.jitsi.meet';
const iosJitsi = 'https://itunes.apple.com/app/jitsi-meet/id1165103905';
const storeURL = Platform.OS === 'android' ? androidJitsi : iosJitsi;

export default class VideoIcon extends HeaderIconBase {
    icon = 'videocam';
    // style = { borderTopColor: vars.yellowLine, borderTopWidth: 8 };
    action = () => this.props.action(console.log('the store is ', storeURL));
}
