import React from 'react';
import { observer } from 'mobx-react/native';
import { View } from 'react-native';
import { MarkdownParser } from 'prosemirror-markdown';
import { Schema } from 'prosemirror-model';
import markdownit from 'markdown-it';
import markdownItEmoji from 'markdown-it-emoji';
import SafeComponent from '../shared/safe-component';
import InputMain from './input-main';
import chatState from '../messaging/chat-state';
import FileUploadProgress from '../files/file-upload-progress';
import FileUploadActionSheet from '../files/file-upload-action-sheet';
import { vars } from '../../styles/styles';

// ::Schema Document schema for the data model used by CommonMark.
export const schema = new Schema({
    nodes: {
        doc: {
            content: 'block+'
        },

        paragraph: {
            content: 'inline*',
            group: 'block',
            parseDOM: [{ tag: 'p' }],
            toDOM() {
                return ['p', 0];
            }
        },

        blockquote: {
            content: 'block+',
            group: 'block',
            parseDOM: [{ tag: 'blockquote' }],
            toDOM() {
                return ['blockquote', 0];
            }
        },

        text: {
            group: 'inline',
            toDOM(node) {
                return node.text;
            }
        },

        hard_break: {
            inline: true,
            group: 'inline',
            selectable: false,
            parseDOM: [{ tag: 'br' }],
            toDOM() {
                return ['br'];
            }
        },

        emoji: {
            inline: true,
            group: 'inline',
            selectable: false,
            attrs: {
                shortname: { default: ':laughing:' }
            },
            parseDOM: [{ tag: 'emoji' }],
            toDOM() {
                return ['^_^'];
            }
        }
    },

    marks: {
        em: {
            parseDOM: [
                { tag: 'i' },
                { tag: 'em' },
                { style: 'font-style', getAttrs: value => value === 'italic' && null }
            ],
            toDOM() {
                return ['em'];
            }
        },

        strong: {
            parseDOM: [
                { tag: 'b' },
                { tag: 'strong' },
                {
                    style: 'font-weight',
                    getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
                }
            ],
            toDOM() {
                return ['strong'];
            }
        },

        link: {
            attrs: {
                href: {},
                title: { default: null }
            },
            inclusive: false,
            parseDOM: [
                {
                    tag: 'a[href]',
                    getAttrs(dom) {
                        return { href: dom.getAttribute('href'), title: dom.getAttribute('title') };
                    }
                }
            ],
            toDOM(node) {
                return ['a', node.attrs];
            }
        },

        code: {
            parseDOM: [{ tag: 'code' }],
            toDOM() {
                return ['code'];
            }
        }
    }
});

@observer
export default class InputMainContainer extends SafeComponent {
    send = v => {
        const message = v;
        if (!message || !message.length) {
            this.sendAck();
            return;
        }

        const markdownParser = markdownit('commonmark', { html: false });
        markdownParser.use(markdownItEmoji);
        /* markdownParser.renderer.rules.emoji = function(token, idx) {
            return '^_^';
        }; */

        const defaultMarkdownParser = new MarkdownParser(schema, markdownParser, {
            blockquote: { block: 'blockquote' },
            paragraph: { block: 'paragraph' },
            // heading: { block: 'heading', getAttrs: tok => ({ level: +tok.tag.slice(1) }) },
            hardbreak: { node: 'hard_break' },
            em: { mark: 'em' },
            emoji: {
                node: 'emoji',
                getAttrs: tok => {
                    console.log(tok);
                    return {
                        shortname: ':star_struck:'
                    };
                }
            },
            strong: { mark: 'strong' }
            /* link: {
                mark: 'link',
                getAttrs: tok => ({
                    href: tok.attrGet('href'),
                    title: tok.attrGet('title') || null
                })
            } */
        });

        const proseMirrorMessage = defaultMarkdownParser.parse(message);
        console.log(proseMirrorMessage);
        const richTextJSON = proseMirrorMessage.toJSON();
        console.log(richTextJSON);
        chatState.addMessage(message, richTextJSON);
    };

    sendAck = () => chatState.addAck();

    plus = () =>
        FileUploadActionSheet.show({
            inline: true,
            createFolder: false,
            disableFolders: chatState.chatStore.activeChat.isChannel
        });

    uploadQueue() {
        const chat = chatState.currentChat;
        const q = (chat && chat.uploadQueue) || [];
        return q.map(f => <FileUploadProgress file={f} key={f.fileId} transparentOnFinishUpload />);
    }

    renderThrow() {
        const outer = {
            backgroundColor: vars.white
        };
        const s = {
            backgroundColor: vars.white,
            borderTopColor: vars.separatorColor,
            borderTopWidth: 1
        };
        return (
            <View style={outer}>
                <View>{this.uploadQueue()}</View>
                <View style={s}>
                    <InputMain
                        {...this.props}
                        plus={this.plus}
                        sendAck={this.sendAck}
                        send={this.send}
                    />
                </View>
            </View>
        );
    }
}
