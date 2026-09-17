import "./SelectYTVid.css";
import { YouTubeVideoDetails } from "../../lib/youtubeSearch";
import { MenuList, MenuItem, ListItemIcon } from "@mui/material";

interface SelectYTVidProps {
    onSelect: (videoId: string) => void,
    videos: YouTubeVideoDetails[],
}

// convert youtube video duration from PT#H#M#S format to HH:MM:SS
// e.g. PT5M23S = 5:23, PT1H2M3S = 1:02:03, PT1H = 1:00:00, PT2M = 2:00, PT3S = 0:03
function convertYTTimestamp (duration: string) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const match = duration.match(regex);

    if (!match) {
        return "0:00";
    }

    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    const seconds = parseInt(match[3] || "0", 10);

    const formattedDuration = [
        hours > 0 ? String(hours) : null,
        String(minutes).padStart(2, "0"),
        String(seconds).padStart(2, "0")
    ].filter(Boolean).join(":");

    return formattedDuration;
}


export function SelectYTVid ({onSelect, videos} : SelectYTVidProps) {
    return (
        <>
            <MenuList className="yt-results-menu">
                {videos.map((result) => (
                    <MenuItem
                        className="yt-search-result"
                        key={result.id.videoId}
                        onClick={() => {
                            if (result.id.videoId) {
                                onSelect(result.id.videoId);
                            }
                        }}
                    >
                        <ListItemIcon >
                            <img className="yt-thumbnail"
                                src={result.snippet.thumbnails?.medium?.url} 
                                alt={result.snippet.title} />
                        </ListItemIcon>
                        <div className="yt-result-info">
                            <p className="yt-result-title">{result.snippet.title}</p>
                            <p className="yt-result-channel">{result.snippet.channelTitle}</p>
                        </div>
                        <p className="yt-result-duration">
                            {convertYTTimestamp(result.contentDetails.duration)}
                        </p>
                    </MenuItem>
                ))}
                
            </MenuList>
        </>
    )
}


