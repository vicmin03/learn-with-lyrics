import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { ChineseToken, tokenizeChinese } from "../lib/chineseTokenizer";
import { LyricsDict } from "../types/lyrics";



export interface TokenizedLyric extends LyricsDict{
    tokens: ChineseToken[]
}

interface LyricsProps {
    lyrics: LyricsDict[]
    onLookup?: (word: string) => void
}

function isWhitespace(token: ChineseToken) {
    return /^\s+$/.test(token.word);
}

export function Lyrics({ lyrics, onLookup }: LyricsProps) {
    const [tokenizedLyrics, setTokenizedLyrics] = useState<TokenizedLyric[]>([]);

    function handleLookup(word: string) {
        // TODO: look up word in dictionary, show pop up 
        if (typeof onLookup === 'function') {
            onLookup(word);
        } else {
            // if lookup function not supplied
            console.log(word);
        }
    }

    // triggered on change of lyrics prop to component
    useEffect(() => {
        // tokenize each line of the lyrics, preserving timestamps
        async function tokenizeLyrics() {
            const result = await Promise.all(
                lyrics.map(async (line) => ({
                    ...line, 
                    tokens: await tokenizeChinese(line.text),
                }))
            );

            setTokenizedLyrics(result);
        }
        tokenizeLyrics();
    }, [lyrics]);


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
                                className="lyrics-token"
                                onClick={() => handleLookup(token.word)}>
                                {token.word}
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

