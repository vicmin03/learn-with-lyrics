import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the tokenizer so tests run fast and deterministically
vi.mock('../lib/chineseTokenizer', () => ({
    tokenizeChinese: async (text: string) => {
        // simple tokenizer: split on spaces, keep whitespace tokens
        const parts: { word: string; start: number; end: number }[] = [];
        let pos = 0;
        const words = text.split(/(\s+)/);
        for (const w of words) {
            parts.push({ word: w, start: pos, end: pos + w.length });
            pos += w.length;
        }
        return parts as any;
    },
}));

const { Lyrics } = await import('../components/Lyrics');

describe('Lyrics', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        // clear DOM between tests
        document.body.innerHTML = '';
    });

    test('display tokenized lyrics as spans and text nodes', async () => {
        const lyrics = [
            { id: 'lrc_0', start_time: 0, text: 'Hello world' },
            { id: 'lrc_1', start_time: 1000, text: 'Second line' },
        ];

        render(<Lyrics lyrics={lyrics} />);

        // tokens should appear as separate text/spans
        expect(await screen.findByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('world')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
        expect(screen.getByText('line')).toBeInTheDocument();
    });

    test('clicking a token calls lookup function', async () => {
        const mockLookup = vi.fn();

        const lyrics = [{ id: 'lrc_0', start_time: 0, text: 'Click me' }];

        render(<Lyrics lyrics={lyrics} onLookup={mockLookup} />);

        const token = await screen.findByText('Click');
        await userEvent.click(token);

        expect(mockLookup).toHaveBeenCalledWith('Click');
    });

    test('renders nothing when no lyrics provided', () => {
        render(<Lyrics lyrics={[]} />);
        // no paragraphs should be present
        const paragraphs = document.querySelectorAll('p.song-lyrics');
        expect(paragraphs.length).toBe(0);
    });
});