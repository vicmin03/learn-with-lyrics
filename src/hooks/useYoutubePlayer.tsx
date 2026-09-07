import { useCallback, useState, useEffect } from "react";
import { YouTubeEvent, YouTubePlayer } from "react-youtube";

export default function useYouTubePlayer() {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isMute, setIsMute] = useState(false);

  const progress = totalDuration > 0
    ? (currentTime / totalDuration) * 100
    : 0;

  // get total duration of video in seconds
  useEffect(() => {
    if (!player) return;

    // define potential timeout operation to retry if getDuration returns 0
    let timeout: ReturnType<typeof setTimeout>;

    const getTotalDuration = async() => {
      const duration = await player.getDuration();

      if (duration > 0) {
        setTotalDuration(duration);
        return;
      }
      // retry if song data is not loaded yet and duration is returning 0 seconds
      timeout = setTimeout(getTotalDuration, 250)
    };

    getTotalDuration();
    
    return () => clearTimeout(timeout);
  }, [player])

  // get current progress of song in seconds
  useEffect(() => {
    if (!player || !isPlaying) return;
    
    const interval = setInterval(async () => {
      const time = await player.getCurrentTime()
      setCurrentTime(time);
    }, 250)

    return () => clearInterval(interval);
  }, [player, isPlaying])

  const onReady = useCallback((event: YouTubeEvent) => {
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

  const mute = useCallback(() => {
    player?.mute();
    setIsMute(true);
  }, [player])

  const unmute = useCallback(() => {
    player?.unMute();
    setIsMute(false);
  }, [player])

  const getVolume = useCallback(async () => {
    if (!player) return 100;
    const volume = await player.getVolume();
    return volume;
  }, [player]);

  return {
    player,
    isPlaying,
    currentTime,
    totalDuration,
    progress,
    onReady,
    play,
    pause,
    seek,
    mute,
    unmute,
    isMute,
    getVolume,
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
