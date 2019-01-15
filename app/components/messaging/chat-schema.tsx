// TODO: split schema into own file, possibly migrate to Icebear

import React from 'react';
import { TextStyle, Linking } from 'react-native';
import { Schema, Node } from 'prosemirror-model';
import { makeReactRenderer } from 'prosemirror-react-renderer';
import emojione from 'emojione';
import _ from 'lodash';
import Text from '../controls/custom-text';
import { vars } from '../../styles/styles';
import * as linkify from 'linkifyjs';

const textStyle = {
    color: vars.txtMedium,
    fontSize: vars.font.size14,
    lineHeight: 22
};

const jumbojiTextStyle = {
    color: vars.txtMedium,
    fontSize: 36,
    lineHeight: 48
};

function injectMarkToReact(props) {
    return {
        toReact({}, {}, children) {
            let newChild;
            if (children && !_.isArray(children)) {
                newChild = {
                    ...children,
                    props: {
                        ...children.props,
                        ...props
                    }
                };
            }
            return newChild;
        }
    };
}

function noop() {}

function parseUrls(text) {
    const items = linkify.tokenize(text).map((token, i) => {
        const p = token.isLink
            ? () => {
                  Linking.openURL(token.toHref());
              }
            : null;
        const s: TextStyle = token.isLink
            ? {
                  textDecorationLine: 'underline',
                  color: vars.peerioBlue
              }
            : textStyle;
        // onLongPress noop prevents opening links when there was a long press
        return (
            <Text onPress={p} onLongPress={noop} key={i} style={s}>
                {token.toString()}
            </Text>
        );
    });
    return <React.Fragment>{items}</React.Fragment>;
}
// import { emojiByCanonicalShortname, pngFolder } from '~/helpers/chat/emoji';
// import { parseUrls } from '~/helpers/url';

/** Pattern to match against when creating a new mention node. */
// const validUsernamePattern = /[a-zA-Z0-9_]{1,32}/;

// Schema originally adapted from https://github.com/ProseMirror/prosemirror-schema-basic.

// Versioning the schema: changing `parseDOM`, `toDOM` and `toReact` is okay;
// adding new nodes or marks should also be non-breaking. (Make sure their parse
// rules don't overlap existing rules!) Any other change should be considered
// breaking. (And note that "non-breaking" changes will not be
// backwards-compatible, regardless.)

export const chatSchema = new Schema(
    {
        nodes: {
            doc: { content: 'block+' },
            paragraph: {
                content: 'inline*',
                group: 'block',
                toReact({}, contents) {
                    return <Text style={textStyle}>{contents}</Text>;
                }
            },
            text: {
                group: 'inline',
                toReact(node) {
                    return (
                        <Text selectable style={textStyle}>
                            {node.textContent}
                        </Text>
                    );
                }
            },
            hard_break: {
                inline: true,
                group: 'inline',
                selectable: false,
                toReact() {
                    // TODO: br
                    return (
                        <Text selectable style={textStyle}>
                            {'\n'}
                        </Text>
                    );
                }
            },
            // The link node has no `parseDOM` field: it can't be instantiated in
            // the input field, but might be created when sending the message.
            // (thus we also don't implement toDOM -- just toReact.)
            link: {
                inline: true,
                group: 'inline',
                content: 'text*',
                selectable: true,
                // SECURITY: it's less efficient than fully pre-parsing the url, but
                // for security, in chats links aren't allowed a different href than
                // their body (since this would enable eg. the ability for a
                // malicious client to trivially make phishing links -- the implicit
                // contract we establish in chats is that a link _always_ goes to
                // where it text says). so we use this link node to mark up
                // valid/permitted urls ahead of time, but still have to re-validate
                // them on the receiving side (which should still be quicker than
                // re-parsing the entire message.)
                //
                // if this is for some reason a perf bottleneck, we can revisit the
                // usage of `parseUrls` here in favour of a step that verifies and
                // normalizes but doesn't do a full parse, but this is the simplest
                // solution for now and ensures parity in behaviour with what
                // happens in the send step.
                toReact(node) {
                    const content = node.textContent;
                    return parseUrls(content);
                }
            },
            mention: {
                inline: true,
                group: 'inline',
                selectable: true,
                marks: '',
                attrs: {
                    username: {}
                },
                toReact(node, _, props) {
                    return (
                        <Text
                            onPress={() => props.onClickContact(node.attrs.username)}
                            bold
                            style={[
                                textStyle,
                                {
                                    backgroundColor:
                                        props.currentUser === node.attrs.username
                                            ? vars.selfUsernameHighlight
                                            : vars.usernameHighlight
                                }
                            ]}>
                            @{node.attrs.username}
                        </Text>
                    );
                    /*
                    TODO: mention
                    return (
                        <span
                            className={css('mention', 'clickable', {
                                self: node.attrs.username === props.currentUser
                            })}
                            data-username={node.attrs.username}
                            onClick={props.onClickContact}>
                            @{node.attrs.username}
                        </span>
                    ); */
                }
            },
            emoji: {
                inline: true,
                group: 'inline',
                draggable: true,
                attrs: {
                    shortname: {}
                },
                toReact(node, _, props) {
                    return (
                        <Text style={props.className === 'jumboji' ? jumbojiTextStyle : textStyle}>
                            {emojione.shortnameToUnicode(node.attrs.shortname)}
                        </Text>
                    );
                }
            }
        },
        marks: {
            em: injectMarkToReact({
                italic: true
            }),
            strike: injectMarkToReact({
                style: [
                    textStyle,
                    {
                        textDecorationLine: 'line-through',
                        textDecorationStyle: 'solid'
                    }
                ]
            }),
            strong: injectMarkToReact({
                bold: true
            })
        }
    } as any /* bad typings */
);

export const emptyDoc = chatSchema.node('doc', null, chatSchema.node('paragraph'));

/**
 * Return whether the document is in its initial state.
 */
export function isEmpty(doc: Node): boolean {
    return doc.eq(emptyDoc);
}

/**
 * Return whether the given document/node contains only whitespace.
 */
export function isWhitespaceOnly(node: Node): boolean {
    if (node.isBlock) {
        if (node.type === chatSchema.nodes.paragraph || node.type === chatSchema.nodes.doc) {
            if (node.content.size > 0) {
                // if we're a paragraph node or a doc with content, we're whitespace if our contents are whitespace.
                // eslint-disable-next-line dot-notation, (inner content array not exposed in api)
                return node.content['content'].reduce((p, c) => p && isWhitespaceOnly(c), true);
            }
            // if we're a paragraph node or a doc with no content, we're whitespace.
            return true;
        }
        // all other block nodes aren't whitespace.
        return false;
    }
    if (node.isText) {
        return node.text.trim().length === 0;
    }
    if (node.type === chatSchema.nodes.hard_break) {
        return true;
    }
    return false;
}

export const Renderer = makeReactRenderer<{
    onClickContact: React.MouseEventHandler;
    currentUser: string;
    className: string;
}>(chatSchema, 'MessageRichTextRenderer');
