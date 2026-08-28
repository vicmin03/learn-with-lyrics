import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ChineseToken } from '../lib/chineseTokenizer';

// Mock the tokenizer so tests run fast and deterministically
vi.mock('../lib/chineseTokenizer', () => ({
    tokenizeChinese: async (text: string) => {
        // simple tokenizer: split on spaces, keep whitespace tokens
        const parts: ChineseToken[] = [];
        let pos = 0;
        const words = text.split(/(\s+)/);
        for (const w of words) {
            parts.push({ word: w, start: pos, end: pos + w.length });
            pos += w.length;
        }
        return parts;
    },
}));

// Mock pinyin-pro so pronunciation output is deterministic
vi.mock('pinyin-pro', () => ({
    pinyin: (s: string) => `py(${s})`,
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

        render(
            <Lyrics
                lyrics={lyrics}
                showPronunciation={false}
                simplifiedCharacters={true}
                origScript="cn"
                onLookup={vi.fn()}
            />
        );

        // tokens should appear as separate text/spans
        expect(await screen.findByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('world')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
        expect(screen.getByText('line')).toBeInTheDocument();
    });

    test('clicking a token calls lookup function', async () => {
        const mockLookup = vi.fn();

        const lyrics = [{ id: 'lrc_0', start_time: 0, text: 'Click me' }];

        render(
            <Lyrics
                lyrics={lyrics}
                showPronunciation={false}
                simplifiedCharacters={true}
                origScript="cn"
                onLookup={mockLookup}
            />
        );

        const token = await screen.findByText('Click');
        await userEvent.click(token);

        expect(mockLookup).toHaveBeenCalledWith('Click', token);
    });

    test('renders nothing when no lyrics provided', () => {
        render(
            <Lyrics
                lyrics={[]}
                showPronunciation={false}
                simplifiedCharacters={true}
                origScript="cn"
                onLookup={vi.fn()}
            />
        );
        // no paragraphs should be present
        const paragraphs = document.querySelectorAll('p.song-lyrics');
        expect(paragraphs.length).toBe(0);
    });

    test('shows pronunciation when enabled', async () => {
        const lyrics = [{ id: 'lrc_0', start_time: 0, text: '你好 world' }];

        render(
            <Lyrics
                lyrics={lyrics}
                showPronunciation={true}
                simplifiedCharacters={true}
                origScript="cn"
                onLookup={vi.fn()}
            />
        );

        // tokenization is mocked; wait for tokens and pronunciation spans
        expect(await screen.findByText('你好')).toBeInTheDocument();
        // pronunciation text should be present (from mocked pinyin-pro)
        expect(screen.getAllByText(/py\(/).length).toBeGreaterThan(0);
    });
});