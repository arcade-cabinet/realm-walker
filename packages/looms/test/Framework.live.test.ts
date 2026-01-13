import * as dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Fabric } from '../src/Fabric.js';
import { Shuttle } from '../src/Shuttle.js';
import { Tapestry } from '../src/Tapestry.js';

dotenv.config({ path: '../../.env' });

// --- MOCKS ---

interface MockContext {
    seed: string;
    result?: { echo: string };
}

const OutputSchema = z.object({
    echo: z.string()
});

class MockLoom extends Fabric<{ message: string }, { echo: string }, MockContext> {
    protected weavePattern(input: { message: string }, tapestry: Tapestry<MockContext>): string {
        return `
      Echo the following message exactly as is: "${input.message}"
      Context Seed: ${tapestry.get('seed')}
      
      Output JSON matching { echo: string }.
    `;
    }
}

// --- TEST ---

describe('Loom Framework (Core Proof)', () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Skipping Framework Proof: No GEMINI_API_KEY.");
        return;
    }

    it('Should orchestrate a distinct Loom via Shuttle and update Tapestry', async () => {
        // 1. Init Tapestry
        const tapestry = new Tapestry<MockContext>({ seed: "Framework-Test-123" });

        // 2. Init Loom
        const mockLoom = new MockLoom(OutputSchema, { apiKey });

        // 3. Init Shuttle
        const shuttle = new Shuttle(tapestry);

        // 4. Register Job
        shuttle.addJob({
            name: "Echo Test",
            loom: mockLoom,
            transform: (t) => ({ message: "Hello Framework" }),
            onWeave: (result, t) => t.weave('result', result)
        });

        // 5. Launch
        await shuttle.launch();

        // 6. Verify State
        const finalState = tapestry.snapshot();
        console.log("Final Tapestry State:", finalState);

        expect(finalState.result).toBeDefined();
        expect(finalState.result?.echo).toContain("Hello Framework");
    });
});
