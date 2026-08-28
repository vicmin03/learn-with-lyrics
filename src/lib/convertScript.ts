import OpenCC from 'opencc-js';


export const languageCodes: Record<string, string> = {
    Chinese: 'zh',
    English: 'en',
    Japanese: 'ja',
    Korean: 'ko',
};

export const scripts: Record<'cn' | 'tw' | 'hk', string> = {
    'cn': 'Simplified',
    'tw': 'Traditional (Taiwan)',
    'hk': 'Traditional (Hong Kong)'
}

export function createConverter(from: string, to: string) {
    const converter = OpenCC.Converter({from: from, to: to});
    return (text: string) => converter(text);
}

export function convert(text: string, from: string, to: string): string{
    const converter = OpenCC.Converter({from: from, to: to});
    return converter(text);
}