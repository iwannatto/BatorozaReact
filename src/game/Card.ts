export type Card = { n: number; color: number };

export function createCard(id: number): Card {
  return { n: (id % 15) + 1, color: Math.floor(id / 15) };
}

export function cardToString(card: Card): string {
  const colorStrings = ["Red", "Blue", "Yellow", "Green", "Orange"];
  return `${colorStrings[card.color]} ${card.n}`;
}
