import OpenCC from 'opencc-js';


export const scripts: Record<'cn' | 'tw' | 'hk', string> = {
    'cn': 'Simplified',
    'tw': 'Traditional (Taiwan)',
    'hk': 'Traditional (Hong Kong)'
}

// create a converter between two scripts and return a function to convert some text
export function createConverter(from: string, to: string) {
    const converter = OpenCC.Converter({from: from, to: to});
    return (text: string) => converter(text);
}
