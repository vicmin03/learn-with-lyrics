import { describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
    test('displays navbar at top of screen', () => {
        render(<App />);

        const navbar = screen.getByRole('navigation');
        expect(navbar).toBeInTheDocument();
    })

    test('display app title', () => {
        render(<App />);

        const title = screen.getByText('Learn With Lyrics');
    })
});
