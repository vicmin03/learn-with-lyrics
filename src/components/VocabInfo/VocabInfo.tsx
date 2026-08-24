import './VocabInfo.css';
import { useState, useEffect } from 'react';
import cedict, { DictionaryEntry } from 'cc-cedict';
import { pinyin } from 'pinyin-pro';

interface VocabInfoProps {
    vocab: string
}

export default function VocabInfo ({vocab}: VocabInfoProps) {
    const [definition, setDefinition] = useState<string[]>([])

    function lookupWord(word: string) {
        // if returning null, might need to split further into individual charas
        // switch handling simplified/traditional to settings, so wouldnt need two lookup
        let info = cedict.getBySimplified(word, null, { asObject: false }) as DictionaryEntry[];

        if (info == null || info.length === 0) {
            info = cedict.getByTraditional(word, null, { asObject: false }) as DictionaryEntry[];
        }

        if (info != null && info.length > 0) {
            console.log(info);

            // Get the definitions from the first dictionary entry
            setDefinition(info[0].english);
        } else {
            setDefinition([]);
        }

    }

    // handles tokens that aren't dictionary words
    function isDictionaryWord(word: string): boolean {
        return lookup(word).length > 0;
    }


    useEffect(() => {
        lookupWord(vocab);
    }, [vocab])

    return (
        <div className="vocab-info-box">
            <p>{pinyin(vocab)}</p>
            <h3>{vocab}</h3>
            {definition.length > 0 ? (
                <ul>
                    {definition.map((def, index) => (
                        <li key={index}>{def}</li>
                    ))}
                </ul>
            ) : (
                <p>No definition found.</p>
            )}

        </div>
    )
}