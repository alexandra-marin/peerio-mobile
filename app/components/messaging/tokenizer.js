function tokenizer(input, matches, mapper) {
    const result = [];
    let current = 0;
    matches.forEach(match => {
        const before = input.substring(current, match.start);
        if (before.length) result.push({ text: before });
        result.push(mapper(match));
        current = match.start + match.length;
    });
    if (current < input.length) {
        result.push({ text: input.substring(current, input.length) });
    }
    return result;
}

module.exports = { tokenizer };
