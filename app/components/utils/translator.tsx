import React from 'react';
import { has } from 'peerio-translator';
import { t, LocalizationStrings } from '../../lib/peerio-icebear';
import { ParamsType } from '../../lib/peerio-icebear/copy/t';
import Text from '../controls/custom-text';
import whiteLabelConfig from '../whitelabel/white-label-config';

function findPrefixedName<K extends keyof LocalizationStrings>(k: K): K {
    if (!k) return null;
    const prefix = whiteLabelConfig.LOCALE_PREFIX;
    let name = k;
    if (name.startsWith('title_seeWhoYouAlreadyKnow')) {
        console.log('here');
    }
    const mobileName = `${name}_mobile`;
    if (has(mobileName)) {
        name = mobileName as K; // TODO: find a better solution for a prefixed name
    }
    if (prefix) {
        const whitelabelName = `${prefix}${name}`;
        if (has(whitelabelName)) name = whitelabelName as K; // TODO: find a better solution for a prefixed name
    }
    return name;
}

/* interface IBaseTProps {
    uppercase?: boolean;
} */

type TProps<K extends keyof LocalizationStrings> = LocalizationStrings[K] extends () => any
    ? { k: K }
    : LocalizationStrings[K] extends (params: infer U) => any ? { k: K; children: U } : never;

export function T<K extends keyof LocalizationStrings>(props: TProps<K>): JSX.Element {
    const { k, uppercase, children } = props as any;
    const name = findPrefixedName(k);
    if (!name) return null;
    if (!has(name)) {
        console.error(`${name} not found`);
    }
    let translated = (t as any)(name, children);
    if (Array.isArray(translated)) {
        return <Text>{translated.map((o: string, i: number) => <Text key={i}>{o}</Text>)}</Text>;
    }
    if (uppercase) {
        translated = translated.toUpperCase();
    }
    return <Text>{translated}</Text>;
}

function tNew<K extends keyof LocalizationStrings>(
    k: K,
    ...params: ParamsType<LocalizationStrings[K]>
) {
    const r = t(findPrefixedName(k), ...params) as any;
    if (r instanceof String || typeof r === 'string') return r;
    return React.createElement(T as any, { k, params: params[0] } as any);
}

export function tu<K extends keyof LocalizationStrings>(k: K) {
    const r = (t as any)(findPrefixedName(k));
    if (r.toUpperCase) return r.toUpperCase();
    return React.createElement(T as any, { k, uppercase: true });
}

export function tx<K extends keyof LocalizationStrings>(
    k: K,
    ...params: ParamsType<LocalizationStrings[K]>
) {
    return t(findPrefixedName(k), ...params);
}

export { tNew as t, ParamsType, LocalizationStrings };
