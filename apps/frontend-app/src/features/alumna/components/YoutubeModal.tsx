interface YoutubeModalProps {
  videoUrl: string;
  onClose: () => void;
}

export function YoutubeModal({ videoUrl, onClose }: YoutubeModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal__close" onClick={onClose}>
          Cerrar
        </button>
        <p>Reproductor YouTube — {videoUrl}</p>
      </div>
    </div>
  );
}
