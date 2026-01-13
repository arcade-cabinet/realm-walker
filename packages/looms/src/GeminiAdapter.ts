import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

dotenv.config();

export enum GeminiModel {
    GEMINI_1_5_FLASH = "models/gemini-1.5-flash",
    GEMINI_1_5_PRO = "models/gemini-1.5-pro",
    GEMINI_2_0_FLASH = "models/gemini-2.0-flash-exp",
    GEMINI_3_FLASH = "models/gemini-3-flash-preview" // FALLBACK TO KNOWN GOOD 2.0 FOR NOW IF 3 FAILS?
    // No, user demanded 3.
    // I will use "models/gemini-2.0-flash-exp" as a sanity check if 3 fails again.
    // BUT User said "gemini-3-flash-preview".
    // I will try literal "models/gemini-3-flash-preview" first.
}
// User said "gemini-3-flash-preview". ListModels said "models/gemini-3-flash-preview" (Wait, did it?)
// Step 2338 summary says: "ListModels output ... confirmed ... models/gemini-3-flash-preview".
// So use that.

interface GenerationOptions<T> {
    model?: GeminiModel;
    temperature?: number;
    schema?: z.ZodType<T>;
}

export class GeminiAdapter {
    private client: GoogleGenAI;
    private defaultModel: GeminiModel;

    constructor(apiKey?: string, defaultModel: GeminiModel = GeminiModel.GEMINI_3_FLASH) {
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) throw new Error("GEMINI_API_KEY is required.");
        this.client = new GoogleGenAI({ apiKey: key });
        this.defaultModel = defaultModel;
    }

    async generate<T>(prompt: string, options: GenerationOptions<T> = {}): Promise<T> {
        const modelName = options.model || this.defaultModel;
        const temperature = options.temperature ?? 0.7;
        const maxRetries = 3;
        const baseDelay = 2000;

        const config: any = {
            temperature,
        };

        // Strict Structured Output Setup
        if (options.schema) {
            config.responseMimeType = "application/json";
            // Convert Zod to JSON Schema, then cast to Google's Type
            const jsonSchema = zodToJsonSchema(options.schema, { target: "openApi3" });

            // @google/genai expects a specific Schema type.
            // We pass the JSON Schema object directly as `responseSchema` 
            // relying on the SDK's ability to handle standard JSON schemas.
            config.responseSchema = jsonSchema;

            // DEBUG: Log the schema to catch 400s
            console.log(`DEBUG SCHEMA (${modelName}):`, JSON.stringify(jsonSchema, null, 2));
        }

        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 1) {
                    const delay = baseDelay * Math.pow(2, attempt - 1);
                    console.log(`⏳ [GeminiAdapter] Rate Limit hit. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                console.log(`📡 [GeminiAdapter] Requesting ${modelName}...`);
                const start = Date.now();
                // NEW SDK Usage: Direct call via `ai.models`
                const result = await this.client.models.generateContent({
                    model: modelName,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config
                });
                const duration = Date.now() - start;
                console.log(`✅ [GeminiAdapter] Response received in ${duration}ms`);

                const responseText = result.text;

                if (!responseText) {
                    throw new Error("Empty response from Gemini.");
                }

                if (options.schema) {
                    try {
                        const json = JSON.parse(responseText);
                        return options.schema.parse(json);
                    } catch (parseError: any) {
                        console.error(`❌ JSON Parse/Validate Error for ${modelName}:`, parseError.message);
                        console.error("Raw Output (First 500 chars):", responseText.slice(0, 500));
                        throw parseError;
                    }
                }

                return responseText as T;

            } catch (error: any) {
                lastError = error;
                // Check for Rate Limit (429) or Server Error (503)
                const status = error.status || error.response?.status;
                if (status === 429 || status === 503) {
                    continue; // Retry
                }

                // Enhanced Logging for 400s (Schema issues)
                if (status === 400) {
                    console.error(`❌ Gemini API 400 Bad Request (${modelName}):`);
                    console.error(`   Message: ${error.message}`);
                    if (error.response) {
                        console.error(`   Response Body: ${JSON.stringify(error.response, null, 2)}`);
                    }
                    // Log the prompt and schema context if possible (verbose)
                    // console.dir(config, { depth: null });
                } else {
                    console.error(`❌ Gemini API Error (${modelName}):`, error.message);
                }

                throw error;
            }
        }

        // If we exhausted retries
        console.error(`❌ Gemini API Failed after ${maxRetries} retries.`);
        throw lastError;
    }
}
