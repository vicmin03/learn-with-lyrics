import { afterEach, describe, expect, test, vi } from 'vitest';
import {
    buildLyricQueries,
    fetchLyricsWithFallback,
    removeBoundaryCreditLines,
} from '../lib/lyricsSearch';
import { LyricsDict } from '../types/lyrics';

describe('lyrics search', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test('builds ordered, unique fallback queries', () => {
        expect(buildLyricQueries({
            title: '原曲',
            eng_title: 'Original Song',
            artist: 'Artist',
            artist_eng: 'Artist',
        })).toEqual([
            ['原曲', 'Artist'],
            ['Original Song', 'Artist'],
        ]);
    });

    test('falls back after empty and failed responses', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { lyrics: '' } }) })
            .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { hasTimestamps: false, lyrics: 'found' } }),
            });
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchLyricsWithFallback({
            title: '原曲',
            eng_title: 'Original Song',
            artist: 'Artist',
            artist_eng: 'English Artist',
        });

        expect(result.lyrics[0].text).toBe('found');
        expect(fetchMock).toHaveBeenCalledTimes(3);

        const thirdUrl = new URL(fetchMock.mock.calls[2][0]);
        expect(thirdUrl.searchParams.get('song')).toBe('Original Song');
        expect(thirdUrl.searchParams.get('artist')).toBe('Artist');
    });

    test('removes credit lines only from the boundaries', () => {
        const lyrics: LyricsDict[] = [
            { id: 'credit-1', start_time: 0, text: '作曲: Composer' },
            { id: 'line-1', start_time: 1000, text: '第一句歌词' },
            { id: 'line-2', start_time: 2000, text: '歌词中的:文字' },
            { id: 'line-3', start_time: 3000, text: '最后一句歌词' },
            { id: 'credit-2', start_time: 4000, text: '母带处理： Studio' },
        ];

        expect(removeBoundaryCreditLines(lyrics)).toEqual([
            lyrics[1],
            lyrics[2],
            lyrics[3],
        ]);
    });

    test('does not accept a response containing only credits', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { hasTimestamps: true, timed_lyrics: [
                    { id: 'credit', start_time: 0, text: '作词: Lyricist' },
                ] } }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: { lyrics: 'actual lyric' } }),
            });
        vi.stubGlobal('fetch', fetchMock);

        const result = await fetchLyricsWithFallback({
            title: '原曲',
            eng_title: 'Original Song',
            artist: 'Artist',
            artist_eng: 'English Artist',
        });

        expect(result.lyrics[0].text).toBe('actual lyric');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});