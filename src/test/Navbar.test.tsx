import { describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Navbar } from '../components/Navbar';

describe('Navbar', () => {
    test('display language select and change on user selection', () => {
        render(<Navbar />);

        // const languageSelect = screen.getByLabelText('language select');
        const languageSelect = screen.getByRole("combobox", { name: "language select" });
        expect(languageSelect).toBeInTheDocument();
    })
});
