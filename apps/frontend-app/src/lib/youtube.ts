export function getYoutubeVideoId(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace(/^www\./, "");
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (hostname === "youtube.com" || hostname.endsWith(".youtube.com")) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") ?? "";
      } else {
        const [kind, id] = url.pathname.split("/").filter(Boolean);
        if (kind === "embed" || kind === "shorts" || kind === "live") {
          videoId = id ?? "";
        }
      }
    }

    return videoId || null;
  } catch {
    return null;
  }
}

export function getYoutubeEmbedUrl(videoUrl: string) {
  const videoId = getYoutubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
}

export function getYoutubeThumbnailUrl(videoUrl: string) {
  const videoId = getYoutubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}
