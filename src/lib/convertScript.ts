import OpenCC from 'opencc-js';

// create a converter between two scripts and return a function to convert some text
export function createConverter(from: string, to: string) {
    const converter = OpenCC.Converter({from: from, to: to});
    return (text: string) => converter(text);
}
