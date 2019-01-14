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
            ]
        },

        code: {
            parseDOM: [{ tag: 'code' }]
        }
    }
});

const markDownSchema = {
    blockquote: { block: 'blockquote' },
    paragraph: { block: 'paragraph' },
    // heading: { block: 'heading', getAttrs: tok => ({ level: +tok.tag.slice(1) }) },
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
            mark: 'link',
            getAttrs: tok => ({
                href: tok.attrGet('href'),
                title: tok.attrGet('title') || null
            })
        } */
};

export { markDownSchema, markDownToProseMirrorSchema };
