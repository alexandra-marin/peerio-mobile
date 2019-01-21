const { tokenizer } = require('./tokenizer');

// we're parsing based on regex instead of finite state machine
// because we want the flexibility or regex and don't want to deal
// with issues with unicode combining right now
// it will be much more performant to be replaced by finite state machine

function matchEmojiShortnameRule(input) {
    const shortNameInputRulePattern = /:([a-zA-Z0-9_-]{3,64}):/gu;
    const matches = [];
    for (;;) {
        const result = shortNameInputRulePattern.exec(input);
        if (!result) break;
        const { index } = result;
        const [shortname] = result;
        if (!shortname) continue;
        matches.push({
            start: index,
            length: shortname.length,
            shortname
        });
    }
    return matches;
}

function emojiShortnameTokenize(input, matches) {
    return tokenizer(input, matches, match => ({
        text: match.shortname,
        shortname: match.shortname
    }));
}

function emojiShortnameParse(input) {
    const mentionMatches = matchEmojiShortnameRule(input);
    if (!mentionMatches.length) return null;
    const tokens = emojiShortnameTokenize(input, mentionMatches);
    return tokens;
}

module.exports = { emojiShortnameParse, emojiShortnameTokenize, matchEmojiShortnameRule };
