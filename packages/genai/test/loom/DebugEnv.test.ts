import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('Environment Debug', () => {
    it('Should find the .env file and load the key', () => {
        // Probe paths
        const paths = [
            path.resolve(__dirname, '../../../../.env'), // Worktree Root ??
            path.resolve(__dirname, '../../../../../.env'),
            path.resolve(__dirname, '../../../../../../.env'), // Main Root
        ];

        let foundPath = '';
        paths.forEach(p => {
            const exists = fs.existsSync(p);
            console.log(`Probe: ${p} -> ${exists ? 'EXISTS' : 'MISSING'}`);
            if (exists) foundPath = p;
        });

        if (foundPath) {
            dotenv.config({ path: foundPath });
            const key = process.env.GEMINI_API_KEY;
            console.log(`Loaded Key from ${foundPath}: ${key ? 'PRESENT' : 'MISSING'}`);
        }
    });

    it('Should generate raw content (Hello World)', async () => {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            console.warn("Skipping Raw Gen: No Key Loaded");
            return;
        }

        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(key);

        // Interpreting "Gemini Three Preview Flash" as 3.0 Flash Experimental
        const modelName = 'gemini-3.0-flash-exp';
        const model = genAI.getGenerativeModel({ model: modelName });

        try {
            console.log(`Attempting Hello World with ${modelName}...`);
            const result = await model.generateContent('Say Hello');
            const text = result.response.text();
            console.log("Response:", text);
            expect(text.length).toBeGreaterThan(0);
        } catch (e: any) {
            console.error(`Raw Gen Failed (${modelName}):`, e.message);
            // Fallback to pro just to see
            const model2 = genAI.getGenerativeModel({ model: 'gemini-pro' });
        }
    });
    it('Should list available models', async () => {
        const key = process.env.GEMINI_API_KEY;
        if (!key) return;
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            const data = await response.json();
            console.log("AVAILABLE MODELS:");
            if (data.models) {
                // @ts-ignore
                const relevant = data.models.filter((m: any) =>
                    m.name.toLowerCase().includes('gemini') ||
                    m.name.toLowerCase().includes('flash') ||
                    m.name.toLowerCase().includes('three') ||
                    m.name.toLowerCase().includes('3.')
                );
                relevant.forEach((m: any) => console.log(` - ${m.name}`));
            } else {
                console.log("No models found or error:", data);
            }
        } catch (e) {
            console.error("ListModels failed:", e);
        }
    });
});
