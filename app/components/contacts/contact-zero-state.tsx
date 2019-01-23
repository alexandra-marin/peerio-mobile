import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Image, Dimensions, TextStyle, ViewStyle } from 'react-native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import { tx } from '../utils/translator';
import { vars } from '../../styles/styles';
import testLabel from '../helpers/test-label';
import ViewWithDrawer from '../shared/view-with-drawer';
import drawerState from '../shared/drawer-state';
import { adjustImageDimensions } from '../helpers/image';
import preferenceStore from '../settings/preference-store';
import SyncContactsButton from '../shared/sync-contacts-button';
import zeroStateBeacons from '../beacons/zerostate-beacons';

const { width } = Dimensions.get('window');

const blueArrowSrc = require('../../assets/arrow-blue.png');
const zeroStateImage = require('../../assets/contact-zero-state.png');

const container: ViewStyle = {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center'
};

const wrapper = {
    flex: 1,
    flexGrow: 1
};

const headerStyle: TextStyle = {
    color: vars.peerioBlue,
    fontSize: vars.font.size20,
    textAlign: 'center',
    marginTop: vars.isDeviceScreenBig ? vars.spacing.medium.midi2x : vars.spacing.medium.mini2x,
    marginBottom: vars.isDeviceScreenBig ? vars.spacing.huge.mini2x : vars.spacing.large.maxi2x
};

const textStyle: TextStyle = {
    fontSize: vars.font.size16,
    color: vars.textBlack87,
    textAlign: 'center',
    width: 200,
    marginTop: vars.isDeviceScreenBig ? vars.spacing.large.midixx : vars.spacing.medium.maxi2x,
    marginBottom: vars.isDeviceScreenBig ? vars.spacing.medium.mini2x : vars.spacing.small.maxi
};

@observer
export default class ContactZeroStatePlaceholder extends SafeComponent {
    get title() {
        return (
            <View>
                <Text style={headerStyle} {...testLabel('title_addYourContacts')}>
                    {tx('title_addYourContacts')}
                </Text>
                {!drawerState.getDrawer() && (
                    <Image
                        source={blueArrowSrc}
                        style={{
                            width: vars.isDeviceScreenBig
                                ? vars.contactZeroStateArrowWidth
                                : vars.contactZeroStateArrowWidthSmall,
                            height: vars.isDeviceScreenBig
                                ? vars.contactZeroStateArrowHeight
                                : vars.contactZeroStateArrowHeightSmall,
                            position: 'absolute',
                            top: vars.isDeviceScreenBig
                                ? vars.spacing.small.midi2x
                                : vars.spacing.small.maxi,
                            right: vars.isDeviceScreenBig
                                ? vars.spacing.large.mini
                                : vars.spacing.medium.maxi2x
                        }}
                    />
                )}
            </View>
        );
    }

    get bottomTitle() {
        const text = preferenceStore.prefs.importContactsInBackground
            ? 'title_contacts_zeroState1'
            : 'title_contacts_zeroState0';
        return (
            <View style={{ alignItems: 'center' }}>
                <Text style={textStyle} {...testLabel('title_addYourContacts')}>
                    {tx(text)}
                </Text>
            </View>
        );
    }

    get zeroStateIllustration() {
        return (
            <View style={{ alignItems: 'center' }}>
                <Image
                    source={zeroStateImage}
                    style={adjustImageDimensions(zeroStateImage, width, null)}
                />
            </View>
        );
    }

    renderThrow() {
        return (
            <View style={container}>
                <ViewWithDrawer style={wrapper} alwaysBounceVertical={false}>
                    {this.title}
                    {this.zeroStateIllustration}
                    {this.bottomTitle}
                    {preferenceStore.prefs.importContactsInBackground ? null : (
                        <SyncContactsButton beacon={zeroStateBeacons.syncBeacon} />
                    )}
                </ViewWithDrawer>
            </View>
        );
    }
}
