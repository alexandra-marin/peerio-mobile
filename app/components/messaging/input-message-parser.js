import { MarkdownParser } from 'prosemirror-markdown';
import markdownit from 'markdown-it';
import markdownItEmoji from 'markdown-it-emoji';
import _ from 'lodash';
import * as linkify from 'linkifyjs';
import { markDownSchema, markDownToProseMirrorSchema } from './markdown-schema';

const markdownParser = markdownit({ html: false, linkify: true });
markdownParser.use(markdownItEmoji);

const normalParser = markdownParser.parse.bind(markdownParser);
markdownParser.parse = message => {
    const tokens = normalParser(message);
    tokens.forEach(linkifyMarkdownToken);
    return tokens;
};

const defaultMarkdownParser = new MarkdownParser(
    markDownToProseMirrorSchema,
    markdownParser,
    markDownSchema
);

global.markDownToProseMirrorSchema = markDownToProseMirrorSchema;

function linkifyMarkdownToken(token) {
    const { content, children } = token;
    if (token.type === 'link_open' || token.type === 'link_close') {
        console.log('removing link tags');
        return null;
    }
    if (children) {
        token.children = children.map(linkifyMarkdownToken).filter(c => !!c);
    } else if (content) {
        // .
        console.log(`Found leaf node: ${content}`);
        // remove this double tokenization
        const items = linkify.tokenize(content);
        const firstLink = items[0] || {};
        if (firstLink.isLink) {
            token.type = 'link';
            token.tag = 'link';
            token.content = firstLink.toHref();
            token.text = firstLink.toHref();
            token.attrs = { href: token.text };
        }
    }
    return token;
}

function parseJsonForLinks(json) {
    if (json.type === 'link') {
        json.content = [{ type: 'text', text: json.attrs.href }];
        delete json.attrs;
        return;
    }
    if (json.content && json.content.length) json.content.forEach(parseJsonForLinks);
}

function inputMessageParser(message) {
    console.log(markdownParser.parse(message));
    const proseMirrorMessage = defaultMarkdownParser.parse(message);
    console.log(proseMirrorMessage);
    const richTextJSON = proseMirrorMessage.toJSON();
    parseJsonForLinks(richTextJSON);
    console.log(richTextJSON);
    return richTextJSON;
}

export default inputMessageParser;
