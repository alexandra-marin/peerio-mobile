import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import { FlatList, View, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { observable, action, when, reaction, computed } from 'mobx';
import SafeComponent from '../shared/safe-component';
import ProgressOverlay from '../shared/progress-overlay';
import ChatItem from './chat-item';
import AvatarCircle from '../shared/avatar-circle';
import ChatUnreadMessageIndicator from './chat-unread-message-indicator';
import FileActionSheet from '../files/file-action-sheet';
import contactState from '../contacts/contact-state';
import { vars } from '../../styles/styles';
import chatState from '../messaging/chat-state';
import uiState from '../layout/ui-state';
import VideoIcon from '../layout/video-icon';
import IdentityVerificationNotice from './identity-verification-notice';
import DmContactInvite from './dm-contact-invite';
import { clientApp } from '../../lib/icebear';
import ChatBeginningNotice from './chat-beginning-notice';
import BackIcon from '../layout/back-icon';
import routes from '../routes/routes';

const { width } = Dimensions.get('window');

@observer
export default class Chat extends SafeComponent {
    @observable contentHeight = 0;
    @observable scrollViewHeight = 0;
    @observable refreshing = false;
    @observable waitForScrollToEnd = true;
    @observable limboMessages = null;
    currentOffset = 0;
    indicatorHeight = 16;

    componentDidMount() {
        uiState.testAction2 = () => {
            const offset = Math.min(
                this.contentHeight - this.scrollViewHeight,
                this.currentOffset + this.scrollViewHeight / 2
            );
            this.scrollView.scrollToOffset({ offset, animated: false });
            this.currentOffset = offset;
        };

        this.selfMessageReaction = reaction(
            () => chatState.selfNewMessageCounter,
            () => {
                this.isAtBottom = true;
            }
        );
        this.chatReaction = reaction(() => chatState.store.activeChat, this.resetScrolling);
    }

    resetScrolling = () => {
        this.waitForScrollToEnd = true;
        this.contentHeight = 0;
        uiState.customOverlayComponent = null;
        this.isAtBottom = true;
        this.currentOffset = 0;
    };

    componentWillUnmount() {
        if (this.unreadMessageIndicatorTimeout) {
            clearTimeout(this.unreadMessageIndicatorTimeout);
            this.unreadMessageIndicatorTimeout = null;
        }
        uiState.customOverlayComponent = null;
        this.selfMessageReaction();
        this.chatReaction();
    }

    get leftIcon() {
        return <BackIcon action={routes.main.chats} testID="buttonBackIcon" />;
    }

    get rightIcon() {
        // show video icon then call function: returned link is then passed on to the message-printing function
        return <VideoIcon onAddVideoLink={link => chatState.addVideoMessage(link)} />;
    }

    @computed
    get data() {
        return this.chat ? this.chat.messages.reverse() : null;
    }

    get chat() {
        return chatState.currentChat;
    }

    get showInput() {
        return !!chatState.currentChat && !chatState.loading && !this.chat.isInvite;
    }

    _refs = {};
    _itemActionMap = {};

    keyExtractor = (item, index) => {
        return item.id || index;
    };

    // TODO add folder action sheet
    renderItem = ({ item, index }) => {
        const key = item.id || index;
        return (
            <ChatItem
                key={key}
                message={item}
                chat={this.chat}
                backgroundColor={this.background}
                onInlineImageAction={image => FileActionSheet.show(image)}
                onLegacyFileAction={file => FileActionSheet.show(file)}
                onFileAction={file => FileActionSheet.show(file, true)}
            />
        );
    };

    layoutScrollView = event => {
        this.scrollViewHeight = event.nativeEvent.layout.height;
        this.contentSizeChanged();
    };

    contentSizeChanged = async (contentWidth, contentHeight) => {
        // console.log(`chat.js: content size changed ${contentWidth}, ${contentHeight}`);
        if (!this.scrollView || !this.chat) return;

        // set current content heigth
        if (contentHeight) this.contentHeight = contentHeight;

        // waiting for page loads or other updates
        if (this.refreshing) {
            console.debug(`refreshing: ${this.refreshing}`);
            return;
        }

        // throttle calls
        if (this._contentSizeChanged) clearTimeout(this._contentSizeChanged);
        this._contentSizeChanged = setTimeout(() => {
            if (this.scrollView && this.contentHeight && this.scrollViewHeight) {
                console.debug(`in timeout refreshing: ${this.refreshing}`);
                if (!this.refreshing) {
                    if (this.isAtBottom) {
                        if (
                            this.contentHeight < this.scrollViewHeight &&
                            !this.chat.canGoUp &&
                            !this.chat.canGoDown
                        ) {
                            console.log(
                                `chat.js: ignoring auto scrolling because content size is small`
                            );
                            return;
                        }
                        console.log('chat.js: auto scrolling');
                        this.scrollView.scrollToOffset({ y: 0 });
                    }
                }

                if (this.waitForScrollToEnd) {
                    this.waitForScrollToEnd = false;
                }
            } else {
                this._contentSizeChanged = setTimeout(() => this.contentSizeChanged(), 1000);
            }
        }, 300);
    };

    lastVisibleItem = null;

    async saveItemPositionById(index) {
        if (!this.data[index]) {
            this.lastVisibleItem = null;
        }
        this.lastVisibleItem = this.data[index];
        return this.lastVisibleItem;
    }

    async restoreScrollPositionById(item, bottom) {
        const viewPosition = bottom ? 0 : 1;
        const animated = false;
        if (item !== this.lastVisibleItem) {
            console.debug(
                `chat.js: wrong id to restore: ${item.id}, ${this.lastVisibleItem &&
                    this.lastVisibleItem.id}`
            );
            return;
        }
        console.log(`restore last position to ${item.id}`);
        this.scrollView.scrollToItem({ item, viewPosition, animated });
    }

    async _onGoUp() {
        if (this.refreshing || this.chat.loadingTopPage || !this.chat.canGoUp) return;
        const lastItem = await this.saveItemPositionById(this.data.length - 1);
        this.chat.loadPreviousPage();
        when(
            () => !this.chat.loadingTopPage,
            () => {
                // only scroll if there's a pagination available
                if (this.chat.canGoDown) {
                    this.refreshing = true;
                    setTimeout(() => {
                        this.restoreScrollPositionById(lastItem);
                        this.refreshing = false;
                    }, 500);
                }
            }
        );
    }

    async _onGoDown() {
        if (this.refreshing || this.chat.loadingBottomPage || !this.chat.canGoDown) return;
        const lastItem = await this.saveItemPositionById(0);
        this.chat.loadNextPage();
        this.refreshing = true;
        when(
            () => !this.chat.loadingBottomPage,
            () => {
                setTimeout(() => {
                    this.restoreScrollPositionById(lastItem, true);
                    this.isAtBottom = false;
                    this.refreshing = false;
                }, 500);
            }
        );
    }

    isAtBottom = true;

    unreadMessageIndicatorTimeout = null;

    onScroll = event => {
        const { nativeEvent } = event;
        const { y } = nativeEvent.contentOffset;
        this.currentOffset = y;
        // console.log(`content offset: ${y}`);
        // const maxY = this.contentHeight - this.scrollViewHeight;
        // values here may be float therefore the magic "2" number
        this.isAtBottom = !this.chat.canGoDown && y < 2;
        clientApp.isReadingNewestMessages = this.isAtBottom;
    };

    updateUnreadMessageIndicators = () => {
        if (this.unreadMessageIndicatorTimeout) {
            clearTimeout(this.unreadMessageIndicatorTimeout);
            this.unreadMessageIndicatorTimeout = null;
        }

        if (!this.isAtBottom && !chatState.loading) {
            this.unreadMessageIndicatorTimeout = setTimeout(() => {
                if (this.isAtBottom || chatState.loading) return;
                uiState.customOverlayComponent = (
                    <ChatUnreadMessageIndicator onPress={this.scrollToBottom} />
                );
            }, 1000);
        } else {
            uiState.customOverlayComponent = null;
        }
    };

    onScrollBeginDrag = () => {
        this.isAtBottom = false;
    };

    onScroll = event => {
        const { nativeEvent } = event;
        const { y } = nativeEvent.contentOffset;
        // console.log(`content offset: ${y}`);
        // const maxY = this.contentHeight - this.scrollViewHeight;
        // values here may be float therefore the magic "2" number
        this.isAtBottom = !this.chat.canGoDown && y < 2;
        clientApp.isReadingNewestMessages = this.isAtBottom;
        this.updateUnreadMessageIndicators();
        const updater = () => {
            const { contentHeight, scrollViewHeight, chat } = this;
            if (!contentHeight || !scrollViewHeight || !chat) return;
            const h = this.contentHeight - this.scrollViewHeight;
            // trigger previous page if we are at the top
            if (y > h - this.indicatorHeight / 2) this._onGoUp();
            // trigger next page if we are at the bottom
            if (y <= this.indicatorHeight / 2) this._onGoDown();
        };
        if (this._updater) clearTimeout(this._updater);
        this._updater = setTimeout(updater, 500);
    };

    // scroll to end
    @action.bound
    scrollToBottom() {
        if (this.chat.canGoDown) {
            this.resetScrolling();
            this.chat.reset();
            return;
        }
        const y = this.contentHeight - this.scrollViewHeight;
        if (y) {
            this.scrollView.scrollToOffset({ y: 0, animated: true });
        }
    }

    get background() {
        return vars.white;
    }

    get limboMessages() {
        return this.chat.limboMessages
            ? this.chat.limboMessages
                  .filter(m => !(m.files && !m.files.length))
                  .map((item, index) => this.renderItem({ item, index }))
            : null;
    }

    @action.bound
    scrollViewRef(sv) {
        this.scrollView = sv;
    }

    listView() {
        if (chatState.loading) return null;
        const refreshControlTop = this.chat.canGoUp ? (
            <ActivityIndicator
                size="large"
                style={{ padding: vars.spacing.small.maxi }}
                onLayout={e => {
                    this.indicatorHeight = e.nativeEvent.layout.height;
                }}
            />
        ) : (
            this.zeroStateItem
        );
        const refreshControlBottom = this.chat.canGoDown ? (
            <ActivityIndicator size="large" style={{ padding: vars.spacing.small.maxi }} />
        ) : null;
        const style = {
            flexGrow: 1,
            flex: 1,
            backgroundColor: this.background,
            opacity: this.refreshing ? 0 : 1
        };
        const footer = (
            <View>
                {this.limboMessages}
                {refreshControlBottom}
            </View>
        );
        return (
            <FlatList
                onLayout={this.layoutScrollView}
                onContentSizeChange={this.contentSizeChanged}
                onScroll={this.onScroll}
                style={style}
                inverted
                initialNumToRender={1}
                keyboardShouldPersistTaps="never"
                data={this.data}
                renderItem={this.renderItem}
                keyExtractor={this.keyExtractor}
                ref={this.scrollViewRef}
                scrollEventThrottle={10}
                removeClippedSubviews={false}
                ListFooterComponent={refreshControlTop}
                ListHeaderComponent={footer}
            />
        );
    }

    @computed
    get zeroStateItem() {
        const { chat } = this;
        if (chat.isChatCreatedFromPendingDM) return <DmContactInvite />;
        return this.zeroStateChat;
    }

    chatNotice(chat) {
        return <ChatBeginningNotice chat={chat} />;
    }

    get zeroStateChat() {
        const zsContainer = {
            borderBottomWidth: 0,
            borderBottomColor: '#CFCFCF',
            marginBottom: vars.spacing.small.midi2x,
            paddingLeft: vars.spacing.medium.mini2x,
            paddingRight: vars.spacing.medium.mini2x
        };
        const { chat } = this;
        const participants = chat.isChannel ? chat.allParticipants : chat.otherParticipants;
        const w = 3 * 36;
        const shiftX = (width - w - w * participants.length) / participants.length;
        const shift = shiftX < 0 ? shiftX : 0;
        const marginLeft = shift < -w ? -w + 1 : shift;
        const avatars = (participants || []).map(contact => (
            <View key={contact.username} style={{ marginLeft, width: w }}>
                <TouchableOpacity
                    style={{ flex: 0 }}
                    pressRetentionOffset={vars.retentionOffset}
                    onPress={() => contactState.contactView(contact)}
                    key={contact.username}>
                    <AvatarCircle contact={contact} medium />
                </TouchableOpacity>
            </View>
        ));
        return (
            <View style={zsContainer}>
                <View style={{ flexDirection: 'row', paddingLeft: -marginLeft }}>{avatars}</View>
                {this.chatNotice(chat)}
                <IdentityVerificationNotice fullWidth />
            </View>
        );
    }

    renderThrow() {
        if (this.chat && this.chat.isInvite) return <DmContactInvite showButtons />;
        return (
            <View style={{ flexGrow: 1, paddingBottom: vars.spacing.small.mini2x }}>
                <View style={{ flex: 1, flexGrow: 1, backgroundColor: this.background }}>
                    {this.data ? this.listView() : null}
                </View>
                <ProgressOverlay enabled={this.refreshing || chatState.loading} />
            </View>
        );
    }
}

Chat.propTypes = {
    hideInput: PropTypes.bool
};
