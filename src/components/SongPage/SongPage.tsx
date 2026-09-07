import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import song_list from '../../song_list.json';
import { Lyrics } from '../Lyrics';
import { LyricsDict } from '../../types/lyrics';
import VocabInfo from '../VocabInfo/VocabInfo';
import { useSettings } from '../../contexts/useSettings';
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import useYouTubePlayer from '../../hooks/useYoutubePlayer';
import { fetchVideoId } from '../../lib/youtubeSearch';
import { MusicPlayer } from '../MusicPlayer/MusicPlayer';
import './SongPage.css';

const API_URL = 'https://wilooper-lyrica.hf.space/lyrics/';

// add %20 between spaces in song title/artist for API calls.
function formatName(name: string): string {
    return name.split(' ').join('%20');
}
// convert timestamp string to milliseconds
function timestampToMs(timestamp: string): number {
    const [minutes, seconds] = timestamp.split(':');
    const [wholeSeconds, milliseconds] = seconds.split('.');

    return (
        Number(minutes) * 60_000 +
        Number(wholeSeconds) * 1_000 +
        Number(milliseconds) * 10
    );
}

// split line into timestamp and lyrics dictionary
function splitLine(line: string, index: number): LyricsDict {
    // check for timestamp at beginning of line
    const match = line.match(/^\[(\d{2}:\d{2}\.\d{2})\]\s*(.*)$/);

    if (!match) {
        return {
            id: `lrc_${index}`,
            start_time: 0,
            text: line
        };
    }

    const [, timestamp, lyric] = match;
    return {"id":`lrc_${index}`, 
            "start_time": timestampToMs(timestamp), 
            "text": lyric};
}

// split lyrics into lines 
function splitLyrics(lyrics: string, hasTimestamps: boolean): LyricsDict[] {
    const lines = lyrics.split('\n');
    if (hasTimestamps) {
        return lines.map(splitLine);   
    }
    return lines.map((lyric, index) => ({
        id: `lrc_${index}`,
        start_time: 0,
        text: lyric
    }));
}

