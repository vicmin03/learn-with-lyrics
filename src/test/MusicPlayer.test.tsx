import { useEffect, useMemo, useState } from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MusicPlayer } from '../components/MusicPlayer/MusicPlayer';
import type { YouTubePlayer } from 'react-youtube';

const youtubePlayer = {
    playVideo: vi.fn(),
    pauseVideo: vi.fn(),
    seekTo: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    setVolume: vi.fn(),
    getVolume: vi.fn().mockResolvedValue(75),
    getDuration: vi.fn().mockResolvedValue(180),
    getCurrentTime: vi.fn().mockResolvedValue(65),
};

let autoReady = true;
const onPreviousLyric = vi.fn();
const onNextLyric = vi.fn();

function MockYouTube({ onReady }: { onReady: (event: { target: typeof youtubePlayer }) => void }) {
    useEffect(() => {
        if (autoReady) {
            onReady({ target: youtubePlayer });
        }
    }, [onReady]);

    return <div data-testid="youtube-player" />;
}

function TestPlayer({ canSeekLyrics = true }: { canSeekLyrics?: boolean }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMute, setIsMute] = useState(false);
    const [ready] = useState(autoReady);

    const player = useMemo(() => ({
        player: ready ? youtubePlayer as unknown as YouTubePlayer : null,
        isPlaying,
        currentTime: 0,
        totalDuration: 180,
        progress: 0,
        onReady: vi.fn(),
        onStateChange: vi.fn(),
        play: () => {
            youtubePlayer.playVideo();
            setIsPlaying(true);
        },
        pause: () => {
            youtubePlayer.pauseVideo();
            setIsPlaying(false);
        },
        seek: vi.fn(),
        mute: () => {
            youtubePlayer.mute();
            setIsMute(true);
        },
        unmute: () => {
            youtubePlayer.unMute();
            setIsMute(false);
        },
        isMute,
        getVolume: () => youtubePlayer.getVolume(),
        ready,
    }), [isMute, isPlaying, ready]);

    return (
        <MusicPlayer
            player={player}
            img="cover.jpg"
            artist="Example artist"
            title="Example song"
            ytVideoId="video-id"
            onPreviousLyric={onPreviousLyric}
            onNextLyric={onNextLyric}
            canSeekLyrics={canSeekLyrics}
        />
    );
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

    const renderPlayer = () => render(<TestPlayer />);

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

    test('previous and next lyric buttons call their seek callbacks', async () => {
        const user = userEvent.setup();
        renderPlayer();

        await user.click(await screen.findByRole('button', { name: 'Previous song' }));
        await user.click(screen.getByRole('button', { name: 'Next song' }));

        expect(onPreviousLyric).toHaveBeenCalledOnce();
        expect(onNextLyric).toHaveBeenCalledOnce();
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

    test('disables lyric navigation when lyrics have no timestamps', () => {
        render(<TestPlayer canSeekLyrics={false} />);

        expect(screen.getByRole('button', { name: 'Previous song' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Next song' })).toBeDisabled();
    });
});
