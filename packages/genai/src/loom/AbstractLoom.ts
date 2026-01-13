import { LoomSettings } from '@realm-walker/shared';
import { z } from 'zod';
import { GenAIWrapper } from '../GenAIWrapper.js';

export abstract class AbstractLoom<TOutput, TContext = any> {
    protected wrapper: GenAIWrapper;
    protected schema: z.ZodType<TOutput>;

    constructor(apiKey: string, schema: z.ZodType<TOutput>) {
        this.wrapper = new GenAIWrapper(apiKey);
        this.schema = schema;
    }

    /**
     * The Warp: Validates inputs and prepares the Weave.
     */
    async weave(settings: LoomSettings, context?: TContext): Promise<TOutput> {
        const prompt = this.constructPrompt(settings, context);
        console.log(`🧵 Loom Spinning: ${this.constructor.name}...`);

        // Spinal Tap: Creative mode based on Magic Level?
        const temperature = (settings.controls.magicLevel / 10) * 1.5;

        return this.wrapper.generateStructuredContent(prompt, this.schema, Math.min(temperature, 2.0));
    }

    /**
     * The Shuttle: Constructs the prompt.
     */
    protected abstract constructPrompt(settings: LoomSettings, context?: TContext): string;
}
