import React from 'react';
import { observable, computed } from 'mobx';
import Router from './router';
import ComposeMessage from '../messaging/compose-message';
import CreateChannel from '../channels/create-channel';
import ChannelAddPeople from '../messaging/channel-add-people';
import FileShare from '../files/file-share';
import FolderShare from '../files/folder-share';
import FileMove from '../files/file-move';
import FileChooseRecipient from '../files/file-choose-recipient';
import ContactView from '../contacts/contact-view';
import ChatInfo from '../messaging/chat-info';
import ChannelInfo from '../messaging/channel-info';
import popupState from '../layout/popup-state';
import routes from './routes';
import { vars } from '../../styles/styles';
import { uiState } from '../states';
import SignupContactInvite from '../contacts/contact-sync-invite';
import MessageInfo from '../messaging/message-info';
import NoticeOfClosure from '../layout/notice-of-closure';

class RouterModal extends Router {
    @observable animating = false;
    modalProps = null;
    resolver = null;

    constructor() {
        super();
        routes.modal = this;
        this.add('compose', ComposeMessage);
        this.add('createChannel', CreateChannel);
        this.add('channelAddPeople', ChannelAddPeople);
        this.add('shareFileTo', FileShare);
        this.add('shareFolderTo', FolderShare);
        this.add('changeRecipient', FileChooseRecipient);
        this.add('moveFileTo', FileMove);
        this.add('contactView', ContactView);
        this.add('chatInfo', ChatInfo);
        this.add('channelInfo', ChannelInfo);
        this.add('contactSync', SignupContactInvite);
        this.add('messageInfo', MessageInfo);
        this.add('noticeOfClosure', NoticeOfClosure);
    }

    add(route, component, isWhite) {
        const r = super.add(route, component);
        r.isWhite = isWhite;
        this[route] = async props => {
            await uiState.hideAll();
            popupState.discardAllPopups();
            this.flushResolver();
            this.modalProps = props;
            r.transition();
            return new Promise(resolve => {
                this.resolver = resolve;
            });
        };
    }

    flushResolver(value) {
        if (this.resolver) {
            console.log('router-modal.js: auto-resolving unclosed resolver');
            const { resolver } = this;
            // wait for modal to close
            setTimeout(() => resolver(value), vars.animationDuration);
            this.resolver = null;
        }
    }

    async discard(value) {
        await uiState.hideAll();
        this.flushResolver(value);
        this.route = null;
        this.modalProps = null;
    }

    get isBlackStatusBar() {
        return !this.animating && this.current && !this.current.isWhite;
    }

    @computed
    get modal() {
        return this.current ? React.createElement(this.current.component, this.modalProps) : null;
    }
}

export default new RouterModal();
