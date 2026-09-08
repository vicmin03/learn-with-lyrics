import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../components/NavBar';
import { MemoryRouter } from 'react-router-dom';

describe('Navbar', () => {
    test('display language select', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
        const languageSelect = screen.getByLabelText('language select');
        expect(languageSelect).toBeInTheDocument();
    });

    test('provides alternatives for language flags', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByRole('img', { name: 'Chinese' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'English' })).toBeInTheDocument();
    });

    test('user can select different language', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        const languageSelect = screen.getByLabelText('language select');
        await user.click(languageSelect);
        const koreanOption = await screen.findByRole('option', { name: 'Korean' });
        await user.click(koreanOption);
        expect(languageSelect).toHaveTextContent('Korean');
    });

});
