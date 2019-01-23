import React from 'react';
import { View, ViewStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import LayoutModalExit from '../layout/layout-modal-exit';
import contactState from './contact-state';
import { contactStore, Contact } from '../../lib/icebear';
import AvatarCircle from '../shared/avatar-circle';
import { vars } from '../../styles/styles';
import { t } from '../utils/translator';
import icons from '../helpers/icons';

const flexRow: ViewStyle = {
    flexDirection: 'row',
    flex: 1,
    maxHeight: 140,
    alignItems: 'center'
};

interface ContactViewProps {
    contact: Contact;
    nonModal: boolean;
}

@observer
export default class ContactView extends SafeComponent<ContactViewProps> {
    get contact() {
        return this.props.contact || contactState.currentContact;
    }

    toggleFav() {
        const { contact } = this;
        contact.isAdded ? contactStore.removeContact(contact) : contactStore.addContact(contact);
    }

    startChat() {
        contactState.sendTo(this.contact);
    }

    renderInvitedUser(contact) {
        return (
            <View style={{ flex: 1, flexGrow: 1 }}>
                <View
                    style={[
                        flexRow,
                        {
                            backgroundColor: vars.darkBlueBackground05,
                            paddingRight: vars.spacing.small.maxi
                        }
                    ]}>
                    <View style={{ marginHorizontal: vars.spacing.medium.mini2x }}>
                        <AvatarCircle large invited contact={contact} />
                    </View>
                    <View style={{ flexGrow: 1, flexShrink: 1 }}>
                        <Text
                            bold
                            ellipsizeMode="tail"
                            numberOfLines={2}
                            style={{
                                color: vars.txtDark,
                                fontSize: vars.font.size16,
                                marginVertical: vars.spacing.small.mini2x
                            }}>
                            {contact.email}
                        </Text>
                    </View>
                </View>
                <View style={{ flex: 1, flexGrow: 1 }} />
            </View>
        );
    }

    renderContact(contact) {
        const {
            username,
            firstName,
            lastName,
            tofuError,
            fingerprintSkylarFormatted,
            isAdded,
            isDeleted
        } = contact;
        const tofuErrorControl = tofuError && (
            <View
                style={{
                    backgroundColor: vars.redWarning,
                    flexGrow: 1,
                    padding: vars.spacing.small.maxi
                }}>
                <Text style={{ color: vars.white }}>
                    This contact{"'"}s public key has changed, which means it may be compromised.
                </Text>
            </View>
        );
        const body = (
            <View style={{ flex: 1, flexGrow: 1 }}>
                <View
                    style={[
                        flexRow,
                        {
                            backgroundColor: vars.darkBlueBackground05,
                            paddingRight: vars.spacing.small.maxi
                        }
                    ]}>
                    <View style={{ marginHorizontal: vars.spacing.medium.mini2x }}>
                        <AvatarCircle large contact={contact} />
                    </View>
                    <View style={{ flexGrow: 1, flexShrink: 1 }}>
                        <Text
                            bold
                            ellipsizeMode="tail"
                            numberOfLines={2}
                            style={{
                                color: vars.txtDark,
                                fontSize: vars.font.size16,
                                marginVertical: vars.spacing.small.mini2x
                            }}>
                            {firstName} {lastName}
                        </Text>
                        <Text style={{ color: vars.txtDark }}>@{username}</Text>
                    </View>
                    {icons.dark('forum', () => this.startChat())}
                    {isAdded
                        ? icons.colored(
                              'star',
                              () => this.toggleFav(),
                              vars.yellow,
                              null,
                              false,
                              'favoriteButton'
                          )
                        : icons.dark(
                              'star-border',
                              () => this.toggleFav(),
                              null,
                              null,
                              'favoriteButton',
                              false
                          )}
                </View>
                <View style={{ margin: vars.spacing.medium.maxi2x }}>
                    {tofuErrorControl}
                    {isDeleted && (
                        <Text style={{ color: vars.txtAlert }}>{t('title_accountDeleted')}</Text>
                    )}
                    <Text style={{ color: vars.txtDate, marginVertical: vars.spacing.small.maxi }}>
                        {t('title_publicKey')}
                    </Text>
                    <Text
                        style={{
                            color: vars.txtMedium,
                            fontFamily: `Verdana`,
                            fontSize: vars.font.size16
                        }}
                        numberOfLines={2}>
                        {fingerprintSkylarFormatted}
                    </Text>
                </View>
                <View style={{ flex: 1, flexGrow: 1 }} />
            </View>
        );
        return this.props.nonModal ? (
            body
        ) : (
            <LayoutModalExit
                body={body}
                title={username}
                onClose={() => contactState.routerModal.discard()}
            />
        );
    }

    renderThrow() {
        const { contact } = this;
        if (contact.username) {
            return this.renderContact(contact);
        }
        return this.renderInvitedUser(contact); // invited user
    }
}
