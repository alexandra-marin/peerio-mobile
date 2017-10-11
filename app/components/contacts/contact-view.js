import PropTypes from 'prop-types';
import React from 'react';
import { Text, View } from 'react-native';
import { observer } from 'mobx-react/native';
import SafeComponent from '../shared/safe-component';
import LayoutModalExit from '../layout/layout-modal-exit';
import contactState from '../contacts/contact-state';
import { contactStore } from '../../lib/icebear';
import AvatarCircle from '../shared/avatar-circle';
import { vars } from '../../styles/styles';
import { t } from '../utils/translator';
import icons from '../helpers/icons';

const flexRow = {
    flexDirection: 'row',
    flex: 1,
    maxHeight: 140,
    alignItems: 'center'
};

@observer
export default class ContactView extends SafeComponent {
    get contact() { return this.props.contact || contactState.currentContact; }

    toggleFav() {
        const { contact } = this;
        contact.isAdded ? contactStore.removeContact(contact) : contactStore.addContact(contact);
    }

    startChat() {
        contactState.sendTo(this.contact);
    }

    renderThrow() {
        const { contact } = this;
        const { username, firstName, lastName, tofuError, fingerprintSkylarFormatted, isAdded, isDeleted } = contact;
        const tofuErrorControl = tofuError && (
            <View style={{ backgroundColor: '#D0021B', flexGrow: 1, padding: vars.spacing.big }}>
                <Text style={{ color: vars.white }}>
                    This contact{'\''}s public key has changed, which means it may be compromised.
                </Text>
            </View>
        );
        const body = (
            <View style={{ flex: 1, flexGrow: 1 }}>
                <View style={[flexRow, { backgroundColor: vars.lightGrayBg, paddingRight: vars.spacing.big }]}>
                    <AvatarCircle large contact={contact} />
                    <View style={{ flexGrow: 1, flexShrink: 1 }}>
                        <Text
                            ellipsizeMode="tail"
                            numberOfLines={2}
                            style={{
                                fontWeight: 'bold',
                                color: vars.txtDark,
                                fontSize: vars.font.size.bigger,
                                marginVertical: vars.spacing.small
                            }}>{firstName} {lastName}</Text>
                        <Text style={{ color: vars.txtDark }}>@{username}</Text>
                    </View>
                    {icons.dark('forum', () => this.startChat())}
                    {icons.dark(isAdded ? 'star' : 'star-border', () => this.toggleFav())}
                </View>
                <View style={{ margin: 24 }}>
                    {tofuErrorControl}
                    {isDeleted && <Text style={{ color: vars.txtAlert }}>{t('title_accountDeleted')}</Text>}
                    <Text style={{ color: vars.txtDate, marginVertical: vars.spacing.big }}>{t('title_publicKey')}</Text>
                    <Text style={{ color: vars.txtMedium, fontFamily: `Verdana`, fontSize: vars.font.size.bigger }} numberOfLines={2}>
                        {fingerprintSkylarFormatted}
                    </Text>
                </View>
                <View style={{ flex: 1, flexGrow: 1 }} />
            </View>
        );
        return this.props.nonModal ? body :
        <LayoutModalExit body={body} title={username} onClose={() => contactState.routerModal.discard()} />;
    }
}

ContactView.propTypes = {
    contact: PropTypes.any,
    nonModal: PropTypes.any
};
