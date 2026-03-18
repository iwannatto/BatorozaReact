import type { Card } from "./Card";

export type Field = {
  lastCard: Card | null;
  lastPlayerId: number | null;
  currentPlayerId: number;
  underRevolution: boolean;
  currentDrawable: boolean;
};

export function newField(): Field {
  return {
    lastCard: null,
    lastPlayerId: null,
    currentPlayerId: 0,
    underRevolution: false,
    currentDrawable: false,
  };
}
