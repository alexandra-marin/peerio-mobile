const { mentionParse } = require('../app/components/messaging/mention-parser');

function testMentionParser(sampleText) {
    const tokens = mentionParse(sampleText);
    if (!tokens) {
        console.log(`Mentions not found for ${sampleText}`);
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
testMentionParser('@anri @vincent is here');
