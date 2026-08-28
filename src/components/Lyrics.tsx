import { useEffect, useState, useRef, useMemo } from "react";
import { pinyin } from "pinyin-pro";
import { ChineseToken, tokenizeChinese } from "../lib/chineseTokenizer";
import { LyricsDict } from "../types/lyrics";
import { convert, createConverter } from "../lib/convertScript";


export interface TokenizedLyric extends LyricsDict{
    tokens: ChineseToken[]
}

interface LyricsProps {
    lyrics: LyricsDict[],
    showPronunciation: boolean,
    simplifiedCharacters: boolean,
    origScript: string,
    onLookup: (word: string, trigger: HTMLElement) => void
}

function isWhitespace(token: ChineseToken) {
    return /^\s+$/.test(token.word);
}

export function Lyrics({ lyrics, showPronunciation, simplifiedCharacters, origScript, onLookup }: LyricsProps) {
    const [tokenizedLyrics, setTokenizedLyrics] = useState<TokenizedLyric[]>([]);

    const currentScript = simplifiedCharacters ? 'cn' : (origScript==='cn' ? 'tw' : origScript)
  
    // store converted (cn/tw) lyrics for quick reloading
    let convertedLyricsRef = useRef<LyricsDict[] | null>(null);

    // always use simplified lyrics for tokenization
    const simplifiedLyrics = useMemo(() => {
        const toSimplified = origScript === "cn"
            ? (text: string) => text
            : createConverter(origScript, "cn");

        return lyrics.map((line) => ({
            ...line,
            text: toSimplified(line.text)
        }));
    }, [lyrics, origScript])

    // the target script to convert between (simplified and corresponding traditional) 
    let targetScript = origScript==='cn' ? 'tw' : 'cn'

    // for handling looking up vocabulary
    function handleLookup(word: string, trigger: HTMLElement) {
        onLookup(word, trigger);
    }

    // triggered on change of lyrics prop to component
    useEffect(() => {

        let cancelled = false;

        // tokenize each line of the simplified lyrics, preserving timestamps
        async function tokenizeLyrics() {
            const result = await Promise.all(
                simplifiedLyrics.map(async (line) => ({
                    ...line, 
                    tokens: await tokenizeChinese(line.text),
                }))
            );

            if (!cancelled) {
                setTokenizedLyrics(result);
            }
        }
        tokenizeLyrics();

        // clean up function
        return () => {
            cancelled = true;
        };
    }, [lyrics, origScript]);

    const traditionalConverter = useMemo(
        () => createConverter("cn", "tw"),
        []
    );

    // control which tokens/script to display in lyrics
    const displayTokens = useMemo(() => {
        if (simplifiedCharacters) {
            return tokenizedLyrics;
        }
        // to display traditional lyrics matching tokens
        return tokenizedLyrics.map((line) => ({
            ...line,
            tokens: line.tokens.map((token) => ({
                ...token,
                word: traditionalConverter(token.word)
            }))
        }))
    }, [tokenizedLyrics, simplifiedCharacters])

    return (
        <div>
            {displayTokens.map((line) => (
                <p key={line.id} className="song-lyrics">
                    {line.tokens.map((token) => {
                        if (isWhitespace(token)) {
                            return token.word;
                        }

                        return (
                            <span
                                key={`${line.id}-${token.start}`}
                                className="lyrics-token-container"
                            >
                                {showPronunciation && <span className="pronunciation-text" lang="zh-Latn">
                                    {pinyin(token.word)}
                                </span>}
                                <button
                                    type="button"
                                    className="lyrics-token"
                                    lang="zh"
                                    onClick={(event) => handleLookup(token.word, event.currentTarget)}>
                                    {token.word}                                
                                </button>
                            </span>
                            )   
                        }
                    )}
                </p>
            ))
            }
        </div>
        
    );
}

