import "./SelectYTVid.css";
import { useState } from "react";
import { fetchVideoDetails, YouTubeVideoDetails } from "../../lib/youtubeSearch";
import { Button, CircularProgress, MenuList, MenuItem, ListItemIcon } from "@mui/material";

interface SelectYTVidProps {
    artist: string,
    title: string,
    onSelect: (videoId: string) => void,
    disabled?: boolean,
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


export function SelectYTVid ({artist, title, onSelect, disabled = false} : SelectYTVidProps) {
    const [ytVids, setYTVids] = useState<YouTubeVideoDetails[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getResults = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const results = await fetchVideoDetails(artist, title);
            setYTVids(results);
        } catch (fetchError) {
            console.error("Failed to load YouTube videos:", fetchError);
            setYTVids([]);
            setError("Unable to load YouTube videos right now.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <MenuList className="yt-results-menu">
                <Button
                    className="submit-button"
                    type="button"
                    onClick={getResults}
                    disabled={disabled || isLoading}
                    startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
                >
                    {isLoading ? "Searching..." : "Find YouTube videos"}
                </Button>
                {error && <p role="alert">{error}</p>}
                {ytVids.map((result) => (
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


