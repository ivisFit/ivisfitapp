"use client";

import { YoutubePlayer } from "@/components/YoutubePlayer";

type YoutubePreviewProps = {
  videoUrl: string;
  title: string;
};

export function YoutubePreview({ videoUrl, title }: YoutubePreviewProps) {
  return (
    <YoutubePlayer
      videoUrl={videoUrl}
      title={title}
      showOpenLink={false}
      unavailableMessage={
        <>
          Video no disponible — pasalo a <strong>No listado</strong> en YouTube,
          no Privado.
        </>
      }
    />
  );
}
