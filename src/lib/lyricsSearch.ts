import { LyricsDict } from '../types/lyrics';
import { splitLyrics } from './helperFunctions';

const API_URL = 'https://wilooper-lyrica.hf.space/lyrics/';
const REQUEST_TIMEOUT_MS = 10_000;

export interface SongMetadata {
    title: string;
    eng_title?: string;
    artist: string;
    artist_eng?: string;
}

export interface LyricsResult {
    lyrics: LyricsDict[];
    hasTimestamps: boolean;
}

interface LyricsApiData {
    hasTimestamps?: boolean;
    timed_lyrics?: LyricsDict[];
    lyrics?: string;
}

// for removing lines of artist credits from song lyrics
function isCreditLine(line: LyricsDict): boolean {
    return /[:：]/.test(line.text);
}

export function removeBoundaryCreditLines(lyrics: LyricsDict[]): LyricsDict[] {
    let firstLyricIndex = 0;
    let lastLyricIndex = lyrics.length - 1;

    while (firstLyricIndex <= lastLyricIndex && isCreditLine(lyrics[firstLyricIndex])) {
        firstLyricIndex += 1;
    }

    while (lastLyricIndex >= firstLyricIndex && isCreditLine(lyrics[lastLyricIndex])) {
        lastLyricIndex -= 1;
    }

    return lyrics.slice(firstLyricIndex, lastLyricIndex + 1);
}

// consider searching songs based on title/artist in both original language and english in case search fails
export function buildLyricQueries(song: SongMetadata): [string, string][] {
    const combinations: [string | undefined, string | undefined][] = [
        [song.title, song.artist],
        [song.title, song.artist_eng],
        [song.eng_title, song.artist],
        [song.eng_title, song.artist_eng],
    ];
    const seen = new Set<string>();

    return combinations.filter((combination): combination is [string, string] => {
        const [title, artist] = combination;
        if (!title?.trim() || !artist?.trim()) return false;

        const key = `${title.trim().toLocaleLowerCase()}\0${artist.trim().toLocaleLowerCase()}`;
        if (seen.has(key)) return false;

        seen.add(key);
        return true;
    });
}

function hasLyrics(data: unknown): data is LyricsApiData {
    if (!data || typeof data !== 'object') return false;

    const lyricsData = data as LyricsApiData;
    return (
        (Array.isArray(lyricsData.timed_lyrics) && lyricsData.timed_lyrics.length > 0) ||
        (typeof lyricsData.lyrics === 'string' && lyricsData.lyrics.trim().length > 0)
    );
}

function toLyricsResult(data: LyricsApiData): LyricsResult {
    const hasTimedLyrics = Boolean(data.timed_lyrics?.length);
    const lyrics = hasTimedLyrics
        ? data.timed_lyrics ?? []
        : splitLyrics(data.lyrics ?? '', false);

    return {
        lyrics: removeBoundaryCreditLines(lyrics),
        hasTimestamps: Boolean(data.hasTimestamps && hasTimedLyrics),
    };
}

export async function fetchLyricsWithFallback(
    song: SongMetadata,
    signal?: AbortSignal,
): Promise<LyricsResult> {
    for (const [title, artist] of buildLyricQueries(song)) {
        const params = new URLSearchParams({
            artist,
            song: title,
            timestamps: 'true',
            fast: 'true',
        });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const abortRequest = () => controller.abort();

        signal?.addEventListener('abort', abortRequest, { once: true });

        try {
            const response = await fetch(`${API_URL}?${params}`, {
                signal: controller.signal,
            });

            if (!response.ok) continue;

            const json = await response.json();
            if (hasLyrics(json?.data)) {
                const result = toLyricsResult(json.data);
                if (result.lyrics.length > 0) return result;
            }
        } catch (error) {
            if (signal?.aborted) throw error;
        } finally {
            clearTimeout(timeout);
            signal?.removeEventListener('abort', abortRequest);
        }
    }

    throw new Error('Lyrics were not found for any query');
}