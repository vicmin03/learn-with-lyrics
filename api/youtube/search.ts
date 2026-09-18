import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_RESULTS = "8";

// Search YouTube through the server so the API key never reaches the browser.
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { artist, title } = req.query;

    if (!artist || typeof artist !== "string" || !title || typeof title !== "string") {
        return res.status(400).json({
        error: "Missing song artist or title",
        });
    }

    const params = new URLSearchParams({
        part: "snippet",
        q: `${artist} ${title} official audio`,
        type: "video",
        maxResults: MAX_RESULTS,
        key: process.env.YOUTUBE_API_KEY ?? "",
        videoCategoryId: "10",
        videoEmbeddable: "true",
        videoSyndicated: "true",
    });

    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params}`
    );
    if (!response.ok) {
        const error = await response.text();

        console.error("YouTube API error:", error);

        return res.status(response.status).json({
        error: "YouTube API request failed",
        });
    }

    const data = await response.json();

    return res.status(200).json(data.items);
}