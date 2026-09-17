import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectYTVid } from '../components/SelectYTVid/SelectYTVid';
import type { YouTubeVideoDetails } from '../lib/youtubeSearch';

const sampleVideos: YouTubeVideoDetails[] = [
    {
        id: { kind: 'youtube#video', videoId: 'abc123' },
        snippet: {
            title: 'Example Song',
            description: 'Sample description',
            channelTitle: 'Example Artist',
            publishedAt: '2024-01-01T00:00:00Z',
            thumbnails: {
                medium: { url: 'https://example.com/thumb.jpg' },
            },
        },
        contentDetails: {
            duration: 'PT1H2M3S',
            licensedContent: false,
        },
    },
];

describe('SelectYTVid', () => {
    test('renders the video title, channel, thumbnail, and duration', () => {
        render(<SelectYTVid onSelect={vi.fn()} videos={sampleVideos} />);

        expect(screen.getByText('Example Song')).toBeInTheDocument();
        expect(screen.getByText('Example Artist')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Example Song' })).toHaveAttribute(
            'src',
            'https://example.com/thumb.jpg'
        );
        expect(screen.getByText('1:02:03')).toBeInTheDocument();
    });

    test('calls onSelect with the video id when a result is clicked', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        render(<SelectYTVid onSelect={onSelect} videos={sampleVideos} />);

        await user.click(screen.getByRole('menuitem'));

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith('abc123');
    });

    test('does not call onSelect when the video id is missing', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();

        const videosWithoutId: YouTubeVideoDetails[] = [
            {
                ...sampleVideos[0],
                id: { kind: 'youtube#video' },
            },
        ];

        render(<SelectYTVid onSelect={onSelect} videos={videosWithoutId} />);

        await user.click(screen.getByRole('menuitem'));

        expect(onSelect).not.toHaveBeenCalled();
    });
});


