import { useEffect, useState, useRef, useMemo } from "react";
import { pinyin } from "pinyin-pro";
import { ScriptToken, tokenizeChinese } from "../lib/chineseTokenizer";
import { LyricsDict } from "../types/lyrics";
import { createConverter } from "../lib/convertScript";


export interface TokenizedLyric extends LyricsDict{
    tokens: ScriptToken []
}

interface LyricsProps {
    lyrics: LyricsDict[],
    showPronunciation: boolean,
    simplifiedCharacters: boolean,
    origScript: string,
    onLookup: (word: string, trigger: HTMLElement) => void
}

function isWhitespace(token: ScriptToken) {
    return /^\s+$/.test(token.simplified);
}

export function Lyrics({ lyrics, showPronunciation, simplifiedCharacters, origScript, onLookup }: LyricsProps) {
    const [tokenizedLyrics, setTokenizedLyrics] = useState<TokenizedLyric[]>([]);

    // for handling looking up vocabulary
    function handleLookup(word: string, trigger: HTMLElement) {
        onLookup(word, trigger);
    }

    // set up lyrics for toggling pronunciation and script
    // convert between simplified and traditional and prepare pinyin into token for quick conversion
    useEffect(() => {
        let cancelled = false;

        async function prepareLyrics() {
            // create converters 
            const toSimplified =
                origScript === "cn"
                    ? (text: string) => text
                    : createConverter(origScript, "cn");

            const toTraditional = createConverter("cn", "tw");

            const result = await Promise.all(
                lyrics.map(async (originalLine) => {
                    // convert to simplified for better tokenization
                    const simplifiedText = toSimplified(originalLine.text);

                    // convert the complete line once, rather than each token
                    const traditionalText =
                        origScript === "tw" || "hk"
                            ? originalLine.text
                            : toTraditional(simplifiedText);

                    const baseTokens = await tokenizeChinese(simplifiedText);

                    // construct token with all info needed
                    const tokens = baseTokens.map((token) => ({
                        start: token.start,
                        end: token.end,
                        simplified: token.word,
                        traditional: traditionalText.slice(token.start, token.end),
                        pinyin: pinyin(token.word),
                    }));

                    return {
                        ...originalLine,
                        tokens,
                    };
                })
            );

            if (!cancelled) {
                setTokenizedLyrics(result);
            }
        }

        prepareLyrics();

        return () => {
            cancelled = true;
        };
    }, [lyrics, origScript]);

    return (
        <div>
            {tokenizedLyrics.map((line) => (
                <p key={line.id} className="song-lyrics">
                    {line.tokens.map((token) => {
                        if (isWhitespace(token)) {
                            return " ";
                        }

                        const displayedWord = simplifiedCharacters
                            ? token.simplified
                            : token.traditional;

                        return (
                            <span
                                key={`${line.id}-${token.start}`}
                                className="lyrics-token-container"
                            >
                                {showPronunciation && <span className="pronunciation-text" lang="zh-Latn">
                                    {token.pinyin}
                                </span>}
                                <button
                                    type="button"
                                    className="lyrics-token"
                                    lang="zh"
                                    onClick={(event) => handleLookup(displayedWord, event.currentTarget)}>
                                    {displayedWord}                                
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

