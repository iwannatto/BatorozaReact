import { Card } from "./Card";

// よくわからんけどarrayの中身を均等にシャッフルしたことになるらしい
function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];
    array[i] = array[r];
    array[r] = tmp;
  }
}

export class Deck {
  private cards: Card[];

  private constructor(cards: Card[]) {
    this.cards = cards;
  }

  static newDeck(): Deck {
    const cards = Array.from({ length: 75 }, (_, k) => new Card(k));
    shuffle(cards);
    return new Deck(cards);
  }

  clone(): Deck {
    return new Deck([...this.cards]);
  }

  willOut(): boolean {
    return this.cards.length === 0;
  }

  draw(): Card {
    const card = this.cards.shift();
    if (card === undefined) {
      throw new Error("deck out");
    }
    return card;
  }
}
