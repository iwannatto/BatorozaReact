import { Card } from "./Card";
import type { Play } from "./Play";
import { Hand } from "./Hand";
import type { Field } from "./Field";

export class Player {
  private readonly hand: Hand;

  constructor(hand: Hand) {
    this.hand = hand;
  }

  clone(): Player {
    return new Player(this.hand.clone());
  }

  addToHand(card: Card): void {
    this.hand.add(card);
  }

  handString(): string {
    return this.hand.toString();
  }

  handLength(): number {
    return this.hand.length;
  }

  validPlays(field: Field): Play[] {
    return this.hand.validPlays(field);
  }

  discard(play: Play): void {
    this.hand.discard(play);
  }

  hasWon(): boolean {
    return this.hand.length === 0;
  }
}
