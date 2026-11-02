type YoutubeFrameProps = {
  src: string;
  title: string;
  loading?: "eager" | "lazy";
  className?: string;
};

export function YoutubeFrame({
  src,
  title,
  loading = "lazy",
  className,
}: YoutubeFrameProps) {
  return (
    <iframe
      className={className}
      title={title}
      src={src}
      loading={loading}
      referrerPolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      style={{ border: 0 }}
    />
  );
}
