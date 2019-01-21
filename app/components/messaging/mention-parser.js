const { tokenizer } = require('./tokenizer');

// we're parsing based on regex instead of finite state machine
// because we want the flexibility or regex and don't want to deal
// with issues with unicode combining right now
// it will be much more performant to be replaced by finite state machine

function matchMentionRule(input) {
    const mentionInputRulePattern = /(^|\s)(@([a-zA-Z0-9_]{1,32}))(\s|.|,|$)/gu;
    const matches = [];
    for (;;) {
        const result = mentionInputRulePattern.exec(input);
        if (!result) break;
        const { index } = result;
        const [full, , withAt, username, spacerEnd] = result;
        if (!username) continue;
        const subIndex = full.indexOf(withAt);
        matches.push({
            start: index + subIndex,
            length: withAt.length,
            withAt,
            username
        });
        if (spacerEnd.length) {
            mentionInputRulePattern.lastIndex -= spacerEnd.length;
        }
    }
    return matches;
}

function mentionTokenize(input, matches) {
    return tokenizer(input, matches, match => ({
        username: match.username,
        text: match.withAt
    }));
}

function mentionParse(input) {
    const mentionMatches = matchMentionRule(input);
    if (!mentionMatches.length) return null;
    const tokens = mentionTokenize(input, mentionMatches);
    return tokens;
}

module.exports = { matchMentionRule, mentionTokenize, mentionParse };
