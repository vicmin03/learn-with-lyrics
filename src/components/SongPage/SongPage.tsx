import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import song_list from '../../song_list.json';
import { Lyrics } from '../Lyrics/Lyrics';
import { LyricsDict } from '../../types/lyrics';
import VocabInfo from '../VocabInfo/VocabInfo';
import { useSettings } from '../../contexts/useSettings';
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { fetchVideoId } from '../../lib/youtubeSearch';
import { MusicPlayer } from '../MusicPlayer/MusicPlayer';
import useYouTubePlayer from '../../hooks/useYoutubePlayer';
import { msToSeconds, splitLyrics, formatName } from '../../lib/helperFunctions'
import './SongPage.css';


const API_URL = 'https://wilooper-lyrica.hf.space/lyrics/';

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

    const youtube = useYouTubePlayer();

    // to close vocab pop up box
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
            // TODO: save newly fetched url to database for quicker retrieval next time
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
                    console.log(lyric_lines);
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

    // calculate which line of song is currently being player in song
    function findActiveLyricIndex(lyrics: LyricsDict[], currentTime: number) {
        let low = 0;
        let high = lyrics.length - 1;
        let activeIndex = -1;

        while (low <= high) {
            const middle = Math.floor((low + high) / 2);
            const lyricStart = msToSeconds(lyrics[middle].start_time);

            if (lyricStart <= currentTime) {
                activeIndex = middle;
                low = middle + 1;
            } else {
                high = middle - 1;
            }
        }
        return activeIndex;
    }

    // find which line is currently being played
    const activeIndex = hasTimestamps
        ? findActiveLyricIndex(songLyrics, youtube.currentTime)
        : -1;

    // seek to previous lyric with music player OR beginning of current line if part-way through
    function handlePreviousLyric() {
        if (!hasTimestamps || activeIndex < 0) return;

        const currentIndex = activeIndex;
        const currentLyricTime = msToSeconds(songLyrics[currentIndex]?.start_time ?? 0);
        const isNearStart = youtube.currentTime - currentLyricTime < 2;
        const targetIndex = isNearStart
            ? Math.max(0, currentIndex - 1)
            : currentIndex;
        
        youtube.seek(msToSeconds(songLyrics[targetIndex].start_time))
    }

    // seek to next lyric with music player
    function handleNextLyric() {
        if (!hasTimestamps) return;

        const nextIndex = Math.min(songLyrics.length, activeIndex + 1);
        if (!songLyrics[nextIndex]) return;

        youtube.seek(msToSeconds(songLyrics[nextIndex].start_time))
    }

    return (
        <main>
            <header className="song-page-header" aria-labelledby="song-heading">

                <div className="song-page-info">
                    <h1 id="song-heading" className="song-page-title" lang="zh">{song_info.title}</h1>
                    {song_info.eng_title && <p className="song-page-alt-title" lang="en">({song_info.eng_title})</p>}
                    <p className="song-page-artist">{song_info.artist}</p>
                </div>

                <fieldset className="settings-bar">
                    <legend className="visually-hidden">Lyrics settings</legend>
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
                    
                    <span id="script-label">Script</span>
                    <Switch 
                        aria-labelledby="script-label script-state"
                        checked = {simplifiedCharacters} 
                        onChange = {toggleSimplified} 
                    />
                    <span id="script-state">{simplifiedCharacters ? 'Simplified' : 'Traditional'}</span>
                </fieldset>
            </header>

            <section className="song-page-main" aria-labelledby="lyrics-heading">
                <h2 id="lyrics-heading" className="visually-hidden">Lyrics</h2>
                {isLoading ? (
                    <p role="status" aria-live="polite">Loading lyrics...</p>
                ) : errorMessage ? (
                    <p role="alert">{errorMessage}</p>
                ) : songLyrics.length === 0 ? (
                    <p role="status" aria-live="polite">Lyrics are not available for this song.</p>
                ) : (
                    <>
                        <Lyrics 
                            activeIndex={activeIndex}
                            lyrics={songLyrics} 
                            showPronunciation={showPronunciation} 
                            simplifiedCharacters={simplifiedCharacters} 
                            origScript={song_info.orig_script} 
                            onLookup={handleLookup} />
                    </>
                )}

                {vocabWord && (
                    <VocabInfo
                        key={vocabWord}
                        vocab={vocabWord}
                        onClose={closeVocabInfo}
                    />
                )}

            </section>

            <div>
                <MusicPlayer 
                    player={youtube} 
                    artist={song_info.artist} 
                    img={song_info.img} 
                    title={song_info.title} 
                    ytVideoId={ytVideoId || song_info.yt_url}
                    onPreviousLyric={handlePreviousLyric}
                    onNextLyric={handleNextLyric}
                    canSeekLyrics={hasTimestamps}
                />
            </div>

        </main>
    );
}