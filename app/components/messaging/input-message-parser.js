import { MarkdownParser } from 'prosemirror-markdown';
import markdownit from 'markdown-it';
import markdownItEmoji from 'markdown-it-emoji';
import emojione from 'emojione';
import { parseUrls } from '../helpers/urls';
import { markDownSchema, markDownToProseMirrorSchema } from './markdown-schema';
import { mentionParse } from './mention-parser';
import { emojiShortnameParse } from './emoji-shortname-parser';

const markdownParser = markdownit({ html: false, linkify: false, breaks: true });
markdownParser.use(markdownItEmoji);
markdownParser.disable('link');

const defaultMarkdownParser = new MarkdownParser(
    markDownToProseMirrorSchema,
    markdownParser,
    markDownSchema
);

function preserveLineBreaks(text) {
    return (
        text
            .replace(/\n/g, '\\\n')
            // this is a hack to address a bug in markdown-it
            // when end hard line break is not decoded
            .replace(/\\\n$/, '\\\n\u200B')
    );
}

function ruleMention(text) {
    const tokens = mentionParse(text);
    if (!tokens) return null;
    return tokens.map(
        token =>
            token.username
                ? {
                      type: 'mention',
                      attrs: { username: token.username }
                  }
                : {
                      type: 'text',
                      text: token.text
                  }
    );
}

function ruleEmojiShortName(text) {
    const tokens = emojiShortnameParse(text);
    if (!tokens) return null;
    return tokens.map(
        token =>
            token.shortname
                ? {
                      type: 'emoji',
                      attrs: { shortname: token.shortname }
                  }
                : {
                      type: 'text',
                      text: token.text
                  }
    );
}

function ruleLinkify(text) {
    const tokens = parseUrls(text);
    if (!tokens.find(token => !!token.href)) return null;
    return tokens.map(
        token =>
            token.href
                ? {
                      type: 'link',
                      content: [
                          {
                              type: 'text',
                              text: token.mailto || token.href
                          }
                      ]
                  }
                : {
                      type: 'text',
                      text: token.text
                  }
    );
}

function parseJsonForRule(json, rule) {
    const { type, text, content } = json;
    if (type === 'text') {
        // const mentions = mentionInputRulePattern
        return rule(text);
    }
    if (content && json.content.length) {
        const resultContent = [];
        content.forEach(child => {
            const replace = parseJsonForRule(child, rule);
            if (replace) {
                const { marks } = child;
                replace.forEach(r => {
                    if (marks) r.marks = marks;
                    resultContent.push(r);
                });
                if (marks)
                    replace.forEach(r => {
                        r.marks = marks;
                    });
            } else {
                resultContent.push(child);
            }
        });
        json.content = resultContent;
    }
    return null;
}

function parseJsonWithRules(json, rules) {
    rules.forEach(rule => parseJsonForRule(json, rule));
}

function inputMessageParser(message) {
    const parsedMessage = emojione.toShort(preserveLineBreaks(message));
    const proseMirrorMessage = defaultMarkdownParser.parse(parsedMessage);
    const richTextJSON = proseMirrorMessage.toJSON();
    parseJsonWithRules(richTextJSON, [ruleMention, ruleLinkify, ruleEmojiShortName]);
    return richTextJSON;
}

export default inputMessageParser;
