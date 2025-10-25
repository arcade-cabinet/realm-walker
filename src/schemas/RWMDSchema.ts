/**
 * Zod Schema for RWMD (Realm Walker Markup Description)
 * Enables AI-driven scene generation with structured validation
 */

import { z } from 'zod';

// Base position types
export const GridPositionSchema = z.tuple([z.number(), z.number()]);
export const WorldPositionSchema = z.tuple([z.number(), z.number(), z.number()]);
export const RotationSchema = z.tuple([z.number(), z.number(), z.number()]);
export const ScaleSchema = z.tuple([z.number(), z.number(), z.number()]);

// Grid configuration
export const GridConfigSchema = z.object({
  width: z.number().int().positive().describe('Grid width in tiles'),
  height: z.number().int().positive().describe('Grid height in tiles'),
  tileSize: z.number().positive().default(1.0).describe('Size of each tile in world units')
});

// Texture/Material references
export const TextureRefSchema = z.object({
  source: z.enum(['ambientCG', 'gpt-image-1', 'meshy', 'custom']).describe('Texture source'),
  id: z.string().describe('Texture identifier or prompt'),
  scale: z.number().positive().optional().describe('UV scale factor'),
  metadata: z.record(z.any()).optional()
});

// NPC slot definition
export const NPCSlotSchema = z.object({
  id: z.string().describe('Unique slot identifier'),
  position: GridPositionSchema.describe('Grid position for NPC'),
  npcType: z.string().optional().describe('NPC archetype (elder, merchant, guard, etc.)'),
  dialogueId: z.string().optional().describe('Associated dialogue tree ID'),
  questId: z.string().optional().describe('Associated quest ID'),
  appearance: z.object({
    modelPrompt: z.string().optional().describe('AI prompt for 3D model generation'),
    modelRef: z.string().optional().describe('Reference to existing model'),
    texturePrompt: z.string().optional(),
    animations: z.array(z.string()).optional().describe('Required animations (idle, talk, etc.)')
  }).optional()
});

// Prop slot definition
export const PropSlotSchema = z.object({
  id: z.string().describe('Unique slot identifier'),
  position: GridPositionSchema.describe('Grid position for prop'),
  propType: z.string().describe('Prop category (furniture, decoration, interactive, etc.)'),
  interactive: z.boolean().default(false),
  modelSpec: z.object({
    prompt: z.string().optional().describe('AI prompt for model generation'),
    modelRef: z.string().optional().describe('Reference to existing model'),
    style: z.enum(['lowpoly', 'realistic', 'stylized', 'fantasy']).optional(),
    dimensions: z.object({
      approximate: z.string().optional().describe('Size hint (small/medium/large)'),
      exact: WorldPositionSchema.optional()
    }).optional()
  }),
  rotation: RotationSchema.optional(),
  scale: ScaleSchema.optional()
});

// Door/Portal slot definition
export const DoorSlotSchema = z.object({
  id: z.string().describe('Unique slot identifier'),
  position: GridPositionSchema.describe('Grid position for door'),
  wall: z.enum(['north', 'south', 'east', 'west']).describe('Which wall the door is on'),
  targetScene: z.string().optional().describe('Scene ID this door leads to'),
  locked: z.boolean().default(false),
  requiresFlags: z.array(z.string()).optional().describe('Quest flags needed to unlock'),
  modelSpec: z.object({
    prompt: z.string().optional(),
    modelRef: z.string().optional(),
    style: z.enum(['wooden', 'stone', 'metal', 'magical', 'modern']).optional()
  }).optional()
});

// Wall definition
export const WallDefSchema = z.object({
  side: z.enum(['north', 'south', 'east', 'west', 'all']),
  height: z.number().positive().default(3.0),
  texture: TextureRefSchema.or(z.string()),
  openings: z.array(z.object({
    position: GridPositionSchema,
    width: z.number().positive(),
    height: z.number().positive()
  })).optional().describe('Windows, arches, etc.')
});

// Lighting definition
export const LightingSchema = z.object({
  ambient: z.object({
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    intensity: z.number().min(0).max(1)
  }).optional(),
  directional: z.array(z.object({
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    intensity: z.number().min(0),
    position: WorldPositionSchema,
    target: WorldPositionSchema.optional()
  })).optional(),
  point: z.array(z.object({
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    intensity: z.number().min(0),
    position: WorldPositionSchema,
    distance: z.number().positive().optional(),
    decay: z.number().positive().default(2)
  })).optional()
});

// Camera hints
export const CameraHintSchema = z.object({
  position: WorldPositionSchema.optional(),
  target: WorldPositionSchema.optional(),
  fov: z.number().min(10).max(120).optional(),
  preset: z.enum(['diorama', 'closeup', 'wide', 'cinematic']).optional()
});

// Complete RWMD Scene Template
export const RWMDSceneSchema = z.object({
  id: z.string().describe('Unique scene identifier'),
  name: z.string().describe('Human-readable scene name'),
  
  // Story context
  storyContext: z.object({
    thread: z.enum(['A', 'B', 'C']).describe('Story thread (A=Guardian, B=Faction, C=Ravens)'),
    chapterIndex: z.number().int().min(0).max(17).optional(),
    ageRange: z.enum(['child', 'teen', 'adult', 'all']).optional().describe('For B story age filtering'),
    mood: z.enum(['peaceful', 'tense', 'mysterious', 'action', 'somber', 'joyful']).optional(),
    timeOfDay: z.enum(['dawn', 'day', 'dusk', 'night']).optional()
  }),
  
  // Spatial configuration
  grid: GridConfigSchema,
  
  // Environment
  floor: z.object({
    texture: TextureRefSchema.or(z.string()),
    walkable: z.boolean().default(true)
  }),
  
  walls: z.array(WallDefSchema).optional(),
  
  ceiling: z.object({
    texture: TextureRefSchema.or(z.string()),
    height: z.number().positive().default(3.0)
  }).optional(),
  
  // Content slots
  slots: z.object({
    npcs: z.array(NPCSlotSchema).optional().describe('NPC spawn points'),
    props: z.array(PropSlotSchema).optional().describe('Props and decorations'),
    doors: z.array(DoorSlotSchema).optional().describe('Exits and portals')
  }),
  
  // Presentation
  lighting: LightingSchema.optional(),
  camera: CameraHintSchema.optional(),
  
  // Atmosphere
  atmosphere: z.object({
    fogDensity: z.number().min(0).max(1).optional(),
    fogColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    ambientSound: z.string().optional().describe('Audio atmosphere ID'),
    weatherEffect: z.enum(['none', 'rain', 'snow', 'fog', 'wind']).optional()
  }).optional(),
  
  // Metadata
  metadata: z.object({
    generatedBy: z.string().optional().describe('AI model used'),
    generationPrompt: z.string().optional().describe('Original creative direction'),
    tags: z.array(z.string()).optional(),
    version: z.string().default('1.0.0')
  }).optional()
});

// Asset generation request (for AI tools)
export const AssetGenerationRequestSchema = z.object({
  type: z.enum(['model', 'texture', 'audio']),
  prompt: z.string().describe('Creative description for AI generation'),
  style: z.string().optional(),
  constraints: z.object({
    polyCount: z.enum(['low', 'medium', 'high']).optional(),
    dimensions: z.string().optional(),
    format: z.string().optional(),
    animated: z.boolean().optional()
  }).optional(),
  reuseQuery: z.object({
    searchEmbedding: z.boolean().default(true),
    similarityThreshold: z.number().min(0).max(1).default(0.85),
    tags: z.array(z.string()).optional()
  }).optional()
});

// Export types
export type GridPosition = z.infer<typeof GridPositionSchema>;
export type WorldPosition = z.infer<typeof WorldPositionSchema>;
export type RWMDScene = z.infer<typeof RWMDSceneSchema>;
export type NPCSlot = z.infer<typeof NPCSlotSchema>;
export type PropSlot = z.infer<typeof PropSlotSchema>;
export type DoorSlot = z.infer<typeof DoorSlotSchema>;
export type AssetGenerationRequest = z.infer<typeof AssetGenerationRequestSchema>;
