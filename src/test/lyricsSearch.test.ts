import { afterEach, describe, expect, test, vi } from 'vitest';
import {
    buildLyricQueries,
    fetchLyricsWithFallback,
} from '../lib/lyricsSearch';

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
});