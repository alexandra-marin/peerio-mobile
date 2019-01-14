import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react/native';
import SafeComponent from '../shared/safe-component';
import tagify from './tagify';
import { User } from '../../lib/icebear';
import Text from '../controls/custom-text';
import { vars } from '../../styles/styles';
import { chatSchema, Renderer } from '../messaging/chat-schema';

const textStyle = {
    color: vars.txtMedium,
    fontSize: vars.font.size14,
    lineHeight: 22
};

function onClickContact() {
    console.log('onclick contact');
}

function renderPlainText(plainText) {
    const text = plainText.replace(/\n[ ]+/g, '\n') || '';
    return (
        <Text selectable style={textStyle}>
            {tagify(text, User.current.username)}
        </Text>
    );
}

function renderRichText(richText) {
    const proseMirrorNode = chatSchema.nodeFromJSON(richText);

    // Note that an error in the renderer component won't get caught
    // by this try-catch -- it's not actually invoked in this stack
    // frame.
    return (
        <Renderer
            fragment={proseMirrorNode.content}
            onClickContact={onClickContact}
            currentUser={User.current.username}
        />
    );
}

@observer
export default class ChatMessageText extends SafeComponent {
    renderThrow() {
        const { plainText, richText } = this.props;
        if (!plainText && !richText) return null;
        try {
            if (richText) return renderRichText(richText);
        } catch (e) {
            console.error(e);
            if (!plainText) {
                console.error("rich text failed to parse and there's no plain text");
                return null;
            }
        }
        return renderPlainText(plainText);
    }
}

ChatMessageText.propTypes = {
    message: PropTypes.any
};
