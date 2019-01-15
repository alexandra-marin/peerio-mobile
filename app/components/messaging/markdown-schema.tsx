import emojione from 'emojione';
import { Schema } from 'prosemirror-model';

const markDownToProseMirrorSchema = new Schema({
    nodes: {
        doc: {
            content: 'block+'
        },

        paragraph: {
            content: 'inline*',
            group: 'block',
            parseDOM: [{ tag: 'p' }]
        },

        blockquote: {
            content: 'block+',
            group: 'block',
            parseDOM: [{ tag: 'blockquote' }]
        },

        text: {
            group: 'inline'
        },

        hard_break: {
            inline: true,
            group: 'inline',
            selectable: false,
            parseDOM: [{ tag: 'br' }]
        },

        emoji: {
            inline: true,
            group: 'inline',
            selectable: false,
            attrs: {
                shortname: { default: ':laughing:' }
            },
            parseDOM: [{ tag: 'emoji' }]
        }

        /* link: {
            inline: true,
            group: 'inline',
            attrs: {
                href: { default: 'https://www.ya.ru/' }
            },
            parseDOM: [
                {
                    // this is to support our hacky way to get links from markdown
                    // tag: 'a[href]',
                    tag: 'link'
                }
            ]
        } */
    },

    marks: {
        strike: {
            parseDOM: [{ tag: 's' }]
        },

        em: {
            parseDOM: [{ tag: 'i' }, { tag: 'em' }]
        },

        strong: {
            parseDOM: [{ tag: 'b' }, { tag: 'strong' }]
        }
    }
});

const markDownSchema = {
    blockquote: { block: 'blockquote' },
    paragraph: { block: 'paragraph' },
    hardbreak: { node: 'hard_break' },
    em: { mark: 'em' },
    s: { mark: 'strike' },
    emoji: {
        node: 'emoji',
        getAttrs: tok => {
            const { content } = tok;
            console.log(content);
            const emojiShortName = emojione.toShort(content);
            console.log(emojiShortName);
            return {
                shortname: emojiShortName
            };
        }
    },
    strong: { mark: 'strong' }
    /* link: {
        node: 'link',
        getAttrs: tok => {
            console.log('get attributes for link');
            console.log(JSON.stringify(tok));
            return {
                href: tok.attrs.href
            };
        }
    } */
};

export { markDownSchema, markDownToProseMirrorSchema };
