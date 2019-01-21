import React, { Component } from 'react';
import { View, StatusBar } from 'react-native';
import { observable, reaction } from 'mobx';
import { observer } from 'mobx-react/native';
import HeaderMain from '../layout/header-main';
import Chat from '../messaging/chat';
import ChannelInfo from '../messaging/channel-info';
import PopupLayout from '../layout/popup-layout';
import ChannelAddPeople from '../messaging/channel-add-people';
import InputMainContainer from '../layout/input-main-container';
import { clientApp, TinyDb } from '../../lib/icebear';
import fileState from '../files/file-state';
import chatState from '../messaging/chat-state';
import mockStoresCreate from './mock-stores-create';
import routerMain from '../routes/router-main';
import routerModal from '../routes/router-modal';
import CustomOverlay from '../layout/custom-overlay';
import Bottom from '../controls/bottom';

@observer
export default class MockChannelView extends Component {
    @observable showChannelInfo = false;
    @observable showAddPeople = false;
    @observable originalData = null;
    @observable imagePath = null;

    async componentWillMount() {
        clientApp.uiUserPrefs.externalContentConsented = true;
        clientApp.uiUserPrefs.externalContentEnabled = true;
        mockStoresCreate();
        chatState.addAck = () => {
            chatState.store.activeChat.addInlineImageMessage();
        };
        chatState.addMessage = message => {
            chatState.store.activeChat.addRandomMessage(message);
        };
        fileState.uploadInline = async path => {
            console.log(path);
            chatState.store.activeChat.addInlineImageMessageFromFile(path);
        };
        routerMain.current = observable({
            routeState: observable({
                title: '# channel-mock',
                titleAction: () => {
                    this.showChannelInfo = true;
                }
            })
        });
        const discard = routerModal.discard.bind(routerModal);
        routerModal.discard = () => {
            this.showChannelInfo = false;
            this.showAddPeople = false;
            if (routerModal.route === 'channelAddPeople') {
                this.showChannelInfo = true;
            }
            discard();
        };

        reaction(
            () => routerModal.route,
            route => {
                if (route === 'channelAddPeople') {
                    this.showChannelInfo = false;
                    this.showAddPeople = true;
                }
            }
        );

        this.imagePath = await TinyDb.system.getValue('mock-thumbnail');
        fileState.localFileMap.set(1, this.imagePath);
        fileState.localFileMap.set(2, this.imagePath);
    }

    componentDidMount() {
        setInterval(() => {
            this.progress += 10;
            if (this.progress > this.progressMax) {
                this.progress = 0;
            }
        }, 1000);
    }

    get channelList() {
        return (
            <View style={{ backgroundColor: 'white', flex: 1, flexGrow: 1 }}>
                <HeaderMain />
                <Chat />
                <StatusBar barStyle="light-content" />
                <Bottom>
                    <CustomOverlay />
                </Bottom>
            </View>
        );
    }

    get channelInfo() {
        return (
            <View style={{ backgroundColor: 'white', flex: 1, flexGrow: 1 }}>
                <ChannelInfo />
                <StatusBar barStyle="default" />
            </View>
        );
    }

    get addPeople() {
        return (
            <View style={{ backgroundColor: 'white', flex: 1, flexGrow: 1 }}>
                <ChannelAddPeople />
                <StatusBar barStyle="default" />
            </View>
        );
    }

    get body() {
        if (this.showChannelInfo) return this.channelInfo;
        if (this.showAddPeople) return this.addPeople;
        return this.channelList;
    }

    render() {
        return (
            <View style={{ flex: 1, flexGrow: 1 }}>
                {this.body}
                <InputMainContainer canSend />
                <PopupLayout key="popups" />
            </View>
        );
    }
}
