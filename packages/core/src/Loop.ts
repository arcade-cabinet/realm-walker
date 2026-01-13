import { TIME_CONSTANTS } from '@realm-walker/shared';

type System = (dt: number) => void;

export class Loop {
    private running = false;
    private lastTime = 0;
    private accumulator = 0;
    private readonly dt = TIME_CONSTANTS.FIXED_DT;
    private systems: System[] = [];

    constructor() { }

    addSystem(system: System) {
        this.systems.push(system);
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.tick();
    }

    stop() {
        this.running = false;
    }

    private tick = () => {
        if (!this.running) return;

        const time = performance.now();
        const frameTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // Cap frame time to avoid spiral of death on lag spikes (max 0.25s)
        this.accumulator += Math.min(frameTime, 0.25);

        // Fixed Timestep Loop: Consume accumulated time
        while (this.accumulator >= this.dt) {
            this.update(this.dt);
            this.accumulator -= this.dt;
        }

        // Render would go here, receiving alpha (this.accumulator / this.dt) for interpolation

        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(this.tick);
        } else {
            // Node.js fallback (aim for ~60fps)
            setTimeout(this.tick, 1000 / 60);
        }
    };

    private update(dt: number) {
        for (const system of this.systems) {
            system(dt);
        }
    }
}
