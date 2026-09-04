import "./MusicPlayer.css"
import { IconButton } from "@mui/material";
import Youtube from 'react-youtube';
import useYouTubePlayer from '../../hooks/useYoutubePlayer';
import { IoPlayCircle, IoPauseCircle, IoPlayBackCircle, IoPlayForwardCircle, IoPause } from "react-icons/io5";

interface MusicPlayerProps {
    artist: string,
    title: string,
    ytVideoId: string
}

export function MusicPlayer(props: MusicPlayerProps) {
    const youtube = useYouTubePlayer();

    const handlePlay = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (youtube.isPlaying) {
            youtube.pause()
        }
        else {
            youtube.play()
        }
    }

    return (
        <>
            <div className="music-player-bar">
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
            </div>
        </>
    )
}