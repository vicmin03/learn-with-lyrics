
const API_KEY = import.meta.env.VITE_YT_DATA_API_KEY;

export async function searchYoutube(query: string) {
    const params = new URLSearchParams({
        part: "snippet",
        q: `${query} official audio`,
        type: "video",
        maxResults: "10",
        key: API_KEY,
    })
    let call = `https://www.googleapis.com/youtube/v3/search?${params}`;
    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params}`
    )
    if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.items) {
        return data.items[0].id.videoId;
    }
};