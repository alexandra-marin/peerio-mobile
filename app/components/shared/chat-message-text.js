import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { observer } from 'mobx-react/native';
import SafeComponent from '../shared/safe-component';
import tagify from './tagify';
import { User } from '../../lib/icebear';
import Text from '../controls/custom-text';
import { vars } from '../../styles/styles';
import { chatSchema, Renderer } from '../messaging/chat-schema';
import contacState from '../contacts/contact-state';

const textStyle = {
    color: vars.txtMedium,
    fontSize: vars.font.size14,
    lineHeight: 22
};

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
    const richTextElements = richText.content[0].content;
    const className =
        richTextElements.length <= 3 && richTextElements.every(e => e.type === 'emoji')
            ? 'jumboji'
            : '';
    return (
        <Renderer
            fragment={proseMirrorNode.content}
            onClickContact={contacState.showUsernameProfile}
            currentUser={User.current.username}
            className={className}
        />
    );
}

@observer
export default class ChatMessageText extends SafeComponent {
    renderThrow() {
        const { plainText, richText } = this.props;
        if (!plainText && !richText) return null;
        try {
            if (richText)
                return (
                    <View>
                        {renderRichText(richText)}
                        {/* renderPlainText(plainText) */}
                    </View>
                );
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
