import seedrandom from 'seedrandom';

export class Prng {
  private rng: seedrandom.PRNG;

  constructor(seed: string) {
    this.rng = seedrandom(seed);
  }

  next(): number {
    return this.rng();
  }

  range(min: number, max: number): number {
    return min + this.rng() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }

  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length)];
  }
}
