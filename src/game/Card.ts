export class Card {
  private readonly n: number;
  private readonly color: number;

  constructor(id: number) {
    this.n = (id % 15) + 1;
    this.color = Math.floor(id / 15);
  }

  isEight(): boolean {
    return this.n === 8;
  }

  getN(): number {
    return this.n;
  }

  getColor(): number {
    return this.color;
  }

  toString(): string {
    const colorStrings = ["Red", "Blue", "Yellow", "Green", "Orange"];
    return `${colorStrings[this.color]} ${this.n}`;
  }
}

export class NoCard {}
