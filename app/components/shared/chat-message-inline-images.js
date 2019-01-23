import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { computed } from 'mobx';
import { observer } from 'mobx-react/native';
import SafeComponent from './safe-component';
import FileInlineImage from '../files/file-inline-image';
import fileState from '../files/file-state';
import InlineUrlContainer from '../messaging/inline-url-container';

@observer
export default class ChatMessageInlineImages extends SafeComponent {
    @computed
    get images() {
        const { message, chat } = this.props;
        const files =
            (message.files || [])
                .map(id => fileState.store.getByIdInChat(id, chat.id))
                .filter(f => f) || [];

        const images = files.filter(f => f.isImage) || [];

        if (message.hasUrls && message.externalImages.length) {
            images.push(...message.externalImages);
        }

        return images;
    }

    get renderImages() {
        const { onInlineImageAction, onLegacyFileAction, isClosed } = this.props;

        return this.images.map(image => {
            // branch on url
            const { fileId, url } = image;
            const key = fileId || image;
            if (url) {
                const externalWebsite = {
                    image: { url },
                    fileType: 'img'
                };
                return <InlineUrlContainer {...{ key, externalWebsite }} />;
            }
            return (
                <FileInlineImage
                    {...{ key, image, onLegacyFileAction }}
                    onAction={onInlineImageAction}
                    isClosed={isClosed}
                />
            );
        });
    }

    renderThrow() {
        if (!this.images.length) return null;

        return <View>{this.renderImages}</View>;
    }
}

ChatMessageInlineImages.propTypes = {
    message: PropTypes.any,
    chat: PropTypes.any,
    onInlineImageAction: PropTypes.any,
    onLegacyFileAction: PropTypes.any
};
