import { useEffect } from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MusicPlayer } from '../components/MusicPlayer/MusicPlayer';

const youtubePlayer = {
    playVideo: vi.fn(),
    pauseVideo: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    setVolume: vi.fn(),
    getVolume: vi.fn().mockResolvedValue(75),
    getDuration: vi.fn().mockResolvedValue(180),
    getCurrentTime: vi.fn().mockResolvedValue(65),
};

let autoReady = true;

function MockYouTube({ onReady }: { onReady: (event: { target: typeof youtubePlayer }) => void }) {
    useEffect(() => {
        if (autoReady) {
            onReady({ target: youtubePlayer });
        }
    }, [onReady]);

    return <div data-testid="youtube-player" />;
}

vi.mock('react-youtube', () => ({
    default: MockYouTube,
}));

describe('Music Player', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        autoReady = true;
        youtubePlayer.getVolume.mockResolvedValue(75);
        youtubePlayer.getDuration.mockResolvedValue(180);
        youtubePlayer.getCurrentTime.mockResolvedValue(65);
    });

    const renderPlayer = () => render(
        <MusicPlayer
            img="cover.jpg"
            artist="Example artist"
            title="Example song"
            ytVideoId="video-id"
        />
    );

    test('Music player component loads all elements correctly', async () => {
        renderPlayer();

        expect(await screen.findByRole('img')).toHaveAttribute('src', 'cover.jpg');
        expect(screen.getByRole('heading', { name: 'Example song' })).toBeInTheDocument();
        expect(screen.getByText('Example artist')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toHaveValue(0);
        expect(screen.getByText('0:00/3:00')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Previous song' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Next song' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Mute' })).toBeInTheDocument();
        expect(screen.getByRole('slider', { name: 'volume' })).toBeInTheDocument();
    });

    test('Play/pause button handles song playback correctly', async () => {
        const user = userEvent.setup();
        renderPlayer();
        const playButton = await screen.findByRole('button', { name: 'Play' });

        await user.click(playButton);
        expect(youtubePlayer.playVideo).toHaveBeenCalledOnce();
        expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Pause' }));
        expect(youtubePlayer.pauseVideo).toHaveBeenCalledOnce();
        expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    });

    test('volume control contains the volume slider', async () => {
        renderPlayer();
        const volumeSlider = await screen.findByRole('slider', { name: 'volume' });

        expect(volumeSlider.closest('.volume-slider')).toBeInTheDocument();
        expect(volumeSlider.closest('.volume-control')).toBeInTheDocument();
    });

    test('Clicking on volume icon mutes and unmutes volume', async () => {
        const user = userEvent.setup();
        renderPlayer();
        const muteButton = await screen.findByRole('button', { name: 'Mute' });

        await user.click(muteButton);
        expect(youtubePlayer.mute).toHaveBeenCalledOnce();
        expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Unmute' }));
        expect(youtubePlayer.unMute).toHaveBeenCalledOnce();
    });

    test('Volume controls change the player volume', async () => {
        renderPlayer();
        const volumeSlider = await screen.findByRole('slider', { name: 'volume' });

        fireEvent.change(volumeSlider, { target: { value: '40' } });

        expect(youtubePlayer.setVolume).toHaveBeenCalledWith(40);
    });

    test('setting volume to zero mutes the player', async () => {
        renderPlayer();
        const volumeSlider = await screen.findByRole('slider', { name: 'volume' });

        fireEvent.change(volumeSlider, { target: { value: '0' } });

        expect(youtubePlayer.mute).toHaveBeenCalledOnce();
        expect(youtubePlayer.setVolume).not.toHaveBeenCalled();
    });

    test('disables controls while the player is loading', () => {
        autoReady = false;
        renderPlayer();

        expect(screen.getByRole('status', { name: 'Loading music player' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Mute' })).toBeDisabled();
        expect(screen.getByRole('slider', { name: 'volume' })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'Play' }));
        expect(youtubePlayer.playVideo).not.toHaveBeenCalled();
    });
});
