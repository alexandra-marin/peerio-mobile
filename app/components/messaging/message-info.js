import React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react/native';
import { View, SectionList } from 'react-native';
import { contactStore } from '../../lib/icebear';
import Text from '../controls/custom-text';
import SafeComponent from '../shared/safe-component';
import LayoutModalExit from '../layout/layout-modal-exit';
import { vars } from '../../styles/styles';
import { tx } from '../utils/translator';
import ContactCard from '../shared/contact-card';
import ListSeparator from '../shared/list-separator';
import ChatMessageBody from '../shared/chat-message-body';
import routes from '../routes/routes';

const messageStyle = {
    padding: vars.spacing.medium.midi,
    flex: 1,
    flexGrow: 1,
    flexShrink: 1
};

const headerStyle = {
    fontSize: 16,
    padding: 16,
    color: vars.black54,
    backgroundColor: vars.white
};

@observer
export default class MessageInfo extends SafeComponent {
    get messageText() {
        const {
            messageObject,
            chat,
            onFileAction,
            onLegacyFileAction,
            onInlineImageAction
        } = this.props;
        return (
            <View style={messageStyle}>
                <ChatMessageBody
                    {...{
                        messageObject,
                        chat,
                        onFileAction,
                        onLegacyFileAction,
                        onInlineImageAction
                    }}
                    isClosed
                />
            </View>
        );
    }

    participant = ({ item }) => {
        const c = contactStore.getContact(item.username);
        return <ContactCard contact={c} key={item.username} disableTapping />;
    };

    get sections() {
        const sections = [];
        if (this.seenBy.length) sections.push({ data: this.seenBy, key: this.number() });
        if (this.notSeenBy && this.notSeenBy.length)
            sections.push({ data: this.notSeenBy, key: tx('title_sentTo') });

        return sections;
    }

    @computed
    get seenBy() {
        return (this.props.messageObject.receipts || []).slice();
    }

    @computed
    get notSeenBy() {
        return this.props.chat.otherParticipants.filter(this.notSeen);
    }

    notSeen = item => !this.seenBy.some(x => x.username === item.username);

    number = () => {
        const receipts = this.seenBy.length;
        const participants = this.props.chat.otherParticipants.length;
        if (receipts === participants) return `${tx('title_seenByAll')} (${receipts}/${receipts})`;
        return `${tx('title_seenBy')} (${receipts}/${participants})`;
    };

    headers = ({ section: { key } }) => {
        return <Text style={headerStyle}>{key}</Text>;
    };

    renderThrow() {
        if (!this.props.chat || !this.props.messageObject) return null;
        const body = (
            <View style={{ backgroundColor: vars.channelInfoBg }}>
                <View
                    style={{
                        marginRight: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    <View
                        style={{
                            flex: 1
                        }}>
                        <ContactCard
                            contact={this.props.messageObject.sender}
                            backgroundColor={vars.channelInfoBg}
                            disableTapping
                        />
                    </View>
                    <Text style={{ flex: 0, color: vars.black54, fontSize: 14 }}>
                        {this.props.messageObject.messageTimestampText}
                    </Text>
                </View>
                {this.messageText}
                <ListSeparator />
                <SectionList
                    sections={this.sections}
                    keyExtractor={contact => contact.username}
                    renderItem={this.participant}
                    renderSectionHeader={this.headers}
                    style={{ marginBottom: 8 }}
                />
            </View>
        );
        return (
            <LayoutModalExit
                body={body}
                title="error_messageErrorMessageInfo"
                onClose={() => routes.modal.discard()}
            />
        );
    }
}
