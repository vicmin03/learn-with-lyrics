// define an interface for representing a timed lyric in a song
export interface LyricsDict {
    id: string,
    start_time: number,
    end_time?: number,
    text: string
}
