const { emojiShortnameParse } = require('../app/components/messaging/emoji-shortname-parser');

function testEmojiParser(sampleText) {
    const tokens = emojiShortnameParse(sampleText);
    if (!tokens) {
        console.log(`Emojis not found for ${sampleText}`);
        return;
    }
    console.log(tokens);
    const parsedText = tokens.map(t => t.text).join('');
    if (parsedText !== sampleText) {
        console.error('Parsed and reformatted text do not match');
    }
    console.log(`Original/formatted: \n${sampleText}\n${parsedText}`);
}

// testMentionParser('@eren some text @anri other @floh. text email @seavan forever more');
// testMentionParser('@eren');
testEmojiParser(':laughing::laughing::laughing:');
