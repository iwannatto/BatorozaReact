import { Deck } from "./Deck";
import { Hand } from "./Hand";
import { Player } from "./Player";
import { Field } from "./Field";
import { CardPlay, RevolutionPlay, PassPlay, type Play } from "./Play";

export type Phase = "draw" | "discard" | "computer" | "game_over";
export type { Play } from "./Play";

// ---- GameState ----

type GameStateData = {
  deck: Deck;
  players: Player[];
  field: Field;
  log: string[];
  phase: Phase;
  winners: number[] | null;
  pendingWinner: number | null;
};

export class GameState {
  private deck: Deck;
  private players: Player[];
  private field: Field;
  private log: string[];
  private phase: Phase;
  private winners: number[] | null;
  private pendingWinner: number | null;

  private constructor(data: GameStateData) {
    this.deck = data.deck;
    this.players = data.players;
    this.field = data.field;
    this.log = data.log;
    this.phase = data.phase;
    this.winners = data.winners;
    this.pendingWinner = data.pendingWinner;
  }

  static newGame(): GameState {
    const deck = Deck.newDeck();
    return new GameState({
      deck,
      players: Array.from(
        { length: 4 },
        () =>
          new Player(new Hand(Array.from({ length: 5 }, () => deck.draw()))),
      ),
      field: Field.newField(),
      log: [],
      phase: "draw",
      winners: null,
      pendingWinner: null,
    });
  }

  private clone(): GameState {
    return new GameState({
      deck: this.deck.clone(),
      players: this.players.map((p) => p.clone()),
      field: this.field.clone(),
      log: [...this.log],
      phase: this.phase,
      winners: this.winners,
      pendingWinner: this.pendingWinner,
    });
  }

  // 山札切れのとき呼び出す。手札の少ない順に勝者を決定する。
  private applyDeckOut(): GameState {
    const minLength = Math.min(...this.players.map((p) => p.handLength()));
    const winners = this.players.reduce((acc, p, i) => {
      if (p.handLength() === minLength) acc.push(i);
      return acc;
    }, [] as number[]);
    this.log.unshift(`deck out: player ${winners.join(", ")} win`);
    this.phase = "game_over";
    this.winners = winners;
    return this;
  }

  humanPlayer(): Player {
    return this.players[0];
  }
  getField(): Field {
    return this.field;
  }
  getPhase(): Phase {
    return this.phase;
  }
  getWinners(): number[] | null {
    return this.winners;
  }
  getLog(): string[] {
    return this.log;
  }
  gameFinished(): boolean {
    return this.phase === "game_over";
  }

  applyDrawPhase(willDraw: boolean): GameState {
    const newState = this.clone();
    const playerId = newState.field.getCurrentPlayerId();
    const player = newState.players[playerId];

    // 一周して手札が0のまま（全員パスし続けた等）→ 勝利確定
    if (player.hasWon()) {
      newState.log.unshift(`player ${playerId} win`);
      newState.phase = "game_over";
      newState.winners = [playerId];
      return newState;
    }

    if (willDraw) {
      const card = newState.deck.draw();
      player.addToHand(card);
      if (newState.deck.willOut()) {
        return newState.applyDeckOut();
      }
    }

    const validPlays = player.validPlays(newState.field);

    if (validPlays.length === 0) {
      newState.log.unshift("can't do anything");
      newState.phase = "game_over";
      newState.winners = null;
      return newState;
    }

    newState.phase = "discard";
    return newState;
  }

  applyDiscardPhase(play: Play): GameState {
    const newState = this.clone();
    const { field } = newState;
    const playerId = field.getCurrentPlayerId();
    const player = newState.players[playerId];
    const prevPendingWinner = newState.pendingWinner;

    const oldLastCard = field.getLastCard();
    const oldLastPlayerId = field.getLastPlayerId();

    player.discard(play);
    newState.log.unshift(`${playerId} ${play} | ${player.handLength()}`);

    // 攻撃
    if (play instanceof CardPlay && oldLastPlayerId !== null) {
      const attacked = newState.players[oldLastPlayerId];
      const n = play.attackN(field);
      if (n > 0) {
        newState.log.unshift(
          `attack ${n} from ${playerId} to ${oldLastPlayerId}`,
        );
        for (let i = 0; i < n; i++) {
          if (newState.deck.willOut()) {
            return newState.applyDeckOut();
          }
          const card = newState.deck.draw();
          attacked.addToHand(card);
        }
        if (newState.deck.willOut()) {
          return newState.applyDeckOut();
        }
      }
    }

    // パス以外の行動 → 攻撃後に保留勝者の手札が0のまま → 勝利確定
    if (!(play instanceof PassPlay)) {
      if (prevPendingWinner !== null && newState.players[prevPendingWinner].hasWon()) {
        newState.log.unshift(`player ${prevPendingWinner} win`);
        newState.phase = "game_over";
        newState.winners = [prevPendingWinner];
        return newState;
      }
      // 現プレイヤーが手札0 → 次の非パス行動まで保留
      newState.pendingWinner = player.hasWon() ? playerId : null;
    }
    // パスのとき: pendingWinner はそのまま（攻撃の可能性が残るため）

    // 革命の反映
    if (play instanceof RevolutionPlay) {
      field.setUnderRevolution(!field.isUnderRevolution());
    }

    // 8切り返し判定
    const isEightReturn =
      play instanceof CardPlay &&
      play.isEight() &&
      oldLastCard !== null &&
      oldLastCard.isEight();

    // フィールドの更新
    if (play instanceof PassPlay) {
      if (oldLastPlayerId !== null && oldLastPlayerId === (playerId + 1) % 4) {
        field.setLastCard(null);
        field.setLastPlayerId(null);
      }
    } else if (play instanceof RevolutionPlay || isEightReturn) {
      field.setLastCard(null);
      field.setLastPlayerId(null);
    } else {
      field.setLastCard(play.getCard());
      field.setLastPlayerId(playerId);
    }

    // 次プレイヤーの決定
    field.setCurrentPlayerId(isEightReturn ? playerId : (playerId + 1) % 4);

    // currentDrawable の更新
    const newLastCard = field.getLastCard();
    field.setCurrentDrawable(newLastCard !== null && !newLastCard.isEight());

    newState.phase = field.isHumanTurn() ? "draw" : "computer";
    return newState;
  }

  applyComputerTurn(): GameState {
    if (this.phase !== "computer" || this.field.isHumanTurn()) return this;

    const willDraw = Math.random() < 0.1 && this.field.getCurrentDrawable();
    const afterDraw = this.applyDrawPhase(willDraw);
    if (afterDraw.phase === "game_over") return afterDraw;

    const playerId = afterDraw.field.getCurrentPlayerId();
    const player = afterDraw.players[playerId];
    const validPlays = player.validPlays(afterDraw.field);
    const play = validPlays[Math.floor(Math.random() * validPlays.length)];
    return afterDraw.applyDiscardPhase(play);
  }
}
