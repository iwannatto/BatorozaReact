import { useState, useEffect, useCallback } from "react";
import {
  newGame,
  applyDrawPhase,
  applyDiscardPhase,
  applyComputerTurn,
  type Play,
} from "./game/gameLogic";
import { handToString, validPlays } from "./game/Hand";
import DrawControls from "./components/DrawControls";
import ValidPlays from "./components/ValidPlays";
import GameLog from "./components/GameLog";
import "./App.css";

export default function App() {
  const [state, setState] = useState(newGame);

  // コンピュータのターンを 100ms 間隔で実行
  useEffect(() => {
    const id = setInterval(() => {
      setState(s => applyComputerTurn(s));
    }, 100);
    return () => clearInterval(id);
  }, []);

  const handleDrawTrue  = useCallback(() => setState(s => applyDrawPhase(s, true)), []);
  const handleDrawFalse = useCallback(() => setState(s => applyDrawPhase(s, false)), []);
  const handleDiscard   = useCallback((play: Play) => setState(s => applyDiscardPhase(s, play)), []);

  const humanPlayer = state.players[0];
  const field = state.field;
  const isHumanTurn = field.currentPlayerId === 0;
  const inDrawPhase = state.phase === "draw";
  const inDiscardPhase = state.phase === "discard";

  const drawButtonActive = isHumanTurn && inDrawPhase && field.currentDrawable;
  const notDrawButtonActive = isHumanTurn && inDrawPhase;
  const validPlaysActive = isHumanTurn && inDiscardPhase;

  return (
    <div id="vm">
      <div>{handToString(humanPlayer)}</div>

      <DrawControls
        drawButtonActive={drawButtonActive}
        notDrawButtonActive={notDrawButtonActive}
        onDraw={handleDrawTrue}
        onNotDraw={handleDrawFalse}
      />

      <ValidPlays
        plays={validPlaysActive ? validPlays(humanPlayer, field) : []}
        onPlay={handleDiscard}
      />

      {state.phase === "game_over" && (
        <div>
          <p>
            {state.winners !== null
              ? `player ${state.winners.join(", ")} win`
              : "詰まり：終了"}
          </p>
          <button onClick={() => setState(newGame())}>restart</button>
        </div>
      )}

      <GameLog log={state.log} />
    </div>
  );
}
