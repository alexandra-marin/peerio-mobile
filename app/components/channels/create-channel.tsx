import React, { Component } from 'react';
import { View, ScrollView, Dimensions, Keyboard } from 'react-native';
import { observer } from 'mobx-react/native';
import { observable, reaction, action } from 'mobx';
import ContactSelectorUniversal from '../contacts/contact-selector-universal';
import { tu, tx } from '../utils/translator';
import { vars } from '../../styles/styles';
import icons from '../helpers/icons';
import CreateChannelTextBox from './create-channel-textbox';
import chatState from '../messaging/chat-state';
import { config, socket } from '../../lib/icebear';
import SnackBarConnection from '../snackbars/snackbar-connection';
import Text from '../controls/custom-text';
import ModalHeader from '../shared/modal-header';
import { transitionAnimation } from '../helpers/animations';

const fillView: object = { flex: 1, flexGrow: 1, backgroundColor: vars.darkBlueBackground05 };

const { width } = Dimensions.get('window');

const card = {
    width,
    backgroundColor: vars.darkBlueBackground05,
    flexGrow: 1
};

const titleStyle = {
    color: vars.peerioBlue,
    fontSize: vars.font.size16,
    marginLeft: vars.spacing.small.maxi
};

@observer
export default class CreateChannel extends Component {
    @observable channelName = '';
    @observable step = 0;
    @observable inProgress = false;
    _disableScrollUpdate: boolean;
    _scrollView: ScrollView;
    _contactSelector: ContactSelectorUniversal;

    componentDidMount() {
        reaction(
            () => this.step,
            () => {
                this._disableScrollUpdate = true;
                setTimeout(() => this._scrollView.scrollToEnd(), 0);
            }
        );
        reaction(() => this.step, transitionAnimation);
    }

    refContactSelector = ref => {
        this._contactSelector = ref;
    };

    next() {
        Keyboard.dismiss();
        if (this.step === 0) {
            this.step = 1;
        } else {
            if (this.inProgress) return;
            this._contactSelector.action();
        }
    }

    @action.bound
    async createChannel(contacts) {
        this.inProgress = true;
        await chatState.startChat(contacts, true, this.channelName);
        chatState.routerModal.discard();
    }

    get isValid() {
        return (
            this.channelName.trim().length > 0 &&
            this.channelName.trim().length <= config.chat.maxChatNameLength &&
            socket.authenticated &&
            !this.inProgress
        );
    }

    nextIcon() {
        if (this.step === 1) {
            return icons.text(
                tu('button_go'),
                () => this.next(),
                { color: vars.peerioBlue },
                'buttonGo'
            );
        }
        return icons.text(
            tu('button_next'),
            () => this.next(),
            { color: vars.peerioBlue },
            'buttonNext'
        );
    }

    nextIconDisabled() {
        if (this.step === 1) return icons.disabledText(tu('button_go'));
        return icons.disabledText(tu('button_next'));
    }

    exitRow(testID?: string) {
        const leftIcon = icons.dark('close', () => chatState.routerModal.discard());
        const rightIcon = this.isValid ? this.nextIcon() : this.nextIconDisabled();
        const title = 'button_createChannel';
        return <ModalHeader {...{ leftIcon, rightIcon, title, testID }} />;
    }

    get firstPage() {
        return (
            <View style={card}>
                {this.exitRow()}
                <CreateChannelTextBox
                    labelText="title_channelName"
                    placeholderText="title_channelNamePlaceholder"
                    property="channelName"
                    state={this}
                    bottomText="title_channelNameLimit"
                    maxLength={config.chat.maxChatNameLength}
                />
            </View>
        );
    }

    get secondPage() {
        return this.step === 1 ? (
            <View style={card}>
                {this.exitRow('chooseContacts')}
                <ContactSelectorUniversal
                    multiselect
                    hideHeader
                    action={this.createChannel}
                    ref={this.refContactSelector}
                    leftIconComponent={<Text style={titleStyle}>{tx('title_with')}</Text>}
                    inputPlaceholder="title_roomParticipants"
                />
            </View>
        ) : (
            <View style={card} />
        );
    }

    get scrollView() {
        return (
            <ScrollView
                keyboardShouldPersistTaps="handled"
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                ref={sv => {
                    this._scrollView = sv;
                }}
                key="scroll"
                horizontal
                pagingEnabled
                removeClippedSubviews={false}>
                {this.firstPage}
                {this.secondPage}
            </ScrollView>
        );
    }

    render() {
        return (
            <View style={fillView}>
                {this.scrollView}
                <SnackBarConnection />
            </View>
        );
    }
}
