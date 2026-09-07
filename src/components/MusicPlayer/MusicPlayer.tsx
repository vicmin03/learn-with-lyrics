import "./MusicPlayer.css"
import { useEffect, useState } from "react";
import { IconButton, Slider } from "@mui/material";
import Youtube from 'react-youtube';
import useYouTubePlayer from '../../hooks/useYoutubePlayer';
import { IoPlayCircle, IoPauseCircle, IoPlayBackCircle, IoPlayForwardCircle, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";


// function to convert seconds to MM:SS format
function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}


interface MusicPlayerProps {
    img: string,
    artist: string,
    title: string,
    ytVideoId: string
}

export function MusicPlayer(props: MusicPlayerProps) {
    const youtube = useYouTubePlayer();
    const [volume, setVolume] = useState(100);
    const isLoading = !youtube.ready;

    useEffect(() => {
        youtube.getVolume().then(setVolume);
    }, [youtube]);

    // what happens when user clicks on pause/play button
    const handlePlay = () => {
        if (isLoading) return;

        if (youtube.isPlaying) {
            youtube.pause()
        }
        else {
            youtube.play()
        }
    }

    // clicking volume button toggles mute
    const toggleMute = () => {
        if (isLoading) return;

        if (youtube.isMute) {
            youtube.unmute()
        }
        else {
            youtube.mute()
        }
    }

    // control changing volume with slider
    const handleVolume = (e: Event, newValue: number) => {
        if (isLoading) return;

        const volume = Array.isArray(newValue) ? newValue[0] : newValue;
        setVolume(volume)
        if (volume === 0) {
            youtube.mute();
        } else {
            youtube.unmute();
            youtube.player?.setVolume(volume);
        }
    }

    return (
        <>
            <section className="music-player-bar" aria-busy={isLoading} aria-label="Music player">
                <div className="music-player-cover-img">
                    {isLoading ? (
                        <div className="music-player-loading" role="status" aria-label="Loading music player" />
                    ) : (
                            <img className="song-cover-img" src={props.img} alt={`${props.title} cover`} />
                    )}
                </div>
                <div className="music-player-song-details"> 
                    <h2>{props.title}</h2>
                    <p>{props.artist}</p>
                </div>


                <Youtube className="youtube-player"
                    videoId={props.ytVideoId}
                    opts={{
                        width: '600',
                        height: '400',
                        playerVars: {
                            autoplay: 0,
                            origin: window.location.origin
                        },
            
                    }}
                    onReady={youtube.onReady}
                    onStateChange={youtube.onStateChange}
                />

                <div className="music-player-main" role="group" aria-label="Playback controls">
                    <progress
                        className="music-player-progress"
                        value={youtube.progress}
                        max={100}
                        aria-label="Song progress"
                        aria-valuetext={`${formatTime(youtube.currentTime)} of ${formatTime(youtube.totalDuration)}`}
                    />
                    <div className="music-player-buttons" role="group" aria-label="Song navigation and playback">
                        <IconButton disabled={isLoading} aria-label="Previous song">
                            <IoPlayBackCircle className="music-player-icon"/>
                        </IconButton> 
                        <IconButton 
                            disabled={isLoading}
                            aria-label={youtube.isPlaying ? "Pause" : "Play"}
                            onClick={handlePlay}>
                            {youtube.isPlaying ? <IoPauseCircle className="music-player-play-button"/> : <IoPlayCircle className="music-player-play-button"/>}
                        </IconButton> 
                        <IconButton disabled={isLoading} aria-label="Next song">
                            <IoPlayForwardCircle className="music-player-icon"/>
                        </IconButton> 
                    </div>
                    <p
                        className="timestamp"
                        role="timer"
                        aria-label={`Current time ${formatTime(youtube.currentTime)} of ${formatTime(youtube.totalDuration)}`}
                    >
                        {formatTime(youtube.currentTime)}/{formatTime(youtube.totalDuration)}
                    </p>

                </div>
                <div className="volume-control" role="group" aria-label="Volume controls">
                    <IconButton
                        disabled={isLoading}
                        aria-label={youtube.isMute ? "Unmute" : "Mute"}
                        onClick={toggleMute}>
                        {youtube.isMute ? <IoVolumeMute className="music-player-icon"/> : <IoVolumeHigh className="music-player-icon"/>}
                    </IconButton>
                    <Slider 
                        className="volume-slider"
                        aria-label="volume"
                        min={0}
                        max={100}
                        value={youtube.isMute ? 0 : volume}
                        orientation="vertical"
                        track="normal"
                        disabled={isLoading}
                        onChange={handleVolume}
                    />

                </div>
               
            </section>
        </>
    )
}