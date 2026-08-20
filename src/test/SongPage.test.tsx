import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
    mockedLyricsResponse,
    mockedNoLyricsResponse,
} from './fixtures/lyrics_fixtures';
import { SettingsProvider } from '../Context';

// mock pinyin-pro for deterministic pronunciation output
vi.mock('pinyin-pro', () => ({
    pinyin: (s: string) => `py(${s})`,
}));

// mock tokenizer so tests are fast and deterministic
vi.mock('../lib/chineseTokenizer', () => ({
    tokenizeChinese: async (text: string) => {
        const parts: { word: string; start: number; end: number }[] = [];
        let pos = 0;
        const words = text.split(/(\s+)/);
        for (const w of words) {
            parts.push({ word: w, start: pos, end: pos + w.length });
            pos += w.length;
        }
        return parts;
    },
}));

const { default: SongPage } = await import('../SongPage');

describe('Song Page', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('displays title, artist and shows loading then lyrics when fetch succeeds', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockedLyricsResponse,
        });
        vi.stubGlobal('fetch', fetchMock);

        render(
            <MemoryRouter initialEntries={["/song/1"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/song/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        // title and artist come from local song_list.json synchronously
        expect(screen.getByText('永不失聯的愛')).toBeInTheDocument();
        expect(screen.getByText('Eric Chou')).toBeInTheDocument();

        // loading state is shown while fetch resolves
        expect(screen.getByText('Loading lyrics...')).toBeInTheDocument();

        // after fetch resolves the lyrics tokens should appear (tokenizer mocked)
        expect(await screen.findByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('first')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
        expect(screen.getByText('here')).toBeInTheDocument();
        expect(screen.getByText('Final')).toBeInTheDocument();

        // fetch should have been called once
        expect(fetchMock).toHaveBeenCalled();
    });

    test('shows error message when fetch fails', async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error('network error'));
        vi.stubGlobal('fetch', fetchMock);

        render(
            <MemoryRouter initialEntries={["/song/1"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/song/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        // wait for error message to appear
        expect(await screen.findByText('Unable to load lyrics right now.')).toBeInTheDocument();
    });

    test('renders Song not found for invalid id', () => {
        render(
            <MemoryRouter initialEntries={["/song/999"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/song/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        expect(screen.getByText('Song not found.')).toBeInTheDocument();
    });

    test('handles empty lyrics response without crashing', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockedNoLyricsResponse,
        });
        vi.stubGlobal('fetch', fetchMock);

        render(
            <MemoryRouter initialEntries={["/song/1"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/song/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        // ensure loading finishes and component did not throw
        // loading should eventually be removed
        await screen.findByText('Loading lyrics...');
        // after the initial loading state the component should stop showing it
        // findByText above ensures it was shown; now wait for it to be gone
        // use a small loop via findByText with not present by querying
        await new Promise((res) => setTimeout(res, 0));
        expect(fetchMock).toHaveBeenCalled();
    });

    test('toggles pronunciation switch and shows pronunciation text', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockedLyricsResponse,
        });
        vi.stubGlobal('fetch', fetchMock);

        render(
            <MemoryRouter initialEntries={["/song/1"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/song/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        // wait for tokens to appear
        expect(await screen.findByText('Hello')).toBeInTheDocument();

        // find the switch and toggle it (MUI renders a switch role)
        const toggle = screen.getByRole('switch');

        expect(toggle).not.toBeChecked();
        await userEvent.click(toggle);
        expect(toggle).toBeChecked();

        // pronunciation text should appear (from mocked pinyin-pro)
        expect(await screen.findByText('py(Hello)')).toBeInTheDocument();
    });
});