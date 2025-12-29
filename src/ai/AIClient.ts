/**
 * AI Tools for Scene Generation
 * Provides AI with structured tools to generate assets
 */

import { tool } from 'ai';
import { z } from 'zod';
import { AssetLibrary } from './AssetLibrary';
import { MeshyClient } from './MeshyClient';
import { GPTImageGenerator } from './GPTImageGenerator';
import { AmbientCGProvider } from './AmbientCGProvider';

export interface AIToolsConfig {
  assetLibrary: AssetLibrary;
  meshyClient: MeshyClient;
  imageGenerator: GPTImageGenerator;
  ambientCG: AmbientCGProvider;
}

/**
 * Create AI tools for asset generation
 */
export function createAssetGenerationTools(config: AIToolsConfig) {
  return {
    search_existing_assets: tool({
      description: 'Search the asset library for existing reusable assets using semantic similarity',
      inputSchema: z.object({
        query: z.string().describe('Description of the asset needed'),
        type: z.enum(['model', 'texture', 'audio']).optional(),
        threshold: z.number().min(0).max(1).default(0.85).describe('Similarity threshold')
      }),
      execute: async ({ query, type, threshold }: any) => {
        try {
          const results = await config.assetLibrary.searchSimilar(query, {
            type,
            threshold,
            limit: 5
          });

          return {
            success: true,
            found: results.length,
            assets: results.map(r => ({
              id: r.asset.id,
              prompt: r.asset.prompt,
              filePath: r.asset.filePath,
              similarity: r.similarity,
              usageCount: r.asset.usage_count,
              tags: r.asset.tags
            }))
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    } as any),

    generate_3d_model: tool({
      description: 'Generate a new 3D model using Meshy AI with optional animation',
      inputSchema: z.object({
        prompt: z.string().describe('Detailed description of the 3D model'),
        artStyle: z.enum(['realistic', 'cartoon', 'low-poly', 'sculpture', 'pbr']),
        animated: z.boolean().default(false),
        animations: z.array(z.string()).optional().describe('Animation IDs if animated'),
        polyCount: z.number().optional().describe('Target polygon count')
      }),
      execute: async ({ prompt, artStyle, animated, animations, polyCount }: any) => {
        try {
          console.log(`Generating 3D model: ${prompt}`);

          const result = await config.meshyClient.generateCompleteAsset({
            prompt,
            artStyle,
            animations: animated ? animations || [] : [],
            onProgress: (stage, progress) => {
              console.log(`  ${stage}: ${progress}%`);
            }
          });

          // Register in asset library
          const assetId = `model_${Date.now()}`;
          await config.assetLibrary.registerAsset({
            id: assetId,
            type: 'model',
            prompt,
            description: `${artStyle} style 3D model${animated ? ' with animations' : ''}`,
            filePath: result.modelUrls?.glb || '',
            tags: [artStyle, animated ? 'animated' : 'static'],
            metadata: {
              polyCount,
              animations,
              textureUrls: result.textureUrls
            }
          });

          return {
            success: true,
            assetId,
            modelUrl: result.modelUrls?.glb,
            animated: !!result.animatedModelUrl,
            message: 'Model generated and registered in asset library'
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    } as any),

    generate_texture: tool({
      description: 'Generate a texture/image using GPT-4.5 with transparency support',
      inputSchema: z.object({
        prompt: z.string().describe('Description of the texture or UI element'),
        transparent: z.boolean().default(false),
        size: z.enum(['1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
        purpose: z.enum(['texture', 'hud', 'splash', 'icon']).default('texture')
      }),
      execute: async ({ prompt, transparent, size, purpose }: any) => {
        try {
          console.log(`Generating image: ${prompt}`);

          let filepath: string;

          if (purpose === 'hud' || purpose === 'icon') {
            // Generate with multiple sizes
            const result = await config.imageGenerator.generateHUDElement(prompt);
            filepath = result.original;

            return {
              success: true,
              original: result.original,
              resized: result.resized,
              message: 'HUD element generated with multiple sizes'
            };
          } else if (purpose === 'splash') {
            filepath = await config.imageGenerator.generateSplashScreen(prompt);
          } else {
            filepath = await config.imageGenerator.generate({
              prompt,
              transparent,
              size
            });
          }

          return {
            success: true,
            filepath,
            message: 'Texture generated successfully'
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    } as any),

    search_pbr_textures: tool({
      description: 'Search ambientCG for physically-based textures (stone, wood, metal, etc.)',
      inputSchema: z.object({
        surfaceType: z.string().describe('Surface type (stone, wood, brick, metal, grass, etc.)'),
        tags: z.array(z.string()).optional(),
        resolution: z.enum(['1K', '2K', '4K', '8K']).default('2K')
      }),
      execute: async ({ surfaceType, tags, resolution }: any) => {
        try {
          const recommended = await config.ambientCG.getRecommendedTexture(surfaceType);

          if (recommended) {
            return {
              success: true,
              texture: {
                id: recommended.id,
                name: recommended.name,
                downloadUrl: recommended.downloadUrl,
                preview: recommended.preview,
                maps: recommended.maps
              },
              message: `Found ${surfaceType} texture: ${recommended.name}`
            };
          } else {
            // Try custom search
            const results = await config.ambientCG.search(surfaceType, {
              tags,
              resolution,
              limit: 3
            });

            return {
              success: true,
              textures: results.map(t => ({
                id: t.id,
                name: t.name,
                preview: t.preview,
                downloadUrl: t.downloadUrl
              })),
              found: results.length
            };
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    } as any),

    get_animation_library: tool({
      description: 'Get available animations from Meshy animation library',
      inputSchema: z.object({}),
      execute: async () => {
        try {
          const animations = await config.meshyClient.getAnimationLibrary();

          return {
            success: true,
            animations: animations.map(a => ({
              id: a.id,
              name: a.name,
              category: a.category,
              duration: a.duration,
              tags: a.tags
            })),
            count: animations.length
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    } as any),

    register_asset: tool({
      description: 'Register a generated asset in the library for future reuse',
      inputSchema: z.object({
        id: z.string(),
        type: z.enum(['model', 'texture', 'audio']),
        prompt: z.string(),
        description: z.string(),
        filePath: z.string(),
        tags: z.array(z.string())
      }),
      execute: async ({ id, type, prompt, description, filePath, tags }: any) => {
        try {
          await config.assetLibrary.registerAsset({
            id,
            type,
            prompt,
            description,
            filePath,
            tags,
            metadata: {}
          });

          return {
            success: true,
            message: `Asset ${id} registered in library`
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    } as any)
  };
}

/**
 * System prompt for scene generation
 */
export const SCENE_GENERATION_PROMPT = `You are a creative game designer generating adventure game scenes for Realm Walker Story.

## Your Capabilities

You have access to tools for:
1. **search_existing_assets** - Find reusable assets (ALWAYS CHECK FIRST)
2. **generate_3d_model** - Create new 3D models with Meshy AI
3. **generate_texture** - Create textures/images with GPT-4.5
4. **search_pbr_textures** - Find PBR texture sets from ambientCG
5. **get_animation_library** - Browse available animations
6. **register_asset** - Add new assets to the library

## Workflow

For each scene element (NPC, prop, door):
1. First, search existing assets with search_existing_assets
2. If found (similarity > 0.85), reuse it
3. If not found, generate new asset
4. Register all new assets for future reuse

## Asset Reuse Strategy

MAXIMIZE REUSE to maintain visual consistency:
- Generic props (chairs, tables, barrels) → reuse across scenes
- Common NPCs (guards, merchants) → reuse different instances
- Standard doors/windows → reuse with different textures
- Environmental elements (trees, rocks) → reuse extensively

GENERATE NEW only for:
- Story-critical unique characters
- Landmark locations
- Plot-specific items
- Unique architectural elements

## Story Threads

**A Story (Guardian Quest)**: Mythical, ancient, legendary
- Style: Epic fantasy, mystical environments
- Assets: Ancient ruins, mythical creatures, magical artifacts

**B Story (Faction Politics)**: Social, age-appropriate
- Child: Bright, friendly, simple shapes
- Teen: Stylized, dynamic, relatable
- Adult: Realistic, complex, nuanced

**C Story (Ravens Mystery)**: Dark, mysterious, revelatory
- Style: Noir, shadows, dramatic lighting
- Assets: Secret passages, ominous symbols, dark figures

Generate scenes that fit the narrative arc and emotional beats of each story thread.`;
