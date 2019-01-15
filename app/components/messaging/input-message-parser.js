import { MarkdownParser } from 'prosemirror-markdown';
import markdownit from 'markdown-it';
import markdownItEmoji from 'markdown-it-emoji';
import * as linkify from 'linkifyjs';
import { markDownSchema, markDownToProseMirrorSchema } from './markdown-schema';

const markdownParser = markdownit({ html: false /* , linkify: true */ });
markdownParser.use(markdownItEmoji);

const defaultMarkdownParser = new MarkdownParser(
    markDownToProseMirrorSchema,
    markdownParser,
    markDownSchema
);

function parseJsonForLinks(json) {
    const { type, text, content } = json;
    if (type === 'text') {
        const tokens = linkify.tokenize(text);
        if (!tokens.find(token => token.isLink)) return null;
        return tokens.map(
            token =>
                token.isLink
                    ? {
                          type: 'link',
                          content: [
                              {
                                  type: 'text',
                                  text: token.toHref()
                              }
                          ]
                      }
                    : {
                          type: 'text',
                          text: token.toString()
                      }
        );
    }
    if (content && json.content.length) {
        const resultContent = [];
        content.forEach(child => {
            const replace = parseJsonForLinks(child);
            replace ? resultContent.push(...replace) : resultContent.push(child);
        });
        json.content = resultContent;
    }
    return null;
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
