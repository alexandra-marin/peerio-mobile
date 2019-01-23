import React from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { observable, action, reaction, computed } from 'mobx';
import { observer } from 'mobx-react/native';
import SafeComponent from '../shared/safe-component';
import { t, tu, LocalizationStrings } from '../utils/translator';
import Layout3 from '../layout/layout3';
import Bottom from '../controls/bottom';
import SnackBar from '../snackbars/snackbar';
import ContactInviteItemPrompt from './contact-invite-item-prompt';
import icons from '../helpers/icons';
import { vars } from '../../styles/styles';
import contactState from './contact-state';
import ContactInviteItem from './contact-invite-item';
import ContactCollection from './contact-collection';
import ContactSelectorUserBoxLine from './contact-selector-userbox-line';
import ContactSelectorSectionList from './contact-selector-sectionlist';
import Text from '../controls/custom-text';
import SearchBar from '../controls/search-bar';
import ModalHeader from '../shared/modal-header';
import { transitionAnimation } from '../helpers/animations';

interface ContactSelectorUniversalProps {
    title?: string;
    subTitleComponent?: JSX.Element;
    leftIconComponent?: JSX.Element;
    inputPlaceholder?: string | LocalizationStrings;
    action: Function;
    onExit?: Function;
    multiselect?: boolean;
    footer?: JSX.Element;
    hideHeader?: boolean;
}

@observer
export default class ContactSelectorUniversal extends SafeComponent<ContactSelectorUniversalProps> {
    @observable recipients = new ContactCollection();
    @observable inProgress = false;
    @observable clean = true;
    @observable toInvite = null;
    @observable legacyContact = null;
    @observable notFound = null;
    @observable findUserText = '';
    @observable foundContact = null;
    _recipientReaction: Function;
    textInput: SearchBar;
    _searchTimeout: NodeJS.Timeout;

    componentDidMount() {
        this._recipientReaction = reaction(
            () => !!this.recipients.items.length,
            transitionAnimation
        );
    }

    componentWillUnmount() {
        this._recipientReaction();
    }

    get inviteContact() {
        if (!this.toInvite) return null;
        const result = ContactInviteItem.fromEmail(this.toInvite);
        result.invited = !!contactState.store.invitedContacts.find(i => i.email === result.email);
        return result && <ContactInviteItemPrompt email={this.toInvite} />;
    }

    @action.bound
    onChangeFindUserText(text) {
        this.clean = !text.length;
        this.foundContact = null;
        this.toInvite = null;
        this.legacyContact = null;
        this.notFound = null;
        this.inProgress = false;
        const items = text.split(/[ ,;]/);
        if (items.length > 1) {
            this.findUserText = items[0].trim();
            return;
        }
        const { Version, OS } = Platform;
        if (OS !== 'android' || Version > 22) {
            this.findUserText = text.toLowerCase();
        } else {
            this.findUserText = text;
        }
        this.searchUserTimeout(text);
    }

    searchBar() {
        let rightIcon = null;
        if (this.findUserText) {
            rightIcon = icons.coloredSmall(
                'close',
                () => {
                    this.findUserText = '';
                    this.onChangeFindUserText('');
                },
                vars.peerioBlue
            );
        }

        if (this.inProgress || contactState.isInProgress) {
            rightIcon = <ActivityIndicator style={{ marginRight: vars.spacing.small.midi2x }} />;
        }

        const leftIcon =
            this.props.leftIconComponent || icons.plain('search', vars.iconSize, vars.black12);

        return (
            <SearchBar
                textValue={this.findUserText}
                placeholderText={this.props.inputPlaceholder}
                onChangeText={this.onChangeFindUserText}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                ref={ti => {
                    this.textInput = ti;
                }}
                testId="textInputContactSearch"
            />
        );
    }

    exitRow() {
        const { title, onExit } = this.props;
        const leftIcon = icons.dark('close', onExit, null, null, 'closeButton');
        const rightIcon = this.props.multiselect ? this.shareButton : null;
        const fontSize = vars.font.size18;
        return <ModalHeader {...{ leftIcon, rightIcon, title, fontSize }} />;
    }

