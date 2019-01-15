import { MarkdownParser } from 'prosemirror-markdown';
import markdownit from 'markdown-it';
import markdownItEmoji from 'markdown-it-emoji';
import * as linkify from 'linkifyjs';
import { markDownSchema, markDownToProseMirrorSchema } from './markdown-schema';
import { mentionParse } from './mention-parser';

const markdownParser = markdownit({ html: false /* , linkify: true */ });
markdownParser.use(markdownItEmoji);

const defaultMarkdownParser = new MarkdownParser(
    markDownToProseMirrorSchema,
    markdownParser,
    markDownSchema
);

function ruleMention(text) {
    const tokens = mentionParse(text);
    console.log(tokens);
    if (!tokens.find(token => token.username)) return null;
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
    console.log(markdownParser.parse(message));
    const proseMirrorMessage = defaultMarkdownParser.parse(message);
    console.log(proseMirrorMessage);
    const richTextJSON = proseMirrorMessage.toJSON();
    parseJsonWithRules(richTextJSON, [ruleMention, ruleLinkify]);
    console.log(richTextJSON);
    return richTextJSON;
}

export default inputMessageParser;
