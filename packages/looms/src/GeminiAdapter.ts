import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

dotenv.config();

export enum GeminiModel {
    GEMINI_1_5_FLASH = "gemini-1.5-flash",
    GEMINI_1_5_PRO = "gemini-1.5-pro", 
    GEMINI_2_0_FLASH = "gemini-2.0-flash-exp",
    GEMINI_3_FLASH = "gemini-3-flash-preview"
}

interface GenerationOptions<T> {
    model?: GeminiModel;
    temperature?: number;
    schema?: z.ZodType<T>;
}

export class GeminiAdapter {
    private client: GoogleGenAI;
    private defaultModel: GeminiModel;
    private static lastRequestTime = 0;
    private static readonly MIN_REQUEST_INTERVAL = 6000; // 6 seconds between requests

    constructor(apiKey?: string, defaultModel: GeminiModel = GeminiModel.GEMINI_3_FLASH) {
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) throw new Error("GEMINI_API_KEY is required.");
        this.client = new GoogleGenAI({ apiKey: key });
        this.defaultModel = defaultModel;
    }

    private async enforceRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - GeminiAdapter.lastRequestTime;
        
        if (timeSinceLastRequest < GeminiAdapter.MIN_REQUEST_INTERVAL) {
            const waitTime = GeminiAdapter.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            console.log(`⏳ [GeminiAdapter] Rate limiting: waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        GeminiAdapter.lastRequestTime = Date.now();
    }

    async generate<T>(prompt: string, options: GenerationOptions<T> = {}): Promise<T> {
        const modelName = options.model || this.defaultModel;
        const temperature = options.temperature ?? 0.7;
        const maxRetries = 3;

        // Enforce rate limiting before making request
        await this.enforceRateLimit();

        const generationConfig: any = {
            temperature,
        };

        // Structured Output Setup
        if (options.schema) {
            generationConfig.responseMimeType = "application/json";
            const jsonSchema = zodToJsonSchema(options.schema, { target: "openApi3" });
            generationConfig.responseSchema = jsonSchema;
            console.log(`DEBUG SCHEMA (${modelName}):`, JSON.stringify(jsonSchema, null, 2));
        }

        // Get the model instance
        const model = this.client.getGenerativeModel({ 
            model: modelName,
            generationConfig
        });

        return await this.generateWithRetry(model, prompt, options, maxRetries);
    }

    private async generateWithRetry<T>(
        model: any, 
        prompt: string, 
        options: GenerationOptions<T>, 
        maxRetries: number
    ): Promise<T> {
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📡 [GeminiAdapter] Requesting ${model.model}... (Attempt ${attempt}/${maxRetries})`);
                const start = Date.now();
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const responseText = response.text();
                
                const duration = Date.now() - start;
                console.log(`✅ [GeminiAdapter] Response received in ${duration}ms`);

                if (!responseText) {
                    throw new Error("Empty response from Gemini.");
                }

                if (options.schema) {
                    try {
                        const json = JSON.parse(responseText);
                        return options.schema.parse(json);
                    } catch (parseError: any) {
                        console.error(`❌ JSON Parse/Validate Error:`, parseError.message);
                        console.error("Raw Output (First 500 chars):", responseText.slice(0, 500));
                        throw parseError;
                    }
                }

                return responseText as T;

            } catch (error: any) {
                lastError = error;
                
                // Handle ApiError properly
                if (error instanceof ApiError) {
                    console.error(`❌ Gemini API Error (${error.status}):`, error.message);
                    
                    switch (error.status) {
                        case 429:
                            if (attempt < maxRetries) {
                                const delay = Math.pow(2, attempt) * 2000; // Exponential backoff: 4s, 8s, 16s
                                console.log(`⏳ Rate limit exceeded. Retrying in ${delay}ms...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                                continue;
                            }
                            break;
                        case 503:
                            if (attempt < maxRetries) {
                                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
                                console.log(`⏳ Service unavailable. Retrying in ${delay}ms...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                                continue;
                            }
                            break;
                        case 400:
                            console.error(`❌ Bad Request - likely schema issue:`, error.details);
                            throw error; // Don't retry 400s
                        case 401:
                            console.error(`❌ Authentication failed. Check API key.`);
                            throw error; // Don't retry auth failures
                        case 404:
                            console.error(`❌ Model not found: ${model.model}`);
                            throw error; // Don't retry model not found
                        default:
                            console.error(`❌ Unexpected API error:`, error.details);
                            throw error;
                    }
                } else {
                    console.error(`❌ Non-API Error:`, error.message);
                    throw error;
                }
            }
        }

        console.error(`❌ Gemini API Failed after ${maxRetries} retries.`);
        throw lastError;
    }
}
