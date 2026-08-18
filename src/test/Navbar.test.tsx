import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from '../components/navbar';

describe('Navbar', () => {
    test('display language select', () => {
        render(<Navbar />);

        const languageSelect = screen.getByRole("combobox", { name: "language select" });
        expect(languageSelect).toBeInTheDocument();
    });

    test('user can select different language', async () => {
        const user = userEvent.setup();
        render(<Navbar />);
        
        const languageSelect = screen.getByRole("combobox", { name: "language select" });
        
        await user.click(languageSelect);

        
        const koreanOption = screen.getByRole('option', {
            name: 'Korean',
        });

        await user.click(koreanOption);

        expect(languageSelect).toHaveTextContent('Korean');
        })

});
