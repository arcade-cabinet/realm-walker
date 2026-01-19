import { Loom, LoomDefinition } from './Loom.js';
import { Tapestry } from './Tapestry.js';

export interface ShuttleJob<TInput, TOutput, TContext> {
    name: string;
    def: LoomDefinition<TInput, TOutput, TContext>;
    transform: (tapestry: Tapestry<TContext>) => TInput;
    onWeave: (result: TOutput, tapestry: Tapestry<TContext>) => void;
}

/**
 * SHUTTLE: The Orchestrator.
 * It manages the sequence of Loom weaving operations.
 */
export class Shuttle<TContext extends Record<string, any>> {
    private tapestry: Tapestry<TContext>;
    private engine: Loom;
    private jobs: ShuttleJob<any, any, TContext>[] = [];

    constructor(apiKeyOrTapestry: string | Tapestry<TContext>, maybeTapestry?: Tapestry<TContext>) {
        if (typeof apiKeyOrTapestry === 'string') {
            this.engine = new Loom({ apiKey: apiKeyOrTapestry });
            this.tapestry = maybeTapestry || new Tapestry<TContext>({} as TContext);
        } else {
            this.tapestry = apiKeyOrTapestry;
            this.engine = new Loom(); // Expects API key in env
        }
    }

    /**
     * Adds a declarative job using a LoomDefinition.
     * Assumes the input is the 'settings' key in tapestry if not specified.
     */
    addJob<TInput, TOutput>(
        def: LoomDefinition<TInput, TOutput, TContext>,
        options: {
            transform?: (t: Tapestry<TContext>) => TInput;
            onWeave?: (res: TOutput, t: Tapestry<TContext>) => void;
        } = {}
    ): Shuttle<TContext> {
        const job: ShuttleJob<TInput, TOutput, TContext> = {
            name: def.name,
            def,
            transform: options.transform || ((t) => t.get('settings' as any)),
            onWeave: options.onWeave || ((res, t) => {
                if (def.produces && def.produces.length > 0) {
                    const key = def.produces[0] as keyof TContext;
                    t.weave(key, res as any);
                }
            })
        };
        this.jobs.push(job);
        return this;
    }

    async launch(): Promise<TContext> {
        console.log("🚀 Shuttle Launching...");

        for (const job of this.jobs) {
            console.log(`🧵 Weaving: ${job.name}...`);

            try {
                const input = job.transform(this.tapestry);

                // Execute Generic Loom with Definition
                const result = await this.engine.weave(job.def, input, this.tapestry);

                // Update Tapestry
                job.onWeave(result, this.tapestry);

                // Run Definition's Self-Verification
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
        return this.tapestry.snapshot();
    }
}
