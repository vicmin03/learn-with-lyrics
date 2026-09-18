import type { VercelRequest, VercelResponse } from "@vercel/node";

// fetch youtube video content details with call to youtube data api v3 endpoint: videos/list
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { ids } = req.query;

    if (!ids || typeof ids !== "string") {
        return res.status(400).json({
        error: "Missing video IDs",
        });
    }


    const videoIds = ids.split(",").filter(Boolean);

    if (videoIds.length === 0) {
        return res.status(400).json({
        error: "No video IDs provided",
        });
    }

    const params = new URLSearchParams({
        part: "contentDetails",
        id: videoIds.join(","),
        key: process.env.YOUTUBE_API_KEY!,
    });

    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos/?${params}`
    )
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