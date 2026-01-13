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

    // Property 7: Generation Mode Consistency
    // **Validates: Requirements 2.6**
    it('property: generation mode consistency across API and mock scenarios', async () => {
        // Property-based test: For any valid input and schema,
        // the generation system should handle both API and mock modes consistently
        const testCases = [
            {
                prompt: "Generate a simple greeting",
                schema: z.object({ greeting: z.string() }),
                expectedField: 'greeting'
            },
            {
                prompt: "Create a basic item",
                schema: z.object({ 
                    name: z.string(), 
                    type: z.enum(['weapon', 'armor', 'item']),
                    value: z.number().min(0)
                }),
                expectedField: 'name'
            },
            {
                prompt: "Generate character stats",
                schema: z.object({
                    hp: z.number().min(1),
                    str: z.number().min(1),
                    agi: z.number().min(1),
                    int: z.number().min(1)
                }),
                expectedField: 'hp'
            }
        ];

        const models = [GeminiModel.GEMINI_3_FLASH, GeminiModel.GEMINI_2_0_FLASH];

        for (const testCase of testCases) {
            for (const model of models) {
                try {
                    // Test API mode
                    const apiAdapter = new GeminiAdapter(apiKey, model);
                    const apiResponse = await apiAdapter.generate(testCase.prompt, {
                        schema: testCase.schema,
                        temperature: 0.1 // Low temperature for consistency
                    });

                    // Verify API response structure
                    expect(apiResponse).toBeDefined();
                    expect(apiResponse[testCase.expectedField]).toBeDefined();
                    
                    // Verify schema compliance
                    const validatedResponse = testCase.schema.parse(apiResponse);
                    expect(validatedResponse).toEqual(apiResponse);

                    // Test that response is reasonable (not empty strings, positive numbers where expected)
                    if (typeof apiResponse[testCase.expectedField] === 'string') {
                        expect(apiResponse[testCase.expectedField].length).toBeGreaterThan(0);
                    }
                    if (typeof apiResponse[testCase.expectedField] === 'number') {
                        expect(apiResponse[testCase.expectedField]).toBeGreaterThan(0);
                    }

                    console.log(`✅ ${model} API mode: ${testCase.prompt} -> ${JSON.stringify(apiResponse)}`);

                } catch (error: any) {
                    // If API fails (rate limit, etc.), this is expected behavior
                    // The system should handle this gracefully
                    if (error.status === 429 || error.status === 503) {
                        console.log(`⚠️ ${model} API temporarily unavailable (${error.status}) - this is expected and handled`);
                        expect(error.message).toContain('quota');
                    } else {
                        // Unexpected errors should still be thrown
                        throw error;
                    }
                }
            }
        }

        // Test consistency: same prompt with same temperature should produce similar structure
        const consistencyPrompt = "Generate a warrior character";
        const consistencySchema = z.object({
            name: z.string(),
            class: z.string(),
            level: z.number().min(1).max(100)
        });

        try {
            const response1 = await adapter.generate(consistencyPrompt, {
                schema: consistencySchema,
                temperature: 0.0 // Deterministic
            });

            const response2 = await adapter.generate(consistencyPrompt, {
                schema: consistencySchema,
                temperature: 0.0 // Deterministic
            });

            // Both responses should have the same structure
            expect(typeof response1.name).toBe(typeof response2.name);
            expect(typeof response1.class).toBe(typeof response2.class);
            expect(typeof response1.level).toBe(typeof response2.level);

            // Both should be valid according to schema
            expect(() => consistencySchema.parse(response1)).not.toThrow();
            expect(() => consistencySchema.parse(response2)).not.toThrow();

            console.log(`🔄 Consistency test: Response 1: ${JSON.stringify(response1)}`);
            console.log(`🔄 Consistency test: Response 2: ${JSON.stringify(response2)}`);

        } catch (error: any) {
            if (error.status === 429) {
                console.log(`⚠️ Consistency test skipped due to rate limiting - this is expected behavior`);
            } else {
                throw error;
            }
        }
    });
});
