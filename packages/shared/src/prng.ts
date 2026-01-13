import seedrandom from 'seedrandom';

export class Prng {
  private rng: seedrandom.PRNG;
  private seed: string;
  private _callCount: number = 0;

  constructor(seed: string) {
    this.seed = seed;
    this.rng = seedrandom(seed);
  }

  next(): number {
    this._callCount++;
    return this.rng();
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max));
  }

  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length)];
  }

  // Get current RNG state for serialization
  getState(): string {
    return JSON.stringify({
      seed: this.seed,
      callCount: this._callCount
    });
  }

  // Restore RNG state from serialized data
  setState(state: string): void {
    try {
      const parsed = JSON.parse(state);
      this.seed = parsed.seed;
      this.rng = seedrandom(this.seed);
      this._callCount = 0;
      
      // Advance RNG to match previous state
      for (let i = 0; i < (parsed.callCount || 0); i++) {
        this.rng();
        this._callCount++;
      }
    } catch (error) {
      // Fallback: reinitialize with seed
      this.rng = seedrandom(this.seed);
      this._callCount = 0;
    }
  }

  // Get the original seed
  getSeed(): string {
    return this.seed;
  }
}