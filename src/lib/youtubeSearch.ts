const API_KEY = import.meta.env.VITE_YT_DATA_API_KEY;

export type YouTubeSearchResult = {
  id: {
    kind: string;
    videoId?: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails?: {
      medium?: {
        url: string;
      };
    };
  };
};

type scoredVideo = {
    result: YouTubeSearchResult,
    score: number
}

export async function fetchVideoId(artist: string, title: string) {
    const results = await searchYoutube(artist, title);

    const ranked = results
        .filter((result: YouTubeSearchResult) => result.id.videoId)
        .map((result: YouTubeSearchResult) => ({
            result,
            score: scoreYouTubeResult(
                result,
                title,
                artist
            ),
        }))
        .sort((a: scoredVideo, b: scoredVideo) => b.score - a.score); 
    console.log(ranked)
    console.log("HERE IT IS", ranked[0].result.id.videoId)
    return ranked[0].result.id.videoId;
}

// function to fetch youtube video ID from song artist and title query
async function searchYoutube(artist: string, title: string) {
    const params = new URLSearchParams({
        part: "snippet",
        q: `${artist} ${title} official audio`,
        type: "video",
        maxResults: "10",
        key: API_KEY,
        videoCategoryId: "10",
        videoEmbeddable: "true",
        videoSyndicated: "true",
    })
    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params}`
    )
    if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items;
};

// function to score youtube results in order of relevance to extract best audio for song
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreYouTubeResult(
  result: YouTubeSearchResult,
  songTitle: string,
  artist: string
): number {
  const title = normalize(result.snippet.title);
  const expectedTitle = normalize(songTitle);
  const expectedArtist = normalize(artist);

  let score = 0;

  if (title.includes(expectedTitle)) score += 50;
  if (title.includes(expectedArtist)) score += 40;

  // Prefer audio-focused uploads
  if (title.includes("official audio")) score += 30;
  if (title.includes("audio")) score += 15;

  // Prefer official releases
  if (title.includes("official")) score += 10;

  // Penalize things that may not match the original recording
  if (title.includes("live")) score -= 30;
  if (title.includes("remix")) score -= 30;
  if (title.includes("cover")) score -= 40;
  if (title.includes("acoustic")) score -= 20;
  if (title.includes("sped up")) score -= 40;
  if (title.includes("slowed")) score -= 40;
  if (title.includes("instrumental")) score -= 30;
  if (title.includes("karaoke")) score -= 40;

  // Music videos can contain intros, dialogue, etc.
  if (title.includes("music video")) score -= 10;

  return score;
}