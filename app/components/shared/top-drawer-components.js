import React from 'react';
import moment from 'moment';
import { View, Linking } from 'react-native';
import { when } from 'mobx';
import { observer } from 'mobx-react/native';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import TopDrawer from '../shared/top-drawer';
import { tx } from '../utils/translator';
import AvatarCircle from './avatar-circle';
import SafeComponent from './safe-component';
import { chatState } from '../states';
import signupState from '../signup/signup-state';
import { config, telemetry, serverSettings } from '../../lib/icebear';
import drawerState from './drawer-state';
import preferenceStore from '../settings/preference-store';
import fileState from '../files/file-state';
import tm from '../../telemetry';

const { S } = telemetry;

const outerCircle = {
    width: vars.iconSizeMedium2x,
    height: vars.iconSizeMedium2x,
    borderRadius: vars.iconSizeMedium2x / 2,
    backgroundColor: vars.black05,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vars.spacing.small.mini2x,
    marginBottom: vars.spacing.medium.mini
};
const innerCircle = {
    width: vars.iconSizeMedium,
    height: vars.iconSizeMedium,
    borderRadius: vars.iconSizeMedium / 2,
    backgroundColor: vars.black07,
    justifyContent: 'center',
    alignItems: 'center'
};

@observer
class TopDrawerBackupAccountKey extends SafeComponent {
    renderThrow() {
        const action = () => {
            signupState.saveAccountKey({ sublocation: S.TOP_DRAWER });
            tm.signup.saveAk({ sublocation: S.TOP_DRAWER });
        };
        return (
            <TopDrawer
                {...this.props}
                heading={tx('title_backupAk')}
                image={
                    <View style={outerCircle}>
                        <View style={innerCircle}>{icons.darkNoPadding('file-download')}</View>
                    </View>
                }
                descriptionLine1={tx('title_backupAkReminderMobile')}
                buttonText={tx('button_backupNow')}
                buttonAction={action}
            />
        );
    }
}

@observer
class TopDrawerMaintenance extends SafeComponent {
    static trigger() {
        let informInterval = Number.MAX_SAFE_INTEGER;
        const { lastTimeSawMaintenanceNotice } = preferenceStore.prefs;
        if (lastTimeSawMaintenanceNotice) {
            try {
                informInterval = new Date() - new Date(lastTimeSawMaintenanceNotice);
            } catch (e) {
                console.log(e);
            }
        }
        // 24 hour interval between notices
        const MIN_INFORM_INTERVAL = 24 * 60 * 60 * 1000;
        return (
            serverSettings.maintenanceWindow &&
            serverSettings.maintenanceWindow.length === 2 &&
            informInterval > MIN_INFORM_INTERVAL
        );
    }

    static triggerAction() {
        preferenceStore.prefs.lastTimeSawMaintenanceNotice = new Date();
    }

    readMore() {
        Linking.openURL(config.translator.urlMap.maintenanceReadMore.link);
    }

    renderThrow() {
        // double checking in case maintenance window was set to null right before render
        if (!TopDrawerMaintenance.trigger()) return null;
        const [start, end] = serverSettings.maintenanceWindow.map(date =>
            moment(date).format('DD/MM/YYYY hh:mm')
        );
        return (
            <TopDrawer
                {...this.props}
                heading={tx('dialog_scheduledMaintenance')}
                image={icons.imageIcon(
                    require('../../assets/info-icon.png'),
                    vars.iconSizeMedium2x
                )}
                descriptionLine1={tx('dialog_scheduledMaintenanceDates', { start, end })}
                buttonText={tx('title_readMore')}
                buttonAction={this.readMore}
            />
        );
    }
}

class TopDrawerNewContact extends SafeComponent {
    renderThrow() {
        const { contact } = this.props;
        if (!contact) throw new Error('Must pass contact as props');
        return (
            <TopDrawer
                {...this.props}
                heading={tx('title_newContactHeading')}
                image={
                    <View style={{ padding: vars.spacing.small.maxi2x }}>
                        <AvatarCircle contact={contact} />
                    </View>
                }
                descriptionLine1={tx('title_newContactDescription', {
                    username: contact.username,
                    email: contact.addresses[0]
                })}
                buttonText={tx('button_startChat')}
                buttonAction={() => chatState.startChat([contact])}
            />
        );
    }
}

@observer
class TopDrawerPendingFiles extends SafeComponent {
    learnMore() {
        Linking.openURL(config.translator.urlMap.pendingFiles.link);
    }

    renderThrow() {
        // no localization because of temporary nature
        const descriptionLine1 = `Files marked “pending” will be removed.`;
        return (
            <TopDrawer
                {...this.props}
                heading="Note on “Pending” Files"
                image={icons.imageIcon(
                    require('../../assets/info-icon.png'),
                    vars.iconSizeMedium2x
                )}
                {...{ descriptionLine1 }}
                buttonText={tx('button_learnMore')}
                buttonAction={this.learnMore} // TODO fix link
            />
        );
    }
}

class TopDrawerAutoMount extends SafeComponent {
    async componentDidMount() {
        await new Promise(resolve => when(() => preferenceStore.loaded, resolve));
        drawerState.addDrawerTrigger(
            TopDrawerPendingFiles,
            'files', // triggered when route is 'files'
            {}, // empty additional props
            () =>
                preferenceStore.prefs.pendingFilesBannerVisible &&
                fileState.store.folderStore.root.hasLegacyFiles,
            () => {
                preferenceStore.prefs.pendingFilesBannerVisible = false;
            }
        );
        drawerState.addDrawerTrigger(
            TopDrawerMaintenance,
            null, // global context
            {}, // empty additional props
            TopDrawerMaintenance.trigger,
            TopDrawerMaintenance.triggerAction
        );
    }

    renderThrow() {
        return null;
    }
}

@observer
class TopDrawerPeerioClosure extends SafeComponent {
    renderThrow() {
        const url =
            'https://support.peerio.com/hc/en-us/articles/360021688172-Peerio-Service-Closure-FAQs';
        return (
            <TopDrawer
                {...this.props}
                heading="Announcement"
                image={icons.imageIcon(
                    require('../../assets/icons/info-icon-red.png'),
                    vars.iconSizeMedium2x
                )}
                descriptionLine1="The Peerio service will be shut down on July 15th, 2019."
                buttonText="Read More"
                buttonAction={() => Linking.openURL(url)}
            />
        );
    }
}

export {
    TopDrawerMaintenance,
    TopDrawerNewContact,
    TopDrawerBackupAccountKey,
    TopDrawerPendingFiles,
    TopDrawerAutoMount,
    TopDrawerPeerioClosure
};
