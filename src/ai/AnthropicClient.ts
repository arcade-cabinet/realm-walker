/**
 * Anthropic Client for Claude Sonnet 4.5
 * Provides access to large context windows for narrative processing
 */

import Anthropic from '@anthropic-ai/sdk';

export interface AnthropicConfig {
  apiKey: string;
  defaultModel?: string;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class AnthropicClient {
  private client: Anthropic;
  private defaultModel: string;

  constructor(config: AnthropicConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey
    });
    this.defaultModel = config.defaultModel || 'claude-sonnet-4.5-20250514';
  }

  /**
   * Send a message to Claude with large context support
   */
  async message(
    messages: AnthropicMessage[],
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    } = {}
  ): Promise<AnthropicResponse> {
    const {
      model = this.defaultModel,
      maxTokens = 4096,
      temperature = 1.0,
      system
    } = options;

    const response = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    const content = response.content
      .filter(block => block.type === 'text')
      .map(block => ('text' in block ? block.text : ''))
      .join('\n');

    return {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  }

  /**
   * Analyze large narrative content with 1M token context
   */
  async analyzeNarrativeContent(
    content: string,
    storyBible: string,
    instructions: string
  ): Promise<{
    quests: any[];
    dialogues: any[];
    npcs: any[];
    lore: any[];
    locations: any[];
    metadata: any;
  }> {
    const systemPrompt = `You are a narrative content analyzer for Realm Walker Story, a Gothic fantasy adventure game.

Your task is to analyze provided narrative content and extract structured game elements following our established world lore and architecture.

## World Context (from Story Bible)
${storyBible}

## Extraction Guidelines

1. **Quests**: Identify quest opportunities that fit our boolean flag system (no XP, no stats)
2. **Dialogues**: Extract NPC dialogue that fits our three story threads (A/B/C)
3. **NPCs**: Identify character descriptions suitable for 3D model generation
4. **Lore**: Extract world-building elements consistent with Gothic fantasy setting
5. **Locations**: Identify scenes that could become game locations

## Output Format
Return a JSON object with these fields:
- quests: Array of quest objects with boolean flags
- dialogues: Array of dialogue trees
- npcs: Array of NPC definitions with appearance descriptions
- lore: Array of lore entries
- locations: Array of scene/location definitions
- metadata: Any additional context or notes

Be creative but stay true to the Gothic fantasy atmosphere and three-tier compositor architecture.`;

    const userPrompt = `${instructions}

## Content to Analyze
${content}

Extract all useful game content from the above, maintaining narrative consistency with our story bible.`;

    const response = await this.message(
      [{ role: 'user', content: userPrompt }],
      {
        model: this.defaultModel,
        maxTokens: 8192,
        temperature: 0.7,
        system: systemPrompt
      }
    );

    try {
      // Parse JSON from response using more reliable method
      const startIdx = response.content.indexOf('{');
      const endIdx = response.content.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) {
        throw new Error('No JSON found in response');
      }
      const jsonStr = response.content.substring(startIdx, endIdx + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse narrative analysis:', error);
      console.error('Raw response:', response.content);
      throw error;
    }
  }

  /**
   * Correlate assets based on context clues
   */
  async correlateAssets(
    assetMetadata: Array<{
      fileName: string;
      path: string;
      content?: string;
    }>,
    glbFiles: Array<{
      fileName: string;
      path: string;
    }>
  ): Promise<Array<{
    glbPath: string;
    metadata: {
      prompt?: string;
      name?: string;
      tags?: string[];
      description?: string;
    };
    confidence: number;
  }>> {
    const systemPrompt = `You are an asset correlation AI. Given a list of text files containing Meshy prompts/names and a list of GLB files, correlate them based on filename patterns, paths, and content clues.

Return a JSON array of correlations with:
- glbPath: The GLB file path
- metadata: Extracted prompt, name, tags, description
- confidence: 0-1 confidence score

Be intelligent about matching - consider:
- File naming patterns (spaces, underscores, numbers)
- Directory structure context
- Content keywords
- Timestamp patterns`;

    const userPrompt = `## Text Files with Metadata
${JSON.stringify(assetMetadata, null, 2)}

## GLB Files
${JSON.stringify(glbFiles, null, 2)}

Correlate these files and extract metadata for each GLB.`;

    const response = await this.message(
      [{ role: 'user', content: userPrompt }],
      {
        maxTokens: 8192,
        temperature: 0.3, // Lower temperature for more deterministic matching
        system: systemPrompt
      }
    );

    try {
      const startIdx = response.content.indexOf('[');
      const endIdx = response.content.lastIndexOf(']');
      if (startIdx === -1 || endIdx === -1) {
        throw new Error('No JSON array found in response');
      }
      const jsonStr = response.content.substring(startIdx, endIdx + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse asset correlation:', error);
      console.error('Raw response:', response.content);
      throw error;
    }
  }
}
