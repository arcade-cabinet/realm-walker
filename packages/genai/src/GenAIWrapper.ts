import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export class GenAIWrapper {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
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
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON and Validate against Schema
    try {
      const json = JSON.parse(text);
      return schema.parse(json);
    } catch (e) {
      console.error("Failed to parse/validate Gemini response:", e);
      console.error("Raw response:", text);
      throw e;
    }
  }

  async generateContent(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.model });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}


