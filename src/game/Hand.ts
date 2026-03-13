import { Card } from "./Card";
import type { Field } from "./Field";
import { CardPlay, RevolutionPlay, PassPlay, type Play } from "./Play";

export class Hand {
  private cards: Card[];

  constructor(cards: Card[]) {
    this.cards = [...cards];
    this.sort();
  }

  private sort(): void {
    this.cards.sort((a, b) => {
      if (a.getN() !== b.getN()) return a.getN() - b.getN();
      return a.getColor() - b.getColor();
    });
  }

  private revolutions(): RevolutionPlay[] {
    const revolutions: RevolutionPlay[] = [];
    for (let n = 1; n <= 15; n++) {
      if (n === 8) continue;

      const nCards = this.cards.filter((card) => card.getN() === n);

      for (let i = 0; i < nCards.length - 2; i++) {
        for (let j = i + 1; j < nCards.length - 1; j++) {
          for (let k = j + 1; k < nCards.length; k++) {
            revolutions.push(
              new RevolutionPlay([nCards[i], nCards[j], nCards[k]]),
            );
          }
        }
      }
    }
    return revolutions;
  }

  clone(): Hand {
    return new Hand(this.cards);
  }

  add(card: Card): void {
    this.cards.push(card);
    this.sort();
  }

  discard(play: Play): void {
    if (!(play instanceof PassPlay)) {
      this.cards = this.cards.filter((card) => !play.includesCard(card));
    }
  }

  get length(): number {
    return this.cards.length;
  }

  toString(): string {
    return this.cards.map((c) => c.toString()).join(" ");
  }

  validPlays(field: Field): Play[] {
    const lastCard = field.getLastCard();
    const pass = new PassPlay();

    // 8上がり禁止
    if (this.cards.length === 1 && this.cards[0].isEight()) {
      return lastCard === null ? [] : [pass];
    }

    const validCards = this.cards.map((card) => new CardPlay(card));

    // 革命上がり禁止なので革命がvalidCardsに入るのは手札を4枚以上持っているときのみ
    const validCardsRevolutions: Play[] =
      this.cards.length >= 4
        ? [...validCards, ...this.revolutions()]
        : validCards;

    if (lastCard === null) {
      return validCardsRevolutions;
    } else if (lastCard.isEight()) {
      return [
        ...validCardsRevolutions.filter(
          (play) => play instanceof CardPlay && play.isEight(),
        ),
        pass,
      ];
    } else {
      return [
        ...validCardsRevolutions.filter(
          (play) =>
            play instanceof RevolutionPlay ||
            (play instanceof CardPlay &&
              play.isValidToField(field)),
        ),
        pass,
      ];
    }
  }
}
