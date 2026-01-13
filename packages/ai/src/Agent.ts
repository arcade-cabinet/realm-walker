import { GameEntity } from 'yuka';

export class Agent extends GameEntity {
    constructor() {
        super();
        // Default Yuka setup
        this.canSleep = false;
    }

    // Future: Add helper methods to attach goals, sensors, etc.
}
