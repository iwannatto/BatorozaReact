import { Card } from "./Card";

type FieldData = {
  lastCard: Card | null;
  lastPlayerId: number | null;
  currentPlayerId: number;
  underRevolution: boolean;
  currentDrawable: boolean;
};

export class Field {
  private lastCard: Card | null;
  private lastPlayerId: number | null;
  private currentPlayerId: number;
  private underRevolution: boolean;
  private currentDrawable: boolean;

  private constructor(data: FieldData) {
    this.lastCard = data.lastCard;
    this.lastPlayerId = data.lastPlayerId;
    this.currentPlayerId = data.currentPlayerId;
    this.underRevolution = data.underRevolution;
    this.currentDrawable = data.currentDrawable;
  }

  static newField(): Field {
    return new Field({
      lastCard: null,
      lastPlayerId: null,
      currentPlayerId: 0,
      underRevolution: false,
      currentDrawable: false,
    });
  }

  clone(): Field {
    return new Field({
      lastCard: this.lastCard,
      lastPlayerId: this.lastPlayerId,
      currentPlayerId: this.currentPlayerId,
      underRevolution: this.underRevolution,
      currentDrawable: this.currentDrawable,
    });
  }

  getLastCard(): Card | null { return this.lastCard; }
  setLastCard(card: Card | null) { this.lastCard = card; }

  getLastPlayerId(): number | null { return this.lastPlayerId; }
  setLastPlayerId(id: number | null) { this.lastPlayerId = id; }

  getCurrentPlayerId(): number { return this.currentPlayerId; }
  setCurrentPlayerId(id: number) { this.currentPlayerId = id; }

  getCurrentDrawable(): boolean { return this.currentDrawable; }
  setCurrentDrawable(v: boolean) { this.currentDrawable = v; }

  isUnderRevolution(): boolean { return this.underRevolution; }
  setUnderRevolution(v: boolean) { this.underRevolution = v; }

  isHumanTurn(): boolean { return this.currentPlayerId === 0; }
}
