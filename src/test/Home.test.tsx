import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import fixture from './fixtures/song_list_fixture';

// Mock the module import of the song list to return our fixture
vi.mock('../song_list.json', () => ({ default: fixture }));

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

    test('renders song cards from song_list.json', () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        // check a few known titles from the fixture
        expect(screen.getByText('Test Song One')).toBeInTheDocument();
        expect(screen.getByText('Test Song Two')).toBeInTheDocument();
        expect(screen.getByText('Sun and Earth')).toBeInTheDocument();
    })

    test('each song card link points to the song route', () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        const firstLink = screen.getByRole('link', { name: /Test Song One/i });
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

        // wait longer than the debounce delay so the effect runs
        await new Promise((r) => setTimeout(r, 350));

        // assert filtered results
        expect(screen.getByText('Sun and Earth')).toBeInTheDocument();
        expect(screen.queryByText('Test Song One')).toBeNull();
        expect(screen.queryByText('Test Song Two')).toBeNull();
    })
});

