import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import song_list from './song_list.json';
import { Lyrics } from './components/Lyrics';
import { LyricsDict } from './types/lyrics';
import { useSettings } from './contexts/useSettings';
import { IoCheckmarkCircleOutline } from "react-icons/io5";


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

    const [songLyrics, setSongLyrics] = useState<LyricsDict[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasTimestamps, setHasTimestamps] = useState<boolean>(false);

    // read info about song based on id (to be fetched from database)
    const song_info = song_list.find((song) => song.id.toString() === song_id);

    // import settings for toggling pinyin and simplified/traditional character
    const {
        showPronunciation,
        setShowPronunciation,
        // simplifiedCharacters,
        // setSimplifiedCharacters,
    } = useSettings();

    const togglePronunciation = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowPronunciation(event.target.checked);
    }

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
                console.log(json.data);
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
        return <p>Song not found.</p>;
    }

    return (
        <>
            <div className="song-page-header">
                <div className="song-page-info">
                    <h1 className="song-page-title">{song_info.title}</h1>
                    {song_info.eng_title && <h1 className="song-page-title">({song_info.eng_title})</h1>}
                    <h4 className="song-page-artist">{song_info.artist}</h4>
                </div>

                <div className="settings-bar">
                    {hasTimestamps && <div className="icon-and-text">
                            <IoCheckmarkCircleOutline className="small-icon"/>
                            <p>Has timed lyrics</p>
                        </div>}
                    <span>Pinyin: Off</span>
                    <Switch 
                        aria-label="Toggle displaying pronunciation"
                        checked = {showPronunciation} 
                        onChange = {togglePronunciation} 
                    />
                    <span>On</span>
                </div>
            </div>




            {isLoading ? (
                <p>Loading lyrics...</p>
            ) : errorMessage ? (
                <p>{errorMessage}</p>
            ) : (
                <>
                    <Lyrics lyrics={songLyrics} showPronunciation={showPronunciation} />
                </>
            )}

              
        </>
    );
}