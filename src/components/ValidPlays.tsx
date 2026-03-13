import type { Play } from "../game/Play";

interface ValidPlaysProps {
  plays: Play[];
  onPlay: (play: Play) => void;
}

export default function ValidPlays({ plays, onPlay }: ValidPlaysProps) {
  if (plays.length === 0) return null;

  return (
    <div>
      {plays.map((play, i) => (
        <button key={i} onClick={() => onPlay(play)}>
          {play.toString()}
        </button>
      ))}
    </div>
  );
}
