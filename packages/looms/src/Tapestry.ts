/**
 * TAPESTRY: The "Weave" or Context Container.
 * 
 * It holds the evolving state of the Realm generation.
 * Looms read from the Tapestry (Warp) and write to the Tapestry (Weft).
 */

export class Tapestry<TState = Record<string, any>> {
    private state: TState;

    constructor(initialState: TState) {
        this.state = initialState;
    }

    /**
     * Reads a value from the Tapestry.
     */
    get<K extends keyof TState>(key: K): TState[K] {
        return this.state[key];
    }

    /**
     * Wefts (Writes) a value into the Tapestry.
     */
    weave<K extends keyof TState>(key: K, value: TState[K]): void {
        this.state[key] = value;
    }

    /**
     * Returns the full snapshot of the Tapestry.
     */
    snapshot(): TState {
        return { ...this.state };
    }
}
