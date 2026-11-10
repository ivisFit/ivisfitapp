"use client";

type DayCloseUndoBarProps = {
  message: string;
  busy: boolean;
  error: string | null;
  onUndo: () => void;
};

export function DayCloseUndoBar({
  message,
  busy,
  error,
  onUndo,
}: DayCloseUndoBarProps) {
  return (
    <div className="day-close-undo" role="status">
      <p>{error ?? message}</p>
      <button type="button" onClick={onUndo} disabled={busy}>
        {busy ? "Deshaciendo…" : "Deshacer"}
      </button>
    </div>
  );
}
