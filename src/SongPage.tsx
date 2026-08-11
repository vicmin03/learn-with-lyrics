import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import song_list from './song_list.json';

const API_URL = 'https://wilooper-lyrica.hf.space/lyrics/';

// add %20 between spaces in song title/artist for API calls.
function formatName(name: string): string {
    return name.split(' ').join('%20');
}

interface LyricsDict {
    timestamp: string,
    lyric: string
}

export default function SongPage() {
    const { song_id } = useParams<{ song_id: string }>();

    const [songLyrics, setSongLyrics] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // read info about song based on id (to be fetched from database)
    const song_info = song_list.find((song) => song.id.toString() === song_id);

    // split line into timestamp and lyrics dictionary
    function splitLine(line: string): LyricsDict {
        let [timestamp, lyric] = line.split(" ");
        return {"timestamp": timestamp, "lyric": lyric};
    }

    // split lyrics into lines 
    function splitLyrics(lyrics: string): LyricsDict[] {
        let lines = lyrics.split('\n');
        return lines.map(splitLine);   
    }

    useEffect(() => {
        if (!song_info) {
            setIsLoading(false);
            setErrorMessage('Song not found.');
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
                const lyrics = typeof json?.data?.lyrics === 'string' ? json.data.lyrics : '';
                console.log(lyrics)
                if (!isCancelled) {
                    setSongLyrics(lyrics);
                }
            } catch (error) {
                console.error('Failed to fetch lyrics', error);

                if (!isCancelled) {
                    setErrorMessage('Unable to load lyrics right now.');
                    setSongLyrics('');
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
    }, [song_id, song_info?.artist, song_info?.title]);

    if (!song_info) {
        return <p>Song not found.</p>;
    }

    // split lyrics into separate lines
    const lyric_lines = splitLyrics(songLyrics);

    return (
        <>
            <h1>{song_info.title}</h1>
            {song_info.eng_title && <h1>({song_info.eng_title})</h1>}
            <h4>{song_info.artist}</h4>

            {isLoading ? (
                <p>Loading lyrics...</p>
            ) : errorMessage ? (
                <p>{errorMessage}</p>
            ) : (
                <>
                    {lyric_lines.map((line, index) => (
                        <p key={index}>{line.lyric}</p>
                    ))
                    } 
                </>
            )}

              
        </>
    );
}