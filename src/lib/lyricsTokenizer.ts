// function to tokenize lyrics
export async function tokenizeLyrics(text: string) {
    const { tokenizeChinese } = await import("./chineseTokenizer")

    return tokenizeChinese(text);
}


