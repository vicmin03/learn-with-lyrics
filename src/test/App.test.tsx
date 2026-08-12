import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
    test('displays navbar at top of screen', () => {
        render(<App />);

        const navbar = screen.getByRole('navigation');
        expect(navbar).toBeInTheDocument();
    })
});
