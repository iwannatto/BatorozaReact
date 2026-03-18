import { newDeck, deckDraw, deckWillOut, type Deck } from "./Deck";
import {
  createHand,
  cloneHand,
  handAdd,
  handDiscard,
  handLength,
  handHasWon,
  validPlays,
  type Hand,
} from "./Hand";
import { newField, type Field } from "./Field";
import { attackN, playToString, type CardPlay, type Play } from "./Play";

export type Phase = "draw" | "discard" | "computer" | "game_over";
export type { Play } from "./Play";

export type GameState = {
  deck: Deck;
  players: Hand[];
  field: Field;
  log: string[];
  phase: Phase;
  winners: number[] | null;
  pendingWinner: number | null;
};

export function newGame(): GameState {
  const deck = newDeck();
  return {
    deck,
    players: Array.from(
      { length: 4 },
      () => createHand(Array.from({ length: 5 }, () => deckDraw(deck))),
    ),
    field: newField(),
    log: [],
    phase: "draw",
    winners: null,
    pendingWinner: null,
  };
}

function cloneState(state: GameState): GameState {
  return {
    deck: { cards: [...state.deck.cards] },
    players: state.players.map(cloneHand),
    field: { ...state.field },
    log: [...state.log],
    phase: state.phase,
    winners: state.winners,
    pendingWinner: state.pendingWinner,
  };
}

// 山札切れのとき呼び出す。手札の少ない順に勝者を決定する。
function applyDeckOut(state: GameState): GameState {
  const minLength = Math.min(...state.players.map(handLength));
  const winners = state.players.reduce((acc, p, i) => {
    if (handLength(p) === minLength) acc.push(i);
    return acc;
  }, [] as number[]);
  state.log.unshift(`deck out: player ${winners.join(", ")} win`);
  state.phase = "game_over";
  state.winners = winners;
  return state;
}

export function applyDrawPhase(state: GameState, willDraw: boolean): GameState {
  const newState = cloneState(state);
  const playerId = newState.field.currentPlayerId;
  const player = newState.players[playerId];

  // 一周して手札が0のまま（全員パスし続けた等）→ 勝利確定
  if (handHasWon(player)) {
    newState.log.unshift(`player ${playerId} win`);
    newState.phase = "game_over";
    newState.winners = [playerId];
    return newState;
  }

  if (willDraw) {
    const card = deckDraw(newState.deck);
    handAdd(player, card);
    if (deckWillOut(newState.deck)) {
      return applyDeckOut(newState);
    }
  }

  const plays = validPlays(player, newState.field);

  if (plays.length === 0) {
    newState.log.unshift("can't do anything");
    newState.phase = "game_over";
    newState.winners = null;
    return newState;
  }

  newState.phase = "discard";
  return newState;
}

export function applyDiscardPhase(state: GameState, play: Play): GameState {
  const newState = cloneState(state);
  const field = newState.field;
  const playerId = field.currentPlayerId;
  const player = newState.players[playerId];
  const prevPendingWinner = newState.pendingWinner;

  const oldLastCard = field.lastCard;
  const oldLastPlayerId = field.lastPlayerId;

  handDiscard(player, play);
  newState.log.unshift(`${playerId} ${playToString(play)} | ${handLength(player)}`);

  // 攻撃
  if (play.kind === "card" && oldLastPlayerId !== null) {
    const attacked = newState.players[oldLastPlayerId];
    const n = attackN(play as CardPlay, field);
    if (n > 0) {
      newState.log.unshift(
        `attack ${n} from ${playerId} to ${oldLastPlayerId}`,
      );
      for (let i = 0; i < n; i++) {
        if (deckWillOut(newState.deck)) {
          return applyDeckOut(newState);
        }
        const card = deckDraw(newState.deck);
        handAdd(attacked, card);
      }
      if (deckWillOut(newState.deck)) {
        return applyDeckOut(newState);
      }
    }
  }

  // パス以外の行動 → 攻撃後に保留勝者の手札が0のまま → 勝利確定
  if (play.kind !== "pass") {
    if (prevPendingWinner !== null && handHasWon(newState.players[prevPendingWinner])) {
      newState.log.unshift(`player ${prevPendingWinner} win`);
      newState.phase = "game_over";
      newState.winners = [prevPendingWinner];
      return newState;
    }
    // 現プレイヤーが手札0 → 次の非パス行動まで保留
    newState.pendingWinner = handHasWon(player) ? playerId : null;
  }
  // パスのとき: pendingWinner はそのまま（攻撃の可能性が残るため）

  // 革命の反映
  if (play.kind === "revolution") {
    field.underRevolution = !field.underRevolution;
  }

  // 8切り返し判定
  const isEightReturn =
    play.kind === "card" &&
    play.card.n === 8 &&
    oldLastCard !== null &&
    oldLastCard.n === 8;

  // フィールドの更新
  if (play.kind === "pass") {
    if (oldLastPlayerId !== null && oldLastPlayerId === (playerId + 1) % 4) {
      field.lastCard = null;
      field.lastPlayerId = null;
    }
  } else if (play.kind === "revolution" || isEightReturn) {
    field.lastCard = null;
    field.lastPlayerId = null;
  } else {
    // play.kind === "card" かつ 8切り返しでない
    field.lastCard = (play as CardPlay).card;
    field.lastPlayerId = playerId;
  }

  // 次プレイヤーの決定
  field.currentPlayerId = isEightReturn ? playerId : (playerId + 1) % 4;

  // currentDrawable の更新
  field.currentDrawable = field.lastCard !== null && field.lastCard.n !== 8;

  newState.phase = field.currentPlayerId === 0 ? "draw" : "computer";
  return newState;
}

export function applyComputerTurn(state: GameState): GameState {
  if (state.phase !== "computer" || state.field.currentPlayerId === 0) return state;

  const willDraw = Math.random() < 0.1 && state.field.currentDrawable;
  const afterDraw = applyDrawPhase(state, willDraw);
  if (afterDraw.phase === "game_over") return afterDraw;

  const playerId = afterDraw.field.currentPlayerId;
  const player = afterDraw.players[playerId];
  const plays = validPlays(player, afterDraw.field);
  const play = plays[Math.floor(Math.random() * plays.length)];
  return applyDiscardPhase(afterDraw, play);
}
