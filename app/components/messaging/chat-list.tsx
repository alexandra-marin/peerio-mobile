import React from 'react';
import { observer } from 'mobx-react/native';
import { View, Platform, FlatList } from 'react-native';
import { observable, reaction, action, computed, IReactionDisposer } from 'mobx';
import { chatInviteStore } from '../../lib/icebear';
import SafeComponent from '../shared/safe-component';
import ChatListItem from './chat-list-item';
import ChannelListItem from './channel-list-item';
import ProgressOverlay from '../shared/progress-overlay';
import chatState from './chat-state';
import ChatSectionHeader from './chat-section-header';
import ChannelInviteListItem from './channel-invite-list-item';
import PlusBorderIcon from '../layout/plus-border-icon';
import CreateActionSheet from './create-action-sheet';
import uiState from '../layout/ui-state';
import drawerState from '../shared/drawer-state';
import UnreadMessageIndicator from './unread-message-indicator';
import { vars } from '../../styles/styles';
import ChatZeroStatePlaceholder from './chat-zero-state-placeholder';
import FlatListWithDrawer from '../shared/flat-list-with-drawer';
import zeroStateBeacons from '../beacons/zerostate-beacons';
import { transitionAnimation } from '../helpers/animations';
import { Chat } from '../../lib/peerio-icebear/models';
import { LocalizationStrings } from '../utils/translator';

const INITIAL_LIST_SIZE = 10;

const viewabilityConfig = {
    itemVisiblePercentThreshold: 40
};

// unread item, pending dm or channel invite
// TODO: move to icebear
function isUnread(item) {
    return item.unreadCount || item.isInvite || item.kegDbId;
}

class SectionHeaderItem {
    sectionTitle: string;
    items = [];
    kegDbId: undefined;
}

// TODO: move to icebear
interface ReceivedInvite {
    kegDbId: string;
    sectionTitle: undefined;
}

type ChatListItemVariant = Chat | ReceivedInvite | SectionHeaderItem;

@observer
export default class ChatList extends SafeComponent {
    @observable reverseRoomSorting = false;
    @observable minItemIndex = null;
    @observable maxItemIndex = null;
    flatListHeight = 0;
    indicatorReaction: IReactionDisposer;
    scrollView: FlatList<Chat>;

    get rightIcon() {
        return (
            <PlusBorderIcon
                action={CreateActionSheet.show}
                beacon={zeroStateBeacons.startChatBeacon}
                testID="buttonCreateNewChat"
            />
        );
    }

    addSection = (sectionTitle: string, items): Array<ChatListItemVariant> => {
        if (!items || !items.length) return [];
        return [[{ sectionTitle }], items];
    };

    @computed
    get dataSource() {
        return [].concat(
            ...this.addSection('title_channels', this.firstSectionItems),
            ...this.addSection('title_directMessages', this.secondSectionItems)
        );
    }

    @computed
    get firstSectionItems() {
        const allChannels =
            chatState.store.allRooms.filter(c => !c.isChannel || c.headLoaded) || [];
        allChannels.sort((a, b) => {
            const first = (a.name || a.channelName || '').toLocaleLowerCase();
            const second = (b.name || b.channelName || '').toLocaleLowerCase();
            const result = first.localeCompare(second);
            return this.reverseRoomSorting ? !result : result;
        });
        return allChannels;
    }

    @computed
    get secondSectionItems() {
        return chatState.store.chats.filter(d => !d.isChannel).slice();
    }

    componentDidMount() {
        uiState.testAction1 = () => {
            this.reverseRoomSorting = !this.reverseRoomSorting;
        };

        uiState.testAction2 = () => {
            chatState.testFillWithMockChannels();
        };

        // android has buggy overlay if you trigger animation immediately
        if (Platform.OS !== 'android') {
            this.indicatorReaction = reaction(
                () => [this.topIndicatorVisible, this.bottomIndicatorVisible],
                transitionAnimation,
                { fireImmediately: true }
            );
        }
    }

    componentWillUnmount() {
        this.indicatorReaction && this.indicatorReaction();
        this.indicatorReaction = null;
        uiState.currentScrollView = null;
        uiState.testAction1 = null;
        uiState.testAction2 = null;
    }

    keyExtractor(item) {
        return item.kegDbId || item.id || item.sectionTitle;
    }

    inviteItem = chat => (
        <ChannelInviteListItem id={chat.kegDbId} chat={chat} channelName={chat.channelName} />
    );
    channelItem = (chat: Chat) => <ChannelListItem chat={chat} channelName={chat.name} />;
    dmItem = chat => <ChatListItem height={vars.listItemHeight} key={chat.id} chat={chat} />;
    renderListItem = (item: ChatListItemVariant) => {
        if (item instanceof Chat) {
            if (item.isChannel) return this.channelItem(item);
            return this.dmItem(item);
        } else if (item.kegDbId) {
            return this.inviteItem(item);
        } else if (item.sectionTitle) {
            return <ChatSectionHeader title={item.sectionTitle as keyof LocalizationStrings} />;
        }
    };

    item = item => {
        const chat = item.item;
        if (!chat.id && !chat.kegDbId && !chat.spaceId && !chat.sectionTitle) return null;

        return this.renderListItem(chat);
    };