    get shareButton() {
        if (this.recipients.items.length) return icons.text(tu('button_share'), this.action);
        return icons.disabledText(tu('button_share'));
    }

    @action.bound
    async action() {
        const selectorAction = this.props.action;
        if (!selectorAction) return;
        this.inProgress = true;
        await selectorAction(this.recipients.items);
        this.inProgress = false;
        this.props.onExit && this.props.onExit();
    }

    searchUserTimeout(username) {
        if (this._searchTimeout) {
            clearTimeout(this._searchTimeout);
            this._searchTimeout = null;
        }
        if (!username) return;
        this.inProgress = true;
        this._searchTimeout = setTimeout(() => this.searchUser(username), 500);
    }

    async searchUser(username) {
        this.inProgress = false;
        const u = username.trim();
        if (!u) return;
        if (!this.findUserText) return;
        this.inProgress = true;
        const c = await contactState.store.whitelabel.getContact(u, null);
        this.inProgress = false;
        if (!this.findUserText) return;
        if (c.notFound || c.isHidden) {
            if (username.indexOf('@') !== -1) {
                this.toInvite = username;
            } else {
                this.notFound = username;
            }
        } else {
            this.foundContact = c;
        }
    }

    @computed
    get dataSource() {
        const filteredContacts = contactState.getFiltered(this.findUserText).slice();
        const result = [{ data: filteredContacts, key: 'title_contactsNumber' }];
        if (this.foundContact) {
            result.unshift({ data: [this.foundContact], key: null });
        }
        if (!this.findUserText) {
            result.push({
                data: contactState.store.invitedNotJoinedContacts.slice(),
                key: 'title_allYourInvited'
            });
        }
        return result;
    }

    @action.bound
    onContactPress(contact) {
        if (this.props.multiselect) {
            this.findUserText = '';
            this.recipients.toggle(contact);
        } else {
            this.props.onExit();
            this.props.action([contact]);
        }
    }

    body() {
        const notFound = !this.inProgress &&
            !!this.notFound && (
                <View
                    style={{
                        flexDirection: 'row',
                        marginHorizontal: vars.spacing.large.midi2x,
                        marginVertical: vars.spacing.small.maxi
                    }}>
                    <Icon
                        name="help-outline"
                        size={24}
                        color={vars.txtDate}
                        style={{ marginRight: vars.spacing.small.midi2x }}
                    />
                    <Text style={{ color: vars.txtDate }}>
                        {t('error_userNotFoundTryEmail', { user: this.notFound })}
                    </Text>
                </View>
            );
        const containerStyle = {
            marginHorizontal: vars.spacing.small.midi2x,
            flex: 1,
            flexGrow: 1
        };
        return (
            // flex is needed here, because we contain a SectionList
            // it calculates its height correctly only from flex parents
            <View style={{ flex: 1, flexGrow: 1 }}>
                <View style={{ flex: 0 }}>
                    {this.searchBar()}
                    {this.props.multiselect && (
                        <ContactSelectorUserBoxLine
                            contacts={this.recipients.items}
                            onPress={this.recipients.remove}
                        />
                    )}
                </View>
                <View style={containerStyle}>
                    {notFound}
                    {this.inviteContact}
                    <ContactSelectorSectionList
                        dataSource={this.dataSource}
                        onPress={this.onContactPress}
                    />
                </View>
            </View>
        );
    }

    header() {
        return (
            <View>
                {this.exitRow()}
                {this.props.subTitleComponent ? (
                    <View style={{ marginBottom: vars.spacing.medium.mini2x }}>
                        {this.props.subTitleComponent}
                    </View>
                ) : null}
            </View>
        );
    }

    renderThrow() {
        const header = !this.props.hideHeader ? this.header() : null;
        const body = this.body();
        const layoutStyle = {
            backgroundColor: vars.darkBlueBackground05
        };
        const snackbar = (
            <Bottom>
                <SnackBar />
            </Bottom>
        );
        return (
            <Layout3
                defaultBar
                body={body}
                header={header}
                noFitHeight
                footer={this.props.footer}
                footerAbsolute={snackbar}
                style={layoutStyle}
            />
        );
    }
}
