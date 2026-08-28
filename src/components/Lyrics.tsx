import { useEffect, useState, useRef } from "react";
import { pinyin } from "pinyin-pro";
import { ChineseToken, tokenizeChinese } from "../lib/chineseTokenizer";
import { LyricsDict } from "../types/lyrics";
import { convert } from "../lib/convertScript";


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
    const [currentScript, setCurrentScript] = useState<string>(origScript);

    // store converted (cn/tw) lyrics for quick reloading
    let convertedLyricsRef = useRef<LyricsDict[] | null>(null);

    // the target script to convert between (simplified and corresponding traditional) 
    let targetScript = origScript==='cn' ? 'tw' : 'cn'

    function handleLookup(word: string, trigger: HTMLElement) {
        onLookup(word, trigger);
    }

    // triggered on change of lyrics prop to component
    useEffect(() => {

        setCurrentScript(simplifiedCharacters ? 'cn' : (origScript==='cn' ? 'tw' : origScript))

        const needsConversion =
            (simplifiedCharacters && origScript !== "cn") ||
            (!simplifiedCharacters && origScript === "cn");


        // if haven't converted lyrics script before, then convert and save with useRef so it persists        
        if (needsConversion && convertedLyricsRef.current === null) {
            convertedLyricsRef.current = lyrics.map((line) => ({
                ...line, 
                text: convert(line.text, origScript, targetScript)
            }))        
        }

        const lyricsToTokenize = needsConversion
            ? convertedLyricsRef.current ?? lyrics
            : lyrics;

        // tokenize each line of the lyrics, preserving timestamps
        async function tokenizeLyrics() {
            const result = await Promise.all(
                lyricsToTokenize.map(async (line) => ({
                    ...line, 
                    tokens: await tokenizeChinese(line.text),
                }))
            );

            setTokenizedLyrics(result);
        }
        tokenizeLyrics();
    }, [lyrics, simplifiedCharacters, origScript]);

    return (
        <div>
            {tokenizedLyrics.map((line) => (
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

