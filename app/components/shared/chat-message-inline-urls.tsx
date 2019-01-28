import React from 'react';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import InlineUrlContainer from '../messaging/inline-url-container';
import { Message } from '../../lib/peerio-icebear/models';

interface ChatMessageInlineUrlsProps {
    message: Message;
    isClosed;
}

@observer
export default class ChatMessageInlineUrls extends SafeComponent<ChatMessageInlineUrlsProps> {
    renderThrow() {
        const { message } = this.props;
        const { externalWebsites } = message;
        if (!externalWebsites.length) return null;

        return externalWebsites.map(externalWebsite => {
            return (
                <InlineUrlContainer
                    key={externalWebsite.title}
                    externalWebsite={externalWebsite}
                    isClosed={this.props.isClosed}
                />
            );
        });
    }
}
