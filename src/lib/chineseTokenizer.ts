import init, { tokenize } from "jieba-wasm";
import { addCustomPinyin } from "./customPinyin";
import cedict from 'cc-cedict';

let initialized = false;
let initializationPromise: Promise<void> | null = null;

// initialise the WebAssembly jieba module only once 
async function ensureInitialized() {
    if (initialized) {
        return;
    }

    if (!initializationPromise) {
        initializationPromise = init().then(() => {
            initialized = true;
        });

        addCustomPinyin();
    }

    await initializationPromise;
}

// format of tokens (word/s, start character, end character)
export type ChineseToken = {
    word: string;
    start: number;
    end: number;
};

// function to split text into tokens
// export async function tokenizeChinese(text: string): Promise<ChineseToken[]> {
//     await ensureInitialized();

//     return tokenize(text, "default", true) as ChineseToken[];
// }

export async function tokenizeChinese(text: string): Promise<ChineseToken[]> {
    const tokens = await initialiseTokens(text);
    return refineTokens(tokens);
}

function lookupWord(word: string) {
    return (
        cedict.getBySimplified(word) ??
        cedict.getByTraditional(word)
    );
}

// split a token into dictionary-searchable smaller components with a dynamic programming longest first approach; 
// if the entire token cannot be matched, return entire token as is
function splitCharacters(token: ChineseToken): ChineseToken[] {
    const word = token.word;
    const n = word.length;

    const dp: (ChineseToken[] | null)[] =
        new Array(n + 1).fill(null);

    dp[0] = [];

    for (let i = 0; i < n; i++) {
        const previousTokens = dp[i];

        if (previousTokens === null) {
            continue;
        }

        // check longest matches first
        for (let j = n; j > i; j--) {
            const substring = word.slice(i, j);

            if (!lookupWord(substring)) {
                continue;
            }

            const candidate: ChineseToken = {
                word: substring,
                start: token.start + i,
                end: token.start + j,
            };

            if (dp[j] === null) {
                dp[j] = [
                    ...previousTokens,
                    candidate,
                ];
            }
        }
    }

    // couldn't completely cover the original token
    // keep jieba's original segmentation
    return dp[n] ?? [token];
}

// refine tokens according to words found in dictionary
function refineTokens(tokens: ChineseToken[]): ChineseToken[] {
    const refinedTokens: ChineseToken[] = [];

    for (const token of tokens) {
        // Already a dictionary word
        if (lookupWord(token.word)) {
            refinedTokens.push(token);
            continue;
        }

        // Try to find dictionary-based subwords
        const refined = splitCharacters(token);

        refinedTokens.push(...refined);
    }

    return refinedTokens;
}

async function initialiseTokens(text: string): Promise<ChineseToken[]> {
    await ensureInitialized();

    return tokenize(text, "default", true) as ChineseToken[];
}
