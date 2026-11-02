const YOUTUBE_ORIGINS =
  '"https://www.youtube.com" "https://www.youtube-nocookie.com"';

export const PERMISSIONS_POLICY = [
  "camera=(self)",
  "microphone=()",
  "geolocation=()",
  `autoplay=(self ${YOUTUBE_ORIGINS})`,
  `encrypted-media=(self ${YOUTUBE_ORIGINS})`,
  `fullscreen=(self ${YOUTUBE_ORIGINS})`,
  `picture-in-picture=(self ${YOUTUBE_ORIGINS})`,
].join(", ");
