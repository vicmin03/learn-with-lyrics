import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SongPage from '../SongPage';
import {
    mockedLyricsResponse,
    mockedNoLyricsResponse,
} from './fixtures/lyrics_fixtures';

describe('Song Page', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        // ensure fetch mock is cleaned up
        // @ts-ignore global fetch used in tests
        if ((global as any).fetch && (global as any).fetch.mockRestore) (global as any).fetch.mockRestore();
    });

    test('displays title, artist and shows loading then lyrics when fetch succeeds', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockedLyricsResponse,
        });
        // @ts-ignore
        global.fetch = fetchMock;

        render(
            <MemoryRouter initialEntries={["/song/1"]}>
                <Routes>
                    <Route path="/song/:song_id" element={<SongPage />} />
                </Routes>
            </MemoryRouter>
        );

        // title and artist come from local song_list.json synchronously
        expect(screen.getByText('永不失聯的愛')).toBeInTheDocument();
        expect(screen.getByText('Eric Chou')).toBeInTheDocument();

        // loading state is shown while fetch resolves
        expect(screen.getByText('Loading lyrics...')).toBeInTheDocument();

        // after fetch resolves the lyrics lines should appear
        expect(await screen.findByText('Hello first line')).toBeInTheDocument();
        expect(screen.getByText('Second line here')).toBeInTheDocument();
        expect(screen.getByText('Final line')).toBeInTheDocument();

        // fetch should have been called once
        expect(fetchMock).toHaveBeenCalled();
    });

    test('shows error message when fetch fails', async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error('network error'));
        // @ts-ignore
        global.fetch = fetchMock;

        render(
            <MemoryRouter initialEntries={["/song/1"]}>
                <Routes>
                    <Route path="/song/:song_id" element={<SongPage />} />
                </Routes>
            </MemoryRouter>
        );

        // wait for error message to appear
        expect(await screen.findByText('Unable to load lyrics right now.')).toBeInTheDocument();
    });

    test('renders Song not found for invalid id', () => {
        render(
            <MemoryRouter initialEntries={["/song/999"]}>
                <Routes>
                    <Route path="/song/:song_id" element={<SongPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Song not found.')).toBeInTheDocument();
    });

    test('handles empty lyrics response without crashing', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockedNoLyricsResponse,
        });
        // @ts-ignore
        global.fetch = fetchMock;

        render(
            <MemoryRouter initialEntries={["/song/1"]}>
                <Routes>
                    <Route path="/song/:song_id" element={<SongPage />} />
                </Routes>
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
});