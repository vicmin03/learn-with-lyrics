import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../components/NavBar/NavBar';
import { MemoryRouter } from 'react-router-dom';

describe('Navbar', () => {
    test('displays the logo link', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: 'Learn With Lyrics' }))
            .toHaveAttribute('href', '/');
    });

    test('displays the language menu button and search button', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: 'Languages' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });

    test('opens the language menu with its options', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: 'Languages' }));

        expect(await screen.findByRole('menuitem', { name: 'Chinese' }))
            .toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Japanese' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Korean' })).toBeInTheDocument();
    });

    test('closes the language menu when escape is pressed', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        await user.click(screen.getByRole('button', { name: 'Languages' }));
        expect(await screen.findByRole('menuitem', { name: 'Chinese' }))
            .toBeInTheDocument();

        await user.keyboard('{Escape}');

        expect(screen.queryByRole('menuitem', { name: 'Chinese' }))
            .not.toBeInTheDocument();
    });

});
