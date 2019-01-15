// we're parsing based on regex instead of finite state machine
// because we want the flexibility or regex and don't want to deal
// with issues with unicode combining right now
// it will be much more performant to be replaced by finite state machine

function matchMentionRule(input) {
    const mentionInputRulePattern = /(?:^|\s)(@([a-zA-Z0-9_]{1,32}))(\s|.|,|$)/gu;
    const matches = [];
    for (;;) {
        const result = mentionInputRulePattern.exec(input);
        if (!result) break;
        const { index } = result;
        const [full, withAt, username] = result;
        if (!username) continue;
        const subIndex = full.indexOf(withAt);
        matches.push({
            start: index + subIndex,
            length: withAt.length,
            withAt,
            username
        });
    }
    return matches;
}

function mentionTokenize(input, matches) {
    const result = [];
    let current = 0;
    matches.forEach(match => {
        const before = input.substring(current, match.start);
        if (before.length) result.push({ text: before });
        const { username } = match;
        result.push({ text: match.withAt, username });
        current = match.start + match.length;
    });
    if (current < input.length) {
        result.push({ text: input.substring(current, input.length) });
    }
    return result;
}

function mentionParse(input) {
    const mentionMatches = matchMentionRule(input);
    if (!mentionMatches.length) return null;
    const tokens = mentionTokenize(input, mentionMatches);
    return tokens;
}

module.exports = { matchMentionRule, mentionTokenize, mentionParse };
