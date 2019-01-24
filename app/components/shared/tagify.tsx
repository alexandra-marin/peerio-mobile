import React from 'react';
import { Linking, TextStyle } from 'react-native';
import * as linkify from 'linkifyjs';
import Text from '../controls/custom-text';
import { vars } from '../../styles/styles';

function noop() {}

export default (m, username) => {
    /* const tagify = (t, r, s, n) => {
        return t.split(r).map((token, i) => {
            return <Text key={i} style={i % 2 ? s : null}>{n ? n(token) : token}</Text>;
        });
    }; */

    const tagifyExact = (t, r, s, n?) => {
        const items = t.split(new RegExp(`${r}`));
        const result = [];
        for (let i = 0; i < items.length; ++i) {
            const token = items[i];
            if (i % 2)
                result.push(
                    <Text bold key={`${i}-hl`} style={s}>
                        {r}
                    </Text>
                );
            result.push(<Text key={i}>{n ? n(token) : token}</Text>);
        }
        return result;
    };

    const tagifyUsername = t =>
        tagifyExact(t, `@${username}`, { backgroundColor: vars.usernameHighlight });
    // const tagifyB = (t) => tagify(t, /<\/*b>/, { fontWeight: 'bold' }, tagifyUsername);
    // const tagifyI = (t) => tagify(t, /<\/*i>/, { fontStyle: 'italic' }, tagifyB);

    const items = linkify.tokenize(m).map((token, i) => {
        const p = token.isLink
            ? () => {
                  Linking.openURL(token.toHref());
              }
            : null;
        const str = token.toString();
        const t = token.isLink ? str : tagifyUsername(str);
        const s: TextStyle = token.isLink
            ? {
                  textDecorationLine: 'underline',
                  color: vars.peerioBlue
              }
            : null;
        // onLongPress noop prevents opening links when there was a long press
        return (
            <Text onPress={p} onLongPress={noop} key={i} style={s}>
                {t}
            </Text>
        );
    });
    return items;
};
