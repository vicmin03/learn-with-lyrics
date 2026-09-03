import { useCallback, useState } from "react";
import { YouTubeEvent, YouTubePlayer } from "react-youtube";

export default function useYouTubePlayer() {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const onReady = useCallback((event: YouTubeEvent) => {
    console.log("YouTube ready");
    setPlayer(event.target);
  }, []);

  const play = useCallback(() => {
    player?.playVideo();
    setIsPlaying(true);
  }, [player]);

  const pause = useCallback(() => {
    player?.pauseVideo();
    setIsPlaying(false);
  }, [player]);

  const seek = useCallback(
    (seconds: number) => {
      player?.seekTo(seconds, true);
    },
    [player]
  );

  return {
    player,
    isPlaying,
    onReady,
    play,
    pause,
    seek,
    ready: player !== null,
  };
}


// how to use

// const youtube = useYouTubePlayer();

// return (
//   <>
//     <YouTube
//       videoId={videoId}
//       opts={opts}
//       onReady={youtube.onReady}
//     />

//     <button onClick={youtube.play}>
//       Play
//     </button>

//     <button onClick={youtube.pause}>
//       Pause
//     </button>
//   </>
// );
