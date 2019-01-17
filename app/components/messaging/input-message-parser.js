import { MarkdownParser } from 'prosemirror-markdown';
import markdownit from 'markdown-it';
import markdownItEmoji from 'markdown-it-emoji';
import { parseUrls } from '../helpers/urls';
import { markDownSchema, markDownToProseMirrorSchema } from './markdown-schema';
import { mentionParse } from './mention-parser';

const markdownParser = markdownit({ html: false, breaks: true });
markdownParser.use(markdownItEmoji);

const defaultMarkdownParser = new MarkdownParser(
    markDownToProseMirrorSchema,
    markdownParser,
    markDownSchema
);

function preserveLineBreaks(text) {
    return text.replace(/\n/g, '\\\n');
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
            replace ? resultContent.push(...replace) : resultContent.push(child);
        });
        json.content = resultContent;
    }
    return null;
}

function parseJsonWithRules(json, rules) {
    rules.forEach(rule => parseJsonForRule(json, rule));
}

function inputMessageParser(message) {
    const parsedMessage = preserveLineBreaks(message);
    const proseMirrorMessage = defaultMarkdownParser.parse(parsedMessage);
    const richTextJSON = proseMirrorMessage.toJSON();
    parseJsonWithRules(richTextJSON, [ruleMention, ruleLinkify]);
    return richTextJSON;
}

export default inputMessageParser;
