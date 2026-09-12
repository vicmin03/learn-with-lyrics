import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Switch from '@mui/material/Switch';
import { Lyrics } from '../Lyrics/Lyrics';
import { LyricsDict } from '../../types/lyrics';
import VocabInfo from '../VocabInfo/VocabInfo';
import { useSettings } from '../../contexts/useSettings';
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { fetchVideoId } from '../../lib/youtubeSearch';
import { MusicPlayer } from '../MusicPlayer/MusicPlayer';
import useYouTubePlayer from '../../hooks/useYoutubePlayer';
import { msToSeconds } from '../../lib/helperFunctions'
import { fetchLyricsWithFallback } from '../../lib/lyricsSearch';
import { supabase } from '../../lib/supabaseClient';
import { Song } from '../../types/song';
import './SongPage.css';


export default function SongPage() {
    const { song_id } = useParams<{ song_id: string }>();
    const [songInfo, setSongInfo] = useState<Song | null>(null);
    const [isSongLoading, setIsSongLoading] = useState(true);

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

    useEffect(() => {
        const getSongInfo = async() => {
            if (!song_id) {
                setIsSongLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("songs_with_artists")
                .select("*")
                .eq("song_id", song_id)
                .single();

            if (error) {
                console.error(error);
                setSongInfo(null);
                setIsSongLoading(false);
                return;
            }

            setSongInfo(data as Song);
            setIsSongLoading(false);
        } 
        getSongInfo();
    }, [song_id])
    

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
        let isCancelled = false;

        async function fetchURL() {
            if (!songInfo) {
                return;
            }

            try {
                const videoId = await fetchVideoId(songInfo.artist_eng_name, songInfo.orig_title);
                if (!isCancelled) {
                    setYtVideoId(videoId);
                }
            } catch (error) {
                console.error('Failed to fetch YouTube video', error);
            }
        }

        if (!songInfo?.yt_url) {
            fetchURL();
            // TODO: save newly fetched url to database for quicker retrieval next time
        }

        return () => {
            isCancelled = true;
        };
    }, [songInfo])

    // fetch lyrics from API on initial render
    useEffect(() => {
        if (!songInfo) {
            return;
        }

        const controller = new AbortController();

        const fetchLyrics = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            setSongLyrics([]);
            setHasTimestamps(false);

            try {
                const result = await fetchLyricsWithFallback({
                    title: songInfo.orig_title,
                    eng_title: songInfo.eng_title,
                    artist: songInfo.artist_name,
                    artist_eng: songInfo.artist_eng_name,
                }, controller.signal);
                setSongLyrics(result.lyrics);
                setHasTimestamps(result.hasTimestamps);
            } catch {
                if (!controller.signal.aborted) {
                    setErrorMessage('Unable to load lyrics right now.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchLyrics();

        return () => controller.abort();
    }, [songInfo]);

    if (isSongLoading) {
        return (
            <main>
                <p role="status" aria-live="polite">Loading song...</p>
            </main>
        );
    }

    if (!songInfo) {
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
                    <h1 id="song-heading" className="song-page-title" lang="zh">{songInfo.orig_title}</h1>
                    {songInfo.eng_title && <p className="song-page-alt-title" lang="en">({songInfo.eng_title})</p>}
                    <p className="song-page-artist">{songInfo.artist_eng_name}</p>
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
                            origScript={songInfo.orig_script} 
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
                    artist={songInfo.artist_eng_name}
                    img={songInfo.cover_url}
                    title={songInfo.orig_title}
                    ytVideoId={ytVideoId || songInfo.yt_url}
                    onPreviousLyric={handlePreviousLyric}
                    onNextLyric={handleNextLyric}
                    canSeekLyrics={hasTimestamps}
                />
            </div>

        </main>
    );
}