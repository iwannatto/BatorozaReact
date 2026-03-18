import { produce, type Draft } from "immer";
import { newDeck, deckDraw, deckWillOut, type Deck } from "./Deck";
import {
  createHand,
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

// 山札切れのとき呼び出す。手札の少ない順に勝者を決定する。
function applyDeckOut(draft: Draft<GameState>): void {
  const minLength = Math.min(...draft.players.map(handLength));
  const winners = draft.players.reduce((acc, p, i) => {
    if (handLength(p) === minLength) acc.push(i);
    return acc;
  }, [] as number[]);
  draft.log.unshift(`deck out: player ${winners.join(", ")} win`);
  draft.phase = "game_over";
  draft.winners = winners;
}

export function applyDrawPhase(state: GameState, willDraw: boolean): GameState {
  return produce(state, draft => {
    const playerId = draft.field.currentPlayerId;
    const player = draft.players[playerId];

    // 一周して手札が0のまま（全員パスし続けた等）→ 勝利確定
    if (handHasWon(player)) {
      draft.log.unshift(`player ${playerId} win`);
      draft.phase = "game_over";
      draft.winners = [playerId];
      return;
    }

    if (willDraw) {
      const card = deckDraw(draft.deck);
      handAdd(player, card);
      if (deckWillOut(draft.deck)) {
        applyDeckOut(draft);
        return;
      }
    }

    const plays = validPlays(player, draft.field);

    if (plays.length === 0) {
      draft.log.unshift("can't do anything");
      draft.phase = "game_over";
      draft.winners = null;
      return;
    }

    draft.phase = "discard";
  });
}

export function applyDiscardPhase(state: GameState, play: Play): GameState {
  return produce(state, draft => {
    const field = draft.field;
    const playerId = field.currentPlayerId;
    const player = draft.players[playerId];
    const prevPendingWinner = draft.pendingWinner;

    const oldLastCard = field.lastCard;
    const oldLastPlayerId = field.lastPlayerId;

    handDiscard(player, play);
    draft.log.unshift(`${playerId} ${playToString(play)} | ${handLength(player)}`);

    // 攻撃
    if (play.kind === "card" && oldLastPlayerId !== null) {
      const attacked = draft.players[oldLastPlayerId];
      const n = attackN(play as CardPlay, field);
      if (n > 0) {
        draft.log.unshift(
          `attack ${n} from ${playerId} to ${oldLastPlayerId}`,
        );
        for (let i = 0; i < n; i++) {
          if (deckWillOut(draft.deck)) {
            applyDeckOut(draft);
            return;
          }
          const card = deckDraw(draft.deck);
          handAdd(attacked, card);
        }
        if (deckWillOut(draft.deck)) {
          applyDeckOut(draft);
          return;
        }
      }
    }

    // パス以外の行動 → 攻撃後に保留勝者の手札が0のまま → 勝利確定
    if (play.kind !== "pass") {
      if (prevPendingWinner !== null && handHasWon(draft.players[prevPendingWinner])) {
        draft.log.unshift(`player ${prevPendingWinner} win`);
        draft.phase = "game_over";
        draft.winners = [prevPendingWinner];
        return;
      }
      // 現プレイヤーが手札0 → 次の非パス行動まで保留
      draft.pendingWinner = handHasWon(player) ? playerId : null;
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

    draft.phase = field.currentPlayerId === 0 ? "draw" : "computer";
  });
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
