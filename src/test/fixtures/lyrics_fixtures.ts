import { LyricsDict } from '../../types/lyrics';

export const mockedLyricsResponse = {
  data: {
    hasTimestamps: true,
    // API returns an array of timed_lyrics matching LyricsDict
    timed_lyrics: [
      { id: 'lrc_0', start_time: 12340, text: 'Hello first line' } as LyricsDict,
      { id: 'lrc_1', start_time: 15670, text: 'Second line here' } as LyricsDict,
      { id: 'lrc_2', start_time: 20000, text: 'Final line' } as LyricsDict,
    ],
  },
};

export const mockedNoLyricsResponse = {
  data: {
    hasTimestamps: false,
    lyrics: '',
  },
};

export const mockedBadResponse = {
  error: 'not found',
};