export default function SongPage() {
    const { song_id } = useParams<{ song_id: string }>();

    // manage state for loading song lyrics
    const [songLyrics, setSongLyrics] = useState<LyricsDict[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasTimestamps, setHasTimestamps] = useState<boolean>(false);

    // manages vocab word that user clicks
    const [vocabWord, setVocabWord] = useState("");
    const lookupTriggerRef = useRef<HTMLElement | null>(null);

    // manages state for music player
    const [ytVideoId, setYtVideoId] = useState("");

    // read info about song based on id (to be fetched from database)
    const song_info = song_list.find((song) => song.id.toString() === song_id);

    // import settings for toggling pinyin and simplified/traditional character
    const {
        showPronunciation,
        setShowPronunciation,
        simplifiedCharacters,
        setSimplifiedCharacters,
    } = useSettings();

    const closeVocabInfo = useCallback(() => {
        setVocabWord("");
        lookupTriggerRef.current?.focus();
    }, []);

    // to toggle showing pronunciation above song lyrics
    const togglePronunciation = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowPronunciation(event.target.checked);
    }

    // to toggle showing lyrics in simplified or traditional script
    const toggleSimplified = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSimplifiedCharacters(event.target.checked);
    }

    // fetch youtube url to display video embed on initial render
    useEffect( () => {
        async function fetchURL() {
            if (!song_info) {
                return;
            }

            try {
                const videoId = await fetchVideoId(song_info.artist, song_info.title);
                setYtVideoId(videoId);
            } catch (error) {
                console.error('Failed to fetch YouTube video', error);
            }
        }

        if (!song_info?.yt_url) {
            fetchURL();
            // save newly fetched url to database for quicker retrieval next time
        }
    }, [song_info])

    // fetch lyrics from API on initial render
    useEffect(() => {
        if (!song_info) {
            return;
        }

        let isCancelled = false;

        const fetchLyrics = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const url = `${API_URL}?artist=${formatName(song_info.artist)}&song=${formatName(song_info.title)}&timestamps=true&fast=true`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const json = await response.json();
                console.log(json)
                const hasTimestamp = Boolean(json.data.hasTimestamps);

                // store lyrics as array of lyrics dictionaries
                let lyric_lines: LyricsDict[];

                if (hasTimestamp && Array.isArray(json?.data?.timed_lyrics)) {
                    lyric_lines = json.data.timed_lyrics;
                }
                else {
                    const lyrics = typeof json?.data?.lyrics === 'string' ? json.data.lyrics : '';
                    // need to split lyric string into separate lines
                    lyric_lines = splitLyrics(lyrics, hasTimestamp);
                }
                
                if (!isCancelled) {
                    setSongLyrics(lyric_lines);
                    setHasTimestamps(hasTimestamp);
                }
            } catch (error) {
                console.error('Failed to fetch lyrics', error);

                if (!isCancelled) {
                    setErrorMessage('Unable to load lyrics right now.');
                    setSongLyrics([]);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchLyrics();

        // defines the cleanup function to be run on unmounting/rerendering based on dependencies changing
        // isCancelled flag ensures that outdated results of a fetch aren't displayed if component/song changes
        return () => {
            isCancelled = true;
        };
    }, [song_info]);

    if (!song_info) {
        return (
            <main>
                <h1>Song not found.</h1>
                <p>The requested song could not be found.</p>
            </main>
        );
    }

    // keep track of which word was selected for lookup
    const handleLookup = (word: string, trigger: HTMLElement) => {
        lookupTriggerRef.current = trigger;
        setVocabWord(word);
    };

    return (
        <main>
            <div className="song-page-header">

                <div className="song-page-info">
                    <h1 className="song-page-title" lang="zh">{song_info.title}</h1>
                    {song_info.eng_title && <p className="song-page-alt-title" lang="en">({song_info.eng_title})</p>}
                    <p className="song-page-artist">{song_info.artist}</p>
                </div>

                <div className="settings-bar">
                    {hasTimestamps && <div className="icon-and-text">
                            <IoCheckmarkCircleOutline className="small-icon" aria-hidden="true"/>
                            <p>Has timed lyrics</p>
                        </div>}
                    <span id="pronunciation-label">Show pronunciation</span>
                    <Switch 
                        aria-labelledby="pronunciation-label pronunciation-state"
                        checked = {showPronunciation} 
                        onChange = {togglePronunciation} 
                    />

                    <span id="pronunciation-state">{showPronunciation ? 'On' : 'Off'}</span>
                    
                    <span id="pronunciation-label">Script</span>
                    <Switch 
                        aria-labelledby="script-label script-state"
                        checked = {simplifiedCharacters} 
                        onChange = {toggleSimplified} 
                    />
                    <span id="pronunciation-state">{simplifiedCharacters ? 'Simplified' : 'Traditional'}</span>
                </div>
            </div>



            <div className="song-page-main">
                {isLoading ? (
                    <p role="status" aria-live="polite">Loading lyrics...</p>
                ) : errorMessage ? (
                    <p role="alert">{errorMessage}</p>
                ) : songLyrics.length === 0 ? (
                    <p role="status" aria-live="polite">Lyrics are not available for this song.</p>
                ) : (
                    <>
                        <Lyrics lyrics={songLyrics} showPronunciation={showPronunciation} simplifiedCharacters={simplifiedCharacters} origScript={song_info.orig_script} onLookup={handleLookup} />
                    </>
                )}

                {vocabWord && (
                    <VocabInfo
                        key={vocabWord}
                        vocab={vocabWord}
                        onClose={closeVocabInfo}
                    />
                )}

            </div>

            <div>
                <MusicPlayer artist={song_info.artist} img={song_info.img} title={song_info.title} ytVideoId={ytVideoId || song_info.yt_url}/>
            </div>

        </main>
    );
}