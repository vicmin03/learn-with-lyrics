import './VocabInfo.css';
import '../../App.css';
import { useEffect, useRef, useState } from 'react';
import { IconButton, Button, Link } from '@mui/material';
import { IoClose } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import cedict, { DictionaryEntry } from 'cc-cedict';
import { pinyin } from 'pinyin-pro';


const DICT_URL = "https://dictionary.writtenchinese.com/"

interface VocabInfoProps {
    vocab: string
    onClose: () => void
}

export default function VocabInfo ({vocab, onClose}: VocabInfoProps) {
    const [addedVocab, setAddedVocab] = useState<string | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCloseRef.current();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    function lookupWord(word: string): string[] {
        // if returning null, might need to split further into individual charas
        // switch handling simplified/traditional to settings, so wouldnt need two lookup
        let info = cedict.getBySimplified(word, null, { asObject: false }) as DictionaryEntry[];

        if (info == null || info.length === 0) {
            info = cedict.getByTraditional(word, null, { asObject: false }) as DictionaryEntry[];
        }

        if (info != null && info.length > 0) {
            console.log(info);

            // Get the definitions from the first dictionary entry
            return info[0].english;
        } else {
            return [];
        }

    }

    const definition = lookupWord(vocab);

    // close the vocab info box
    const closeInfo = () => {
        onClose();
    }

    const addToDeck = () => {
        // should add vocab word to (a) flashcard deck
        setAddedVocab(vocab)
    }

    const addToDeckText = addedVocab === vocab ? "Word added to deck" : "Add To Deck";

    return (
        <aside className="vocab-info-box" aria-labelledby="vocab-panel-heading">
            <IconButton aria-label="close" 
                className="close-button"
                onClick={closeInfo}
                ref={closeButtonRef}>
            <IoClose aria-hidden="true" />
            </IconButton>

            <Link href={`${DICT_URL}/#sk=${vocab}&svt=pinyin`} 
                underline="hover"
                target="_blank"
                className="dict-link"
                aria-label="Link to external Chinese Dictionary site 'Written Chinese">
                <IoIosLink aria-hidden="true" /> WC Dict
            </Link>

            <p className="vocab-pronunciation">{pinyin(vocab)}</p>
            <h2 id="vocab-panel-heading" className="vocab-word" lang="zh">{vocab}</h2>

            {definition.length > 0 ? (
                <ul>
                    {definition.map((def, index) => (
                        <li className="vocab-definition" key={index}>{def}</li>
                    ))}
                </ul>
            ) : (
                <p>No definition found.</p>
            )}

            <Button className="add-to-deck-button"
                onClick={addToDeck}>
                {addToDeckText}
            </Button>

        </aside>
    )
}