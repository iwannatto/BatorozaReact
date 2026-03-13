interface GameLogProps {
  log: string[];
}

export default function GameLog({ log }: GameLogProps) {
  return (
    <ul>
      {log.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}
