interface StoryCardProps {
  titulo: string;
  subtitulo?: string;
}

export function StoryCard({ titulo, subtitulo }: StoryCardProps) {
  return (
    <article className="story-card">
      <h3>{titulo}</h3>
      {subtitulo ? <p>{subtitulo}</p> : null}
    </article>
  );
}
