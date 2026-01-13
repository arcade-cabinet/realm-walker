import * as dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { GeminiAdapter, GeminiModel } from '../src/GeminiAdapter.js';

dotenv.config({ path: '../../.env' });

describe('GeminiAdapter (Isolation Proof)', () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Skipping Live Proof: No GEMINI_API_KEY found.");
        return;
    }

    const adapter = new GeminiAdapter(apiKey, GeminiModel.GEMINI_3_FLASH);

    it('Should generate raw text (Connectivity Check)', async () => {
        const response = await adapter.generate("Reply with exactly 'Hello World'");
        expect(response).toContain('Hello World');
        console.log("Raw Response:", response);
    });

    it('Should enforce Zod Schema (Structured Output)', async () => {
        const Schema = z.object({
            message: z.string(),
            sentiment: z.enum(['positive', 'neutral', 'negative']),
            confidence: z.number().min(0).max(1)
        });

        const response = await adapter.generate("Analyze this sentiment: I love coding!", {
            schema: Schema
        });

        console.log("Structured Response:", response);

        expect(response.message).toBeDefined();
        expect(response.sentiment).toBe('positive');
        expect(response.confidence).toBeGreaterThan(0.5);
    });
});
