import { cardToString, type Card } from "./Card";
import type { Field } from "./Field";

export type CardPlay = { kind: "card"; card: Card };
export type RevolutionPlay = { kind: "revolution"; cards: Card[] };
export type PassPlay = { kind: "pass" };
export type Play = CardPlay | RevolutionPlay | PassPlay;

export function playIncludesCard(play: Play, card: Card): boolean {
  if (play.kind === "card") return play.card === card;
  if (play.kind === "revolution") return play.cards.includes(card);
  return false;
}

export function isValidToField(play: CardPlay, field: Field): boolean {
  const lastCard = field.lastCard;
  if (lastCard === null) return true;
  if (play.card.color === lastCard.color) return false;
  return field.underRevolution
    ? play.card.n < lastCard.n
    : play.card.n > lastCard.n;
}

export function attackN(play: CardPlay, field: Field): number {
  const fieldCard = field.lastCard;
  if (fieldCard === null) return 0;

  const attackColor: [number, number][] = [[0, 1], [1, 0], [2, 3], [3, 2]];
  for (const [c1, c2] of attackColor) {
    if (play.card.color === c1 && fieldCard.color === c2) {
      let diff = play.card.n - fieldCard.n;
      if (field.underRevolution) diff *= -1;
      return Math.floor(diff / 3);
    }
  }
  return 0;
}

export function playToString(play: Play): string {
  if (play.kind === "card") return cardToString(play.card);
  if (play.kind === "revolution") return play.cards.map(cardToString).join(", ");
  return "pass";
}
