/**
 * GPT Image Generator
 * Uses gpt-image-1 (GPT-4.5) for transparent PNG generation
 */

import { openai } from '@ai-sdk/openai';
import { experimental_generateImage as generateImage } from 'ai';
import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, loadImage } from 'canvas';

export interface ImageGenerationOptions {
  prompt: string;
  transparent?: boolean;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

export interface ImageResizeOptions {
  width: number;
  height: number;
  maintainAspect?: boolean;
  scaleMode?: 'contain' | 'cover' | 'stretch';
}

export class GPTImageGenerator {
  private model = openai.image('gpt-4.5');
  private outputDirectory: string;

  constructor(outputDirectory: string = './generated/images') {
    this.outputDirectory = outputDirectory;
    this.ensureDirectory();
  }

  /**
   * Ensure output directory exists
   */
  private ensureDirectory(): void {
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  /**
   * Generate image with GPT-4.5
   */
  async generate(options: ImageGenerationOptions): Promise<string> {
    const {
      prompt,
      transparent = false,
      size = '1024x1024',
      quality = 'hd',
      style = 'vivid'
    } = options;

    // Add transparency instruction to prompt
    const enhancedPrompt = transparent
      ? `${prompt}\n\nIMPORTANT: Create with a transparent background (alpha channel).`
      : prompt;

    try {
      const { image } = await generateImage({
        model: this.model as any,
        prompt: enhancedPrompt,
        size: size as `${number}x${number}`,
        providerOptions: {
          openai: {
            quality,
            style
          }
        }
      });

      // Save image
      const filename = `${Date.now()}_${this.sanitizeFilename(prompt)}.png`;
      const filepath = path.join(this.outputDirectory, filename);

      // Save base64 or uint8Array
      if (image && image.base64) {
        fs.writeFileSync(filepath, Buffer.from(image.base64, 'base64'));
      } else if (image && image.uint8Array) {
        fs.writeFileSync(filepath, Buffer.from(image.uint8Array));
      } else {
        throw new Error('No image data received from the API');
      }

      console.log(`Generated image: ${filepath}`);
      return filepath;
    } catch (error) {
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Resize image with scale awareness
   */
  async resize(inputPath: string, options: ImageResizeOptions): Promise<string> {
    const {
      width,
      height,
      maintainAspect = true,
      scaleMode = 'contain'
    } = options;

    const image = await loadImage(inputPath);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Calculate dimensions based on scale mode
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (maintainAspect) {
      const imageAspect = image.width / image.height;
      const targetAspect = width / height;

      if (scaleMode === 'contain') {
        if (imageAspect > targetAspect) {
          drawWidth = width;
          drawHeight = width / imageAspect;
          offsetY = (height - drawHeight) / 2;
        } else {
          drawHeight = height;
          drawWidth = height * imageAspect;
          offsetX = (width - drawWidth) / 2;
        }
      } else if (scaleMode === 'cover') {
        if (imageAspect > targetAspect) {
          drawHeight = height;
          drawWidth = height * imageAspect;
          offsetX = (width - drawWidth) / 2;
        } else {
          drawWidth = width;
          drawHeight = width / imageAspect;
          offsetY = (height - drawHeight) / 2;
        }
      }
    }

    // Clear canvas with transparency
    ctx.clearRect(0, 0, width, height);

    // Draw image
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    // Save resized image
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);
    const outputPath = path.join(
      path.dirname(inputPath),
      `${basename}_${width}x${height}${ext}`
    );

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`Resized image: ${outputPath}`);
    return outputPath;
  }

  /**
   * Batch resize for multiple dimensions (e.g., HUD elements)
   */
  async batchResize(inputPath: string, sizes: { width: number; height: number }[]): Promise<string[]> {
    const outputs: string[] = [];

    for (const size of sizes) {
      const output = await this.resize(inputPath, size);
      outputs.push(output);
    }

    return outputs;
  }

  /**
   * Sanitize filename from prompt
   */
  private sanitizeFilename(prompt: string): string {
    return prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .substring(0, 50);
  }

  /**
   * Generate HUD element with multiple sizes
   */
  async generateHUDElement(prompt: string, sizes: { width: number; height: number }[] = [
    { width: 64, height: 64 },
    { width: 128, height: 128 },
    { width: 256, height: 256 }
  ]): Promise<{ original: string; resized: string[] }> {
    // Generate at 1024x1024 with transparency
    const original = await this.generate({
      prompt: `UI icon: ${prompt}`,
      transparent: true,
      size: '1024x1024',
      quality: 'hd'
    });

    // Resize to all needed dimensions
    const resized = await this.batchResize(original, sizes);

    return { original, resized };
  }

  /**
   * Generate splash screen
   */
  async generateSplashScreen(prompt: string, targetWidth: number = 1920, targetHeight: number = 1080): Promise<string> {
    // Generate at highest quality
    const original = await this.generate({
      prompt,
      transparent: false,
      size: '1792x1024',
      quality: 'hd',
      style: 'vivid'
    });

    // Resize to target dimensions
    return this.resize(original, {
      width: targetWidth,
      height: targetHeight,
      maintainAspect: true,
      scaleMode: 'cover'
    });
  }
}
