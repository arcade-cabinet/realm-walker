import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export class GenAIWrapper {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-3-flash-preview') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateStructuredContent<T extends z.ZodType>(
    prompt: string,
    schema: T,
    temperature: number = 0.7
  ): Promise<z.infer<T>> {
    const model = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature,
        ...(this.model.includes('1.5') || this.model.includes('2.0') || this.model.includes('3') ? { responseMimeType: "application/json" } : {}),
      } as any,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON and Validate against Schema
    try {
      const json = JSON.parse(text);
      return schema.parse(json);
    } catch (e: any) {
      console.error("❌ Gemini Generation Failed:");
      console.error("Error Message:", e?.message || String(e));
      try {
        console.error("Raw Response (First 500 chars):", text ? text.substring(0, 500) : "EMPTY/UNDEFINED");
      } catch (logError) {
        console.error("Could not log raw response.");
      }
      throw e;
    }
  }

  async generateContent(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}


