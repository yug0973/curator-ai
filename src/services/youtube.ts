export interface YouTubeVideoDetails {
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishDate: string;
}

/**
 * Fetches basic video details from the YouTube Data API v3.
 * The API key should be provided via the REACT_APP_YOUTUBE_API_KEY environment variable.
 * This endpoint is free up to the quota limits (10,000 units per day).
 */
export async function fetchYouTubeVideoDetails(
  videoId: string,
  apiKey?: string
): Promise<YouTubeVideoDetails> {
  const key = apiKey ?? process.env.REACT_APP_YOUTUBE_API_KEY;
  if (!key) {
    throw new Error('YouTube API key is missing. Set REACT_APP_YOUTUBE_API_KEY in .env.');
  }
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${key}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`YouTube API error: ${resp.status} ${txt}`);
  }
  const data = await resp.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('Video not found or API quota exceeded.');
  }
  const snippet = data.items[0].snippet;
  return {
    title: snippet.title,
    description: snippet.description,
    thumbnailUrl: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.default?.url,
    channelTitle: snippet.channelTitle,
    publishDate: snippet.publishedAt,
  };
}
