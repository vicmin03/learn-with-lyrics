import { LyricsDict } from '../types/lyrics';

// add %20 between spaces in song title/artist for API calls.
export function formatName(name: string): string {
    return name.split(' ').join('%20');
}

// convert timestamp string to milliseconds (used if timed_lyrics doesn't already exist)
export function timestampToMs(timestamp: string): number {
    const [minutes, seconds] = timestamp.split(':');
    const [wholeSeconds, milliseconds] = seconds.split('.');

    return (
        Number(minutes) * 60_000 +
        Number(wholeSeconds) * 1_000 +
        Number(milliseconds) * 10
    );
}

// convert milliseconds to seconds for easier comparison with currentTime
export function msToSeconds(timestamp: number) {
    return timestamp / 1000;
}

// split line into timestamp and lyrics dictionary
export function splitLine(line: string, index: number): LyricsDict {
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
export function splitLyrics(lyrics: string, hasTimestamps: boolean): LyricsDict[] {
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