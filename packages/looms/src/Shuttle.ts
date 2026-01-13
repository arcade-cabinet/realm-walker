import { Loom, LoomDefinition } from './Loom.js';
import { Tapestry } from './Tapestry.js';

export interface ShuttleJob<TInput, TOutput, TContext> {
    name: string;
    def: LoomDefinition<TInput, TOutput, TContext>; // Use Definition, not Class
    transform: (tapestry: Tapestry<TContext>) => TInput;
    onWeave: (result: TOutput, tapestry: Tapestry<TContext>) => void;
}

/**
 * SHUTTLE: The Orchestrator.
 */
export class Shuttle<TContext = Record<string, any>> {
    private tapestry: Tapestry<TContext>;
    private loom: Loom; // The Generic Engine
    private jobs: ShuttleJob<any, any, TContext>[] = [];

    constructor(tapestry: Tapestry<TContext>, loom: Loom) {
        this.tapestry = tapestry;
        this.loom = loom;
    }

    addJob<TInput, TOutput>(job: ShuttleJob<TInput, TOutput, TContext>): Shuttle<TContext> {
        this.jobs.push(job);
        return this;
    }

    async launch(): Promise<Tapestry<TContext>> {
        console.log("🚀 Shuttle Launching...");

        for (const job of this.jobs) {
            console.log(`🧵 Weaving: ${job.name}`);

            try {
                const input = job.transform(this.tapestry);

                // Execute Generic Loom with Definition
                const result = await this.loom.weave(job.def, input, this.tapestry);

                // Update Tapestry
                job.onWeave(result, this.tapestry);

                // Run Definition's Self-Verification in realtime
                if (job.def.verify) {
                    console.log(`🔍 Verifying ${job.name}...`);
                    await job.def.verify(result, input, this.tapestry);
                }

                console.log(`✅ Weaved & Verified: ${job.name}`);
            } catch (error: any) {
                console.error(`❌ Shuttle Crashed at ${job.name}:`, error.message);
                throw error;
            }
        }

        console.log("🏁 Shuttle Landed.");
        return this.tapestry;
    }
}
