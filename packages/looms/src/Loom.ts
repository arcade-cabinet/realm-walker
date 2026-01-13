import { z } from 'zod';
import { GeminiAdapter, GeminiModel } from './GeminiAdapter.js';
import { Tapestry } from './Tapestry.js';

export interface LoomConfig {
    apiKey?: string;
    model?: GeminiModel;
    temperature?: number;
}

/**
 * DDL: The Definition of a Loom.
 */
export interface LoomDefinition<TInput, TOutput, TContext> {
    name: string;
    schema: z.ZodType<TOutput>;
    pattern: (input: TInput, tapestry: Tapestry<TContext>) => string; // The Prompt "Pattern"
    model?: GeminiModel; // Override default model

    // Metadata for the Tapestry
    tags?: string[]; // e.g. ['world', 'core']
    consumes?: string[]; // Keys in Tapestry required, e.g. ['settings', 'world']
    produces?: string[]; // Keys in Tapestry written, e.g. ['factions']

    // Self-Verification Logic (The "Test" is part of the Def)
    verify?: (output: TOutput, input: TInput, context: Tapestry<TContext>) => void | Promise<void>;
}

/**
 * ENGINE: The Universal Loom that executes Definitions.
 */
export class Loom {
    private adapter: GeminiAdapter;
    private defaultModel: GeminiModel;

    constructor(config: LoomConfig = {}) {
        this.defaultModel = config.model || GeminiModel.GEMINI_3_FLASH;
        this.adapter = new GeminiAdapter(config.apiKey, this.defaultModel);
    }

    /**
     * Weave: Executes a Loom Definition.
     */
    async weave<TInput, TOutput, TContext>(
        def: LoomDefinition<TInput, TOutput, TContext>,
        input: TInput,
        tapestry: Tapestry<TContext>
    ): Promise<TOutput> {
        const prompt = def.pattern(input, tapestry);
        const model = def.model || this.defaultModel;

        const structuralReinforcement = `
    CRITICAL OUTPUT INSTRUCTIONS:
    1. Output EXACTLY valid JSON matching the Schema.
    2. Do NOT wrap in markdown blocks.
    `;

        return this.adapter.generate(prompt + structuralReinforcement, {
            model: model,
            schema: def.schema
        });
    }
}
