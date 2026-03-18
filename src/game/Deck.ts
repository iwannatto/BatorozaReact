import { createCard, type Card } from "./Card";

// よくわからんけどarrayの中身を均等にシャッフルしたことになるらしい
function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[r];
    array[r] = tmp;
  }
}

export type Deck = { cards: Card[] };

export function newDeck(): Deck {
  const cards = Array.from({ length: 75 }, (_, k) => createCard(k));
  shuffle(cards);
  return { cards };
}

export function deckWillOut(deck: Deck): boolean {
  return deck.cards.length === 0;
}

export function deckDraw(deck: Deck): Card {
  const card = deck.cards.shift();
  if (card === undefined) {
    throw new Error("deck out");
  }
  return card;
}
