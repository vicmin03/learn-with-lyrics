import "./MusicPlayer.css"
import { IconButton } from "@mui/material";
import Youtube from 'react-youtube';
import useYouTubePlayer from '../../hooks/useYoutubePlayer';
import { IoPlayCircle, IoPauseCircle, IoPlayBackCircle, IoPlayForwardCircle, IoPause, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";


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

    // what happens when user clicks on pause/play button
    const handlePlay = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (youtube.isPlaying) {
            youtube.pause()
        }
        else {
            youtube.play()
        }
    }

    // clicking volume button toggles mute
    const toggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (youtube.isMute) {
            youtube.unmute()
        }
        else {
            youtube.mute()
        }
    }

    return (
        <>
            <div className="music-player-bar">
                <div className="music-player-cover-img">
                    <img className="song-cover-img" src={props.img}/>
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
                />

                <div className="music-player-main">
                    <progress className="music-player-progress" value={youtube.progress} max={100}/>
                    <div className="music-player-buttons">
                        <IconButton >
                            <IoPlayBackCircle className="music-player-icon"/>
                        </IconButton> 
                        <IconButton 
                            onClick={handlePlay}>
                            {youtube.isPlaying ? <IoPauseCircle className="music-player-play-button"/> : <IoPlayCircle className="music-player-play-button"/>}
                        </IconButton> 
                        <IconButton >
                            <IoPlayForwardCircle className="music-player-icon"/>
                        </IconButton> 
                    </div>
                    <p className="timestamp">{formatTime(youtube.currentTime)}/{formatTime(youtube.totalDuration)}</p>

                </div>
                <div className="volume-control">
                    <IconButton
                        onClick={toggleMute}>
                        {youtube.isMute ? <IoVolumeMute className="music-player-icon"/> : <IoVolumeHigh className="music-player-icon"/>}
                    </IconButton>
                </div>

            </div>
        </>
    )
}