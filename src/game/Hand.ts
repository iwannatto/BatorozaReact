import { cardToString, type Card } from "./Card";
import type { Field } from "./Field";
import {
  type Play,
  type CardPlay,
  type RevolutionPlay,
  type PassPlay,
  playIncludesCard,
  isValidToField,
} from "./Play";

export type Hand = { cards: Card[] };

function sortCards(cards: Card[]): void {
  cards.sort((a, b) => {
    if (a.n !== b.n) return a.n - b.n;
    return a.color - b.color;
  });
}

export function createHand(cards: Card[]): Hand {
  const sorted = [...cards];
  sortCards(sorted);
  return { cards: sorted };
}

export function cloneHand(hand: Hand): Hand {
  return { cards: [...hand.cards] };
}

export function handAdd(hand: Hand, card: Card): void {
  hand.cards.push(card);
  sortCards(hand.cards);
}

export function handDiscard(hand: Hand, play: Play): void {
  if (play.kind !== "pass") {
    hand.cards = hand.cards.filter((card) => !playIncludesCard(play, card));
  }
}

export function handLength(hand: Hand): number {
  return hand.cards.length;
}

export function handToString(hand: Hand): string {
  return hand.cards.map(cardToString).join(" ");
}

export function handHasWon(hand: Hand): boolean {
  return hand.cards.length === 0;
}

function revolutions(hand: Hand): RevolutionPlay[] {
  const result: RevolutionPlay[] = [];
  for (let n = 1; n <= 15; n++) {
    if (n === 8) continue;

    const nCards = hand.cards.filter((card) => card.n === n);

    for (let i = 0; i < nCards.length - 2; i++) {
      for (let j = i + 1; j < nCards.length - 1; j++) {
        for (let k = j + 1; k < nCards.length; k++) {
          result.push({ kind: "revolution", cards: [nCards[i], nCards[j], nCards[k]] });
        }
      }
    }
  }
  return result;
}

export function validPlays(hand: Hand, field: Field): Play[] {
  const lastCard = field.lastCard;
  const pass: PassPlay = { kind: "pass" };

  // 8上がり禁止
  if (hand.cards.length === 1 && hand.cards[0].n === 8) {
    return lastCard === null ? [] : [pass];
  }

  const validCards: CardPlay[] = hand.cards.map((card) => ({ kind: "card" as const, card }));

  // 革命上がり禁止なので革命がvalidCardsに入るのは手札を4枚以上持っているときのみ
  const validCardsRevolutions: Play[] =
    hand.cards.length >= 4
      ? [...validCards, ...revolutions(hand)]
      : validCards;

  if (lastCard === null) {
    return validCardsRevolutions;
  } else if (lastCard.n === 8) {
    return [
      ...validCardsRevolutions.filter(
        (play): play is CardPlay => play.kind === "card" && play.card.n === 8,
      ),
      pass,
    ];
  } else {
    return [
      ...validCardsRevolutions.filter(
        (play) =>
          play.kind === "revolution" ||
          (play.kind === "card" && isValidToField(play, field)),
      ),
      pass,
    ];
  }
}
