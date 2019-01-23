import React from 'react';
import { observer } from 'mobx-react/native';
import { View, TouchableOpacity, Share, Platform, ViewStyle } from 'react-native';
import { observable, reaction, action } from 'mobx';
import ProgressOverlay from '../shared/progress-overlay';
import SafeComponent from '../shared/safe-component';
import SimpleTextBox from '../shared/simple-text-box';
import { vars } from '../../styles/styles';
import { contactStore, warnings, User, config } from '../../lib/icebear';
import { tx, tu, t } from '../utils/translator';
import uiState from '../layout/ui-state';
import contactState from './contact-state';
import testLabel from '../helpers/test-label';
import Text from '../controls/custom-text';
import routes from '../routes/routes';
import icons from '../helpers/icons';
import BackIcon from '../layout/back-icon';
import whiteLabelComponents from '../whitelabel/white-label-components';
import ViewWithDrawer from '../shared/view-with-drawer';
import { transitionAnimation } from '../helpers/animations';
import fonts from '../../styles/fonts';
import BlueButtonText from '../buttons/blue-text-button';

const textinputContainer: ViewStyle = {
    backgroundColor: vars.white,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingLeft: vars.spacing.medium.mini,
    paddingRight: vars.spacing.medium.maxi
};

const textStyle = {
    fontSize: vars.font.size12,
    color: vars.textBlack54
};

const buttonRow: ViewStyle = {
    paddingRight: vars.spacing.medium.maxi,
    marginBottom: vars.spacing.small.midi2x,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden'
};

const textinput = {
    fontSize: vars.font.size14,
    height: vars.inputHeight,
    color: vars.txtDark,
    flex: 1,
    flexGrow: 1,
    fontFamily: fonts.peerioFontFamily
};

const textStatic = {
    fontSize: vars.font.size14,
    color: vars.txtDark,
    marginLeft: vars.inputPaddingLeft,
    flex: 1,
    flexGrow: 1,
    alignSelf: 'center'
};

const label = {
    color: vars.txtDate,
    marginVertical: vars.spacing.small.mini2x,
    paddingLeft: vars.spacing.medium.midi
};

const labelDark = [label, { color: vars.txtDark }];

@observer
export default class ContactAdd extends SafeComponent {
    emailAction(): any {
        throw new Error('Method not implemented.');
    }
    @observable waiting = false;
    @observable notFound = false;
    @observable toInvite = null;
    @observable showValidationError = false;
    @observable query = '';
    _scrollView: any;
    showAddEmail: any;
    newEmailText: any;
    newEmailTextValid: any;

    componentDidMount() {
        uiState.currentScrollView = this._scrollView;
        reaction(
            () => this.query,
            () => {
                transitionAnimation();
                this.toInvite = null;
                if (this.showValidationError) this.showValidationError = false;
            }
        );
    }

    componentWillUnmount() {
        uiState.currentScrollView = null;
        uiState.currentScrollViewPosition = 0;
    }

    onScroll = ({
        nativeEvent: {
            contentOffset: { y }
        }
    }) => {
        uiState.currentScrollViewPosition = y;
    };

    get leftIcon() {
        return <BackIcon action={routes.main.contacts} />;
    }

    inviteContactDuck(toInvite) {
        if (!toInvite) return null;
        const email = toInvite;
        const fullName = toInvite;
        const username = '';
        const invited = false;
        return observable({ fullName, username, invited, email });
    }

    async tryAdding() {
        this.query = this.query.toLocaleLowerCase().trim();
        if (!this.query) return;
        if (this.waiting) return;
        uiState.hideKeyboard();
        this.waiting = true;
        this.toInvite = null;
        this.notFound = false;
        const contact = await contactStore.whitelabel.getContact(this.query, 'addcontact');
        const { fullNameAndUsername: name } = contact;
        if (contact.notFound || contact.isHidden) {
            this.notFound = true;
            const atInd = this.query.indexOf('@');
            const isEmail = atInd > -1 && atInd === this.query.lastIndexOf('@');
            if (isEmail) {
                transitionAnimation();
                this.toInvite = this.inviteContactDuck(this.query);
            }
        } else {
            contactStore.getContactAndSave(this.query);
            this.query = '';
            warnings.add(t('title_contactAdded', { name }) as string);
        }
        this.waiting = false;
    }

    share() {
        const urls = config.translator.urlMap;
        const message = tx('title_socialShareInviteContent', {
            socialShareUrl: urls.socialShareUrl,
            username: User.current.username
        });
        const title = tx('title_socialShareInvite');
        console.log(title, message);
        Share.share({ message, title });
    }

    get emailButton() {
        let text = 'button_addEmail';
        if (this.showAddEmail) {
            text = this.newEmailText ? 'button_save' : 'button_cancel';
        }
        return this.renderButton1(
            text,
            () => this.emailAction(),
            this.newEmailText && this.showAddEmail && !this.newEmailTextValid
        );
    }

