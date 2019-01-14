import { MarkdownParser } from 'prosemirror-markdown';
import markdownit from 'markdown-it';
import markdownItEmoji from 'markdown-it-emoji';
import { markDownSchema, markDownToProseMirrorSchema } from './markdown-schema';

const markdownParser = markdownit({ html: false });
markdownParser.use(markdownItEmoji);

const defaultMarkdownParser = new MarkdownParser(
    markDownToProseMirrorSchema,
    markdownParser,
    markDownSchema
);

function inputMessageParser(message) {
    // console.log(markdownParser.parse(message));
    const proseMirrorMessage = defaultMarkdownParser.parse(message);
    console.log(proseMirrorMessage);
    const richTextJSON = proseMirrorMessage.toJSON();
    console.log(richTextJSON);
    return richTextJSON;
}

export default inputMessageParser;
