import init, { tokenize } from "jieba-wasm";

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
export async function tokenizeChinese(text: string): Promise<ChineseToken[]> {
    await ensureInitialized();

    return tokenize(text, "default", true) as ChineseToken[];
}

