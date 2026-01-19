import * as dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { LoomDefinition } from '../src/Loom.js';
import { Shuttle } from '../src/Shuttle.js';
import { Tapestry } from '../src/Tapestry.js';

dotenv.config({ path: '../../.env' });

// --- MOCKS ---

interface MockContext {
    settings: { message: string };
    result?: { echo: string };
}

const OutputSchema = z.object({
    echo: z.string()
});

// DDL-style LoomDefinition (matches current architecture)
const EchoLoomDef: LoomDefinition<{ message: string }, { echo: string }, MockContext> = {
    name: "EchoLoom",
    tags: ['test'],
    produces: ['result'],
    schema: OutputSchema,
    pattern: (input, tapestry) => {
        return `
      Echo the following message exactly as is: "${input.message}"
      
      Output JSON matching { echo: string }.
    `;
    },
    verify: (output, input) => {
        if (!output.echo) {
            throw new Error("Echo response missing");
        }
    }
};

// --- TEST ---

describe('Loom Framework (Core Proof)', () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Skipping Framework Proof: No GEMINI_API_KEY.");
        return;
    }

    it('Should orchestrate a LoomDefinition via Shuttle and update Tapestry', async () => {
        // 1. Init Tapestry with settings
        const tapestry = new Tapestry<MockContext>({ 
            settings: { message: "Hello Framework" }
        });

        // 2. Init Shuttle with API key
        const shuttle = new Shuttle<MockContext>(apiKey, tapestry);

        // 3. Register Job using DDL definition
        shuttle.addJob(EchoLoomDef, {
            transform: (t) => t.get('settings'),
            onWeave: (result, t) => t.weave('result', result)
        });

        // 4. Launch
        await shuttle.launch();

        // 5. Verify State
        const finalState = tapestry.snapshot();
        console.log("Final Tapestry State:", finalState);

        expect(finalState.result).toBeDefined();
        expect(finalState.result?.echo).toContain("Hello Framework");
    });
});
