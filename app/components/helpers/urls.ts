import * as linkify from 'linkifyjs';

const allowedProtocols = ['HTTP://', 'HTTPS://', 'MAILTO:'];

export function isUrlAllowed(url: string): boolean {
    if (typeof url !== 'string') return false;
    const URL = url.toLocaleUpperCase().trim();
    for (let i = 0; i < allowedProtocols.length; i++) {
        if (URL.startsWith(allowedProtocols[i])) return true;
    }
    return false;
}

export function parseUrls(text) {
    const items = linkify.tokenize(text).map(token => {
        const text = token.toString();
        if (token.isLink) {
            const href = token.toHref();
            if (!isUrlAllowed(href)) return null;
            return {
                // we are going to keep the href equal to what was sent
                href: text,
                text,
                mailto: href.toLocaleUpperCase().startsWith('MAILTO:') && text
            };
        }
        return {
            text
        };
    });
    return items.filter(s => !!s);
}
