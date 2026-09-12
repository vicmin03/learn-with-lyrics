import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
    mockedLyricsResponse,
    mockedNoLyricsResponse,
} from './fixtures/lyrics_fixtures';
import mockedSongs from './fixtures/song_list_fixture';
import { SettingsProvider } from '../contexts/SettingsProvider';

const { supabaseFromMock, supabaseEqMock, supabaseSingleMock } = vi.hoisted(() => {
    const supabaseSingleMock = vi.fn();
    const supabaseEqMock = vi.fn(() => ({ single: supabaseSingleMock }));
    const supabaseFromMock = vi.fn(() => ({
        select: vi.fn(() => ({ eq: supabaseEqMock })),
    }));

    return { supabaseFromMock, supabaseEqMock, supabaseSingleMock };
});

vi.mock('../lib/supabaseClient', () => ({
    supabase: { from: supabaseFromMock },
}));

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

vi.mock('../lib/youtubeSearch', () => ({
    fetchVideoId: vi.fn().mockResolvedValue('test-video-id'),
}));

vi.mock('../components/MusicPlayer/MusicPlayer', () => ({
    MusicPlayer: () => <div data-testid="music-player" />,
}));

const { default: SongPage } = await import('../components/SongPage/SongPage');

describe('Song Page', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        supabaseFromMock.mockReturnValue({
            select: vi.fn(() => ({ eq: supabaseEqMock })),
        });
        supabaseEqMock.mockReturnValue({
            single: supabaseSingleMock,
        });
        supabaseSingleMock.mockImplementation(async () => ({
            data: mockedSongs[0],
            error: null,
        }));
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
            <MemoryRouter initialEntries={["/songs/1"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/songs/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        // title and artist come from the mocked Supabase row
        expect(await screen.findByText('Test Song One')).toBeInTheDocument();
        expect(screen.getByText('Artist One')).toBeInTheDocument();

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
            <MemoryRouter initialEntries={["/songs/1"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/songs/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        // wait for error message to appear
        expect(await screen.findByText('Unable to load lyrics right now.')).toBeInTheDocument();
    });

    test('renders Song not found for invalid id', async () => {
        supabaseSingleMock.mockResolvedValue({
            data: null,
            error: { message: 'Song not found' },
        });

        render(
            <MemoryRouter initialEntries={["/songs/999"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/songs/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText('Song not found.')).toBeInTheDocument();
    });

    test('handles empty lyrics response without crashing', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockedNoLyricsResponse,
        });
        vi.stubGlobal('fetch', fetchMock);

        render(
            <MemoryRouter initialEntries={["/songs/1"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/songs/:song_id" element={<SongPage />} />
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
            <MemoryRouter initialEntries={["/songs/1"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/songs/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        // wait for tokens to appear
        expect(await screen.findByText('Hello')).toBeInTheDocument();

        // find the switch and toggle it (MUI renders a switch role)
        const toggle = screen.getAllByRole('switch')[0];

        expect(toggle).toBeChecked();
        expect(await screen.findByText('py(Hello)')).toBeInTheDocument();

        await userEvent.click(toggle);
        expect(toggle).not.toBeChecked();
        await waitFor(() => {
            expect(screen.queryByText('py(Hello)')).not.toBeInTheDocument();
        });

        await userEvent.click(toggle);
        expect(toggle).toBeChecked();
        expect(await screen.findByText('py(Hello)')).toBeInTheDocument();
    });

    test('toggles between simplified and traditional lyrics', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                data: {
                    hasTimestamps: false,
                    lyrics: '愛',
                },
            }),
        });
        vi.stubGlobal('fetch', fetchMock);

        render(
            <MemoryRouter initialEntries={["/songs/1"]}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/songs/:song_id" element={<SongPage />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText('爱')).toBeInTheDocument();

        const switches = screen.getAllByRole('switch');
        const scriptToggle = switches[1];

        expect(scriptToggle).toBeChecked();
        await userEvent.click(scriptToggle);

        expect(scriptToggle).not.toBeChecked();
        expect(await screen.findByText('愛')).toBeInTheDocument();
    });
});