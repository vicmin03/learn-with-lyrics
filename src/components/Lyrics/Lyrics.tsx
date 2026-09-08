import { useEffect, useState, useRef } from "react";
import { pinyin } from "pinyin-pro";
import { ScriptToken, tokenizeChinese } from "../../lib/chineseTokenizer";
import { LyricsDict } from "../../types/lyrics";
import { createConverter } from "../../lib/convertScript";
import "./Lyrics.css"


export interface TokenizedLyric extends LyricsDict{
    tokens: ScriptToken []
}

interface LyricsProps {
    activeIndex: number,
    lyrics: LyricsDict[],
    showPronunciation: boolean,
    simplifiedCharacters: boolean,
    origScript: string,
    onLookup: (word: string, trigger: HTMLElement) => void
}

function isWhitespace(token: ScriptToken) {
    return /^\s+$/.test(token.simplified);
}

// // convert milliseconds to seconds for easier comparison with currentTime
// function msToSeconds(timestamp: number) {
//     return timestamp / 1000;
// }

// function findActiveLyricIndex(lyrics: LyricsDict[], currentTime: number) {
//     let low = 0;
//     let high = lyrics.length - 1;
//     let activeIndex = -1;

//     while (low <= high) {
//         const middle = Math.floor((low + high) / 2);
//         const lyricStart = msToSeconds(lyrics[middle].start_time);

//         if (lyricStart <= currentTime) {
//             activeIndex = middle;
//             low = middle + 1;
//         } else {
//             high = middle - 1;
//         }
//     }

//     return activeIndex;
// }


export function Lyrics({ activeIndex, lyrics, showPronunciation, simplifiedCharacters, origScript, onLookup }: LyricsProps) {
    const [tokenizedLyrics, setTokenizedLyrics] = useState<TokenizedLyric[]>([]);

    const refContainer = useRef<HTMLParagraphElement | null>(null);

    // for handling looking up vocabulary
    function handleLookup(word: string, trigger: HTMLElement) {
        onLookup(word, trigger);
    }

    // // find which line is currently being played
    // const activeIndex = findActiveLyricIndex(lyrics, currentTime);

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
                        origScript === "tw" || origScript === "hk"
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

    // scroll to current lyric whenever activeIndex (line) changes
    useEffect(() => {
        refContainer.current?.scrollIntoView?.({
            behavior: "smooth",
            block: "center"
        });
    }, [activeIndex, tokenizedLyrics.length]);

    return (
        <div>
            {tokenizedLyrics.map((line, index) => (
                <p
                    key={line.id}
                    className="song-lyrics"
                    ref={index === activeIndex ? refContainer : null}
                >
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
                                    className={index <= activeIndex ? "lyrics-token active" : "lyrics-token"}
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