    get validationError() {
        if (!this.showValidationError) return null;
        return (
            <Text numberOfLines={1} ellipsizeMode="tail" style={[label, { color: vars.txtAlert }]}>
                {tx('error_invalidEmailOrUsername')}
            </Text>
        );
    }

    renderButton1(text, onPress?, disabled?) {
        return (
            <TouchableOpacity
                {...testLabel(text)}
                onPress={disabled ? null : onPress}
                pressRetentionOffset={vars.retentionOffset}
                style={{
                    paddingRight: vars.spacing.small.maxi2x,
                    paddingVertical: vars.spacing.small.maxi
                }}>
                <Text bold style={{ color: disabled ? vars.txtMedium : vars.peerioBlue }}>
                    {tu(text)}
                </Text>
            </TouchableOpacity>
        );
    }

    renderText(text, style) {
        return (
            <View style={{ flexDirection: 'row', flex: 1, flexGrow: 1 }}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={[textStatic, style]}>
                    {text}
                </Text>
            </View>
        );
    }

    inviteAction = () => {
        const mockContact = this.toInvite || {};
        const { email } = mockContact;

        mockContact.invited = true;
        contactStore.invite(email);
        this.query = '';
    };

    get inviteBlock() {
        const mockContact = this.toInvite || {};
        const { email, invited } = mockContact;
        if (!email) return null;
        const inviteBlockStyle: ViewStyle = {
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            overflow: 'hidden',
            height: email ? vars.contactInviteSuggestionHeight : 0,
            backgroundColor: vars.contactInviteSuggestionBg,
            borderTopColor: vars.confirmColor,
            borderTopWidth: 2,
            marginBottom: vars.spacing.small.midi2x,
            paddingRight: vars.spacing.medium.maxi,
            paddingLeft: vars.spacing.medium.midi
        };
        return (
            <View style={inviteBlockStyle}>
                {icons.plaindark('email', vars.iconSize)}
                <View style={{ flex: 1, marginLeft: vars.spacing.medium.mini2x }}>
                    <Text style={textStyle}>{tx('title_couldntLocateContact1')}</Text>
                    <Text style={textStyle}>{tx('title_couldntLocateContact2')}</Text>
                </View>
                <BlueButtonText
                    text="button_invite"
                    disabled={invited}
                    accessibilityId="button_invite"
                    onPress={this.inviteAction}
                />
            </View>
        );
    }

    @action.bound
    onChangeFindUserText(text) {
        const { Version, OS } = Platform;
        if (OS !== 'android' || Version > 22) {
            this.query = text.toLowerCase();
        } else {
            this.query = text;
        }
    }

    renderThrow() {
        return (
            <View style={{ flex: 1, backgroundColor: vars.darkBlueBackground05 }}>
                <ViewWithDrawer
                    onScroll={this.onScroll}
                    keyboardShouldPersistTaps="handled"
                    style={{ backgroundColor: vars.darkBlueBackground05 }}
                    setScrollViewRef={ref => {
                        this._scrollView = ref;
                    }}>
                    <View style={{ marginTop: vars.spacing.medium.midi2x }}>
                        {contactState.empty && (
                            <View style={{ margin: vars.spacing.small.midi2x }}>
                                <Text style={labelDark}>{tx('title_contactZeroState')}</Text>
                            </View>
                        )}
                        <View style={{ marginRight: vars.spacing.small.midi2x }}>
                            <whiteLabelComponents.ContactAddWarning />
                        </View>
                        <View style={{ marginVertical: vars.spacing.small.midi2x }}>
                            <Text style={label}>{tx('button_addAContact')}</Text>
                            <View style={textinputContainer}>
                                <SimpleTextBox
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    onChangeText={this.onChangeFindUserText}
                                    placeholder={tx('title_userSearch')}
                                    style={textinput}
                                    value={this.query}
                                    {...testLabel('contactSearchInput')}
                                />
                                {this.toInvite || this.showValidationError
                                    ? icons.dark('close', () => {
                                          this.query = null;
                                      })
                                    : this.renderButton1(
                                          'button_add',
                                          () => this.tryAdding(),
                                          !this.query
                                      )}
                            </View>
                            {this.inviteBlock}
                            {this.validationError}
                        </View>
                        <View style={{ marginVertical: vars.spacing.small.midi2x }}>
                            <View style={buttonRow}>
                                <Text semibold style={labelDark}>
                                    {tx('title_findContacts')}
                                </Text>
                                {this.renderButton1('title_importContacts', () =>
                                    contactState.inviteContacts()
                                )}
                            </View>
                        </View>
                        <View style={{ marginVertical: vars.spacing.small.midi2x }}>
                            <View style={buttonRow}>
                                <Text semibold style={labelDark}>
                                    {tx('title_shareSocial')}
                                </Text>
                                {this.renderButton1('button_share', () => this.share())}
                            </View>
                        </View>
                    </View>
                </ViewWithDrawer>
                <ProgressOverlay enabled={this.waiting} />
            </View>
        );
    }
}
