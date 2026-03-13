interface DrawControlsProps {
  drawButtonActive: boolean;
  notDrawButtonActive: boolean;
  onDraw: () => void;
  onNotDraw: () => void;
}

export default function DrawControls({
  drawButtonActive,
  notDrawButtonActive,
  onDraw,
  onNotDraw,
}: DrawControlsProps) {
  return (
    <div>
      {drawButtonActive && (
        <button onClick={onDraw}>draw</button>
      )}
      {notDrawButtonActive && (
        <button onClick={onNotDraw}>not draw</button>
      )}
    </div>
  );
}
