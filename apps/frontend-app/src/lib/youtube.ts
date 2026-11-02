const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

function parseVideoUrl(videoUrl: string): URL | null {
  const trimmed = videoUrl.trim();
  if (!trimmed) return null;

  const withProtocol = /^[a-z][a-z\d+\-.]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol);
  } catch {
    return null;
  }
}

function cleanVideoId(value: string): string | null {
  const id = value.split(/[?&#]/)[0]?.trim() ?? "";
  return YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

function isYoutubeHost(hostname: string): boolean {
  return (
    hostname === "youtu.be" ||
    hostname === "youtube.com" ||
    hostname === "youtube-nocookie.com" ||
    hostname.endsWith(".youtube.com") ||
    hostname.endsWith(".youtube-nocookie.com")
  );
}

export function getYoutubeVideoId(videoUrl: string): string | null {
  const url = parseVideoUrl(videoUrl);
  if (!url) return null;

  const hostname = url.hostname.replace(/^www\./, "");
  if (!isYoutubeHost(hostname)) return null;

  if (hostname === "youtu.be") {
    return cleanVideoId(url.pathname.split("/").filter(Boolean)[0] ?? "");
  }

  if (url.pathname === "/watch") {
    return cleanVideoId(url.searchParams.get("v") ?? "");
  }

  const [kind, id] = url.pathname.split("/").filter(Boolean);
  if (kind === "embed" || kind === "shorts" || kind === "live" || kind === "v") {
    return cleanVideoId(id ?? "");
  }

  return null;
}

export function getYoutubeEmbedUrl(videoUrl: string): string | null {
  const videoId = getYoutubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
}

export function getYoutubePlaybackUrl(
  videoUrl: string,
  options?: { autoplay?: boolean },
): string | null {
  const embedUrl = getYoutubeEmbedUrl(videoUrl);
  if (!embedUrl) return null;

  const params = new URLSearchParams({
    playsinline: "1",
    rel: "0",
  });
  if (options?.autoplay) params.set("autoplay", "1");
  return `${embedUrl}?${params.toString()}`;
}

export function getYoutubeWatchUrl(videoUrl: string): string | null {
  const videoId = getYoutubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

export function getYoutubeThumbnailUrl(videoUrl: string): string | null {
  const videoId = getYoutubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}
