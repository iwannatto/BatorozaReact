import { useState, useEffect, useCallback } from "react";
import { GameState, type Play } from "./game/gameLogic";
import DrawControls from "./components/DrawControls";
import ValidPlays from "./components/ValidPlays";
import GameLog from "./components/GameLog";
import "./App.css";

export default function App() {
  const [state, setState] = useState(() => GameState.newGame());

  // コンピュータのターンを 100ms 間隔で実行
  useEffect(() => {
    const id = setInterval(() => {
      setState(s => s.applyComputerTurn());
    }, 100);
    return () => clearInterval(id);
  }, []);

  const handleDrawTrue  = useCallback(() => setState(s => s.applyDrawPhase(true)), []);
  const handleDrawFalse = useCallback(() => setState(s => s.applyDrawPhase(false)), []);
  const handleDiscard   = useCallback((play: Play) => setState(s => s.applyDiscardPhase(play)), []);

  const humanPlayer = state.humanPlayer();
  const field = state.getField();
  const isHumanTurn = field.isHumanTurn();
  const inDrawPhase = state.getPhase() === "draw";
  const inDiscardPhase = state.getPhase() === "discard";

  const drawButtonActive = isHumanTurn && inDrawPhase && field.getCurrentDrawable();
  const notDrawButtonActive = isHumanTurn && inDrawPhase;
  const validPlaysActive = isHumanTurn && inDiscardPhase;

  return (
    <div id="vm">
      <div>{humanPlayer.handString()}</div>

      <DrawControls
        drawButtonActive={drawButtonActive}
        notDrawButtonActive={notDrawButtonActive}
        onDraw={handleDrawTrue}
        onNotDraw={handleDrawFalse}
      />

      <ValidPlays
        plays={validPlaysActive ? humanPlayer.validPlays(field) : []}
        onPlay={handleDiscard}
      />

      {state.gameFinished() && (
        <div>
          <p>
            {state.getWinners() !== null
              ? `player ${state.getWinners()!.join(", ")} win`
              : "詰まり：終了"}
          </p>
          <button onClick={() => setState(GameState.newGame())}>restart</button>
        </div>
      )}

      <GameLog log={state.getLog()} />
    </div>
  );
}
