import { World } from './World';

// Abstract input state
export type InputState = {
    axis: { x: number; y: number };
    actions: Set<string>;
};

// Component to attach input state to an entity (e.g., the Player)
export type InputComponent = {
    input: InputState;
};

export class InputSystem {
    // Current state
    public state: InputState = {
        axis: { x: 0, y: 0 },
        actions: new Set(),
    };

    constructor(private world: World) { }

    // Update the input component on controlled entities
    update() {
        // In a real implementation, we'd query for entities with a "PlayerController" tag
        // For now, this is a placeholder for the system logic
    }

    // API for external sources (Window, CLI) to feed input
    setAxis(x: number, y: number) {
        this.state.axis.x = x;
        this.state.axis.y = y;
    }

    pressAction(action: string) {
        this.state.actions.add(action);
    }

    releaseAction(action: string) {
        this.state.actions.delete(action);
    }
}
