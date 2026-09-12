import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import mockedSongs from './fixtures/song_list_fixture';

const { supabaseFromMock } = vi.hoisted(() => ({
    supabaseFromMock: vi.fn(),
}));

vi.mock('../lib/supabaseClient', () => ({
    supabase: { from: supabaseFromMock },
}));

supabaseFromMock.mockImplementation(() => {
        const query = {
            result: { data: mockedSongs, error: null },
            or: vi.fn((filter: string) => {
                const search = filter.match(/ilike\.%([^%]+)%/i)?.[1]?.toLowerCase() ?? '';
                query.result = {
                    data: mockedSongs.filter((song) =>
                        [song.orig_title, song.eng_title, song.artist_name, song.artist_eng_name]
                            .some((field) => field.toLowerCase().includes(search))
                    ),
                    error: null,
                };
                return query;
            }),
            then: (resolve: (value: { data: typeof mockedSongs; error: null }) => unknown) =>
                Promise.resolve(query.result).then(resolve),
        };

        return { select: vi.fn(() => query) };
});

// Use MemoryRouter in tests: it's lightweight, keeps history in memory,
// and avoids touching the JSDOM URL while providing the router context
// needed by `Link`/route components. This is standard for unit tests.
import Home from '../Home';

describe('Home', () => {
    test('renders search bar', () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        const search = screen.getByLabelText('search-bar');
        expect(search).toBeInTheDocument();
    })

    test('renders song cards from Supabase', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        // check a few known titles from the fixture
        expect(await screen.findByText('Test Song One')).toBeInTheDocument();
        expect(screen.getByText('Test Song Two')).toBeInTheDocument();
        expect(screen.getByText('Sun and Earth')).toBeInTheDocument();
    })

    test('provides accessible structure for song results', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Browse songs', level: 1 })).toBeInTheDocument();
        expect(await screen.findByRole('list')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(mockedSongs.length);
        expect(screen.getByText('3 songs found.')).toHaveAttribute('aria-live', 'polite');
        expect(screen.getByRole('heading', { name: 'Test Song Two', level: 2 })).toHaveAttribute('lang', 'zh');
    })

    test('each song card link points to the song route', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        const firstLink = await screen.findByRole('link', { name: /Test Song One/i });
        expect(firstLink).toHaveAttribute('href', '/songs/1');
    })

    test('filters songs based on search input (debounced)', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        const search = screen.getByLabelText('search-bar');

        // type a value that matches the english title of the 3rd song
        fireEvent.change(search, { target: { value: 'sun' } });

        // assert filtered results
        await waitFor(() => {
            expect(screen.getByText('Sun and Earth')).toBeInTheDocument();
            expect(screen.queryByText('Test Song One')).toBeNull();
            expect(screen.queryByText('Test Song Two')).toBeNull();
        });
    })

    test('shows an accessible message when no songs match', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        const search = screen.getByLabelText('search-bar');
        fireEvent.change(search, { target: { value: 'missing song' } });

        await waitFor(() => {
            expect(screen.getByText('No songs found.')).toHaveAttribute('aria-live', 'polite');
            expect(screen.getByRole('status')).toHaveTextContent('Try searching for a different song title.');
            expect(screen.queryByRole('list')).toBeNull();
        });
    })
});