    getItemOffset = index => {
        let offset = 0;
        const { firstSectionItems, secondSectionItems } = this;
        // first item is a section header
        const firstSectionLength = firstSectionItems.length ? firstSectionItems.length + 1 : 0;
        // first section
        if (firstSectionLength) {
            offset += Math.min(index, firstSectionLength) * vars.sectionHeaderHeight;
        }
        // first item is a section header
        const secondSectionLength = secondSectionItems.length ? secondSectionItems.length + 1 : 0;
        if (secondSectionLength) {
            if (index > firstSectionLength) {
                offset += vars.sectionHeaderHeight;
            }
            offset += Math.max(0, index - 1 - firstSectionLength) * vars.listItemHeight;
        }

        const length = index > firstSectionLength ? vars.listItemHeight : vars.sectionHeaderHeight;
        return { itemOffset: offset, length };
    };

    @action.bound
    scrollViewRef(sv) {
        this.scrollView = sv;
        uiState.currentScrollView = sv;
    }

    @computed
    get firstUnreadItem() {
        for (let index = 0; index < this.dataSource.length; ++index) {
            const item = this.dataSource[index];
            if (isUnread(item)) return { item, index };
        }
        return null;
    }

    @computed
    get lastUnreadItem() {
        for (let index = this.dataSource.length - 1; index >= 0; --index) {
            const item = this.dataSource[index];
            if (isUnread(item)) return { item, index };
        }
        return null;
    }

    @computed
    get topIndicatorVisible() {
        // if view hasn't been updated with viewable range
        if (this.minItemIndex === null) return false;
        const pos = this.firstUnreadItem;
        if (!pos) return false;
        return pos.index < this.minItemIndex;
    }

    @computed
    get bottomIndicatorVisible() {
        // if view hasn't been updated with viewable range
        if (this.maxItemIndex === null) return false;
        const pos = this.lastUnreadItem;
        if (!pos) return false;
        return pos.index > this.maxItemIndex;
    }

    /**
     * Scrolls to the topmost unread item in the list
     */
    @action.bound
    scrollUpToUnread() {
        const pos = this.firstUnreadItem;
        if (!pos) return;
        const { itemOffset } = this.getItemOffset(pos.index);
        const offset = itemOffset + (drawerState.getDrawer() ? vars.topDrawerHeight : 0);
        // console.log(`scroll up to ${pos.index}, ${itemOffset}, ${offset}`);
        this.scrollView.scrollToOffset({ offset });
    }

    /**
     * Scrolls to the bottommost unread item in the list
     */
    @action.bound
    scrollDownToUnread() {
        const pos = this.lastUnreadItem;
        if (!pos) return;
        const { itemOffset, length } = this.getItemOffset(pos.index);
        const offset =
            itemOffset -
            this.flatListHeight +
            length +
            (drawerState.getDrawer() ? vars.topDrawerHeight : 0);
        // console.log(`${this.flatListHeight} scroll down to ${pos.index}, ${itemOffset}, ${offset}`);
        this.scrollView.scrollToOffset({ offset });
    }

    /**
     * Whenever there is a scroll event which changes viewable items
     * This property handler gets called
     * @param {*} data
     */
    @action.bound
    onViewableItemsChanged(info) {
        const { viewableItems } = info;
        let minItemIndex = this.dataSource.length;
        let maxItemIndex = 0;
        viewableItems.forEach(i => {
            const itemIndex = i.index;
            minItemIndex = Math.min(minItemIndex, itemIndex);
            maxItemIndex = Math.max(maxItemIndex, itemIndex);
        });
        // console.log(`viewability changed: min: ${minItemIndex}, max: ${maxItemIndex}`);
        Object.assign(this, { minItemIndex, maxItemIndex });
    }

    @action.bound
    onLayout(e) {
        this.flatListHeight = e.nativeEvent.layout.height;
        // calculate initial viewable items because react native fails to do it sometimes
        this.minItemIndex = 0;
        let i = 0;
        while (i < this.dataSource.length) {
            const { itemOffset } = this.getItemOffset(i);
            if (itemOffset > this.flatListHeight) break;
            ++i;
        }
        this.maxItemIndex = Math.max(this.minItemIndex, i - 1);
    }

    get listView() {
        if (chatState.routerMain.currentIndex !== 0) return null;
        return (
            <FlatListWithDrawer
                onLayout={this.onLayout}
                setScrollViewRef={this.scrollViewRef}
                style={{ flexGrow: 1 }}
                initialNumToRender={INITIAL_LIST_SIZE}
                data={this.dataSource}
                renderItem={this.item}
                keyExtractor={this.keyExtractor}
                onViewableItemsChanged={this.onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
        );
    }

    renderThrow() {
        const body =
            (chatState.store.chats.length || chatInviteStore.received.length) &&
            chatState.store.loaded ? (
                this.listView
            ) : (
                <ChatZeroStatePlaceholder />
            );

        return (
            <View style={{ flexGrow: 1, flex: 1 }}>
                <View style={{ flexGrow: 1, flex: 1 }}>{body}</View>
                {this.topIndicatorVisible && (
                    <UnreadMessageIndicator isAlignedTop action={this.scrollUpToUnread} />
                )}
                {this.bottomIndicatorVisible && (
                    <UnreadMessageIndicator action={this.scrollDownToUnread} />
                )}
                <ProgressOverlay enabled={chatState.store.loading} />
            </View>
        );
    }
}
