import { Card } from "./Card";
import type { Field } from "./Field";

export type Play = CardPlay | RevolutionPlay | PassPlay;

export class CardPlay {
  private card: Card;

  constructor(card: Card) {
    this.card = card;
  }

  isEight(): boolean { return this.card.isEight(); }
  includesCard(card: Card): boolean { return this.card === card; }
  getCard(): Card { return this.card; }

  isValidToField(field: Field): boolean {
    const lastCard = field.getLastCard();
    if (lastCard === null) return true;
    const underRevolution = field.isUnderRevolution();
    if (this.card.getColor() === lastCard.getColor()) return false;
    return underRevolution
      ? this.card.getN() < lastCard.getN()
      : this.card.getN() > lastCard.getN();
  }

  attackN(field: Field): number {
    const fieldCard = field.getLastCard();
    if (fieldCard === null) return 0;

    const underRevolution = field.isUnderRevolution();
    const attackColor: [number, number][] = [[0, 1], [1, 0], [2, 3], [3, 2]];
    for (const [c1, c2] of attackColor) {
      if (this.card.getColor() === c1 && fieldCard.getColor() === c2) {
        let diff = this.card.getN() - fieldCard.getN();
        if (underRevolution) diff *= -1;
        return Math.floor(diff / 3);
      }
    }
    return 0;
  }

  toString(): string { return this.card.toString(); }
}

export class RevolutionPlay {
  private cards: Card[];

  constructor(cards: Card[]) {
    this.cards = cards;
  }

  includesCard(card: Card): boolean { return this.cards.includes(card); }
  toString(): string { return this.cards.map((c) => c.toString()).join(", "); }
}

export class PassPlay {
  toString(): string { return "pass"; }
}
