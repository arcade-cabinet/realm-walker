import { z } from 'zod';

export const VisualConfigSchema = z.object({
  furColor: z.string(),
  secondaryColor: z.string(),
  furDensity: z.enum(['low', 'medium', 'high']),
  bodySize: z.enum(['small', 'medium', 'large']),
  tailStyle: z.enum(['thick', 'slim', 'bushy', 'streamlined']),
});

export const TraitSchema = z.object({
  cultural: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

// RPG-JS compatible schemas

export const StatsSchema = z.object({
  str: z.number(),
  agi: z.number(),
  int: z.number(),
  dex: z.number().optional(),
  hp: z.number(),
  sp: z.number().optional()
});

export const RpgClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  stats: StatsSchema,
  skillsToLearn: z.array(z.object({
    level: z.number(),
    skillId: z.string()
  })).optional(),
  visuals: z.object({
    spriteId: z.string(), // e.g. "warrior_idle_se"
    billboard: z.boolean().default(true),
    scale: z.number().default(1),
    tint: z.string().optional()
  }).optional()
});

export const RpgItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().optional(),
  hpValue: z.number().optional(),
  hitRate: z.number().optional(),
  consumable: z.boolean().optional(),
  type: z.enum(['item', 'weapon', 'armor']),
  visuals: z.object({
    iconId: z.string(), // 2D Icon for inventory
    spriteId: z.string().optional(), // Dropped/Equipped sprite (billboard)
    tint: z.string().optional()
  }).optional()
});

export const RpgBestiarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  stats: StatsSchema, // Reusing standard stats (HP, STR, etc.)
  behavior: z.enum(['aggressive', 'neutral', 'scared', 'stationary']).default('neutral'),
  lootTable: z.array(z.object({
    itemId: z.string(),
    chance: z.number() // 0.0 to 1.0
  })).optional(),
  visuals: z.object({
    spriteId: z.string(),
    scale: z.number().default(1),
    tint: z.string().optional()
  })
});

export const LoomNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  biome: z.enum(['forest', 'cave', 'sky', 'tech', 'city', 'ruin']),
  difficulty: z.number().min(1).max(11),
  encounters: z.array(z.string()).optional() // IDs from Bestiary
});

export const LoomEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  description: z.string(),
  travelTime: z.number().default(1)
});

export const RpgLoomSchema = z.object({
  title: z.string(),
  summary: z.string(),
  nodes: z.array(LoomNodeSchema),
  edges: z.array(LoomEdgeSchema)
});

export const LoomSettingsSchema = z.object({
  seed: z.string(),
  age: z.string().default('ancient'),
  controls: z.object({
    worldScale: z.number().min(1).max(10).default(5),
    minNodes: z.number().min(3).max(20).default(5),
    dangerLevel: z.number().min(1).max(11).default(5), // Spinal Tap
    magicLevel: z.number().min(1).max(10).default(5),
    technologyLevel: z.number().min(1).max(10).default(1)
  })
});

export const RealmSchema = z.object({
  age: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    theme: z.string(),
    seed: z.string().optional(), // For re-hydrating the PRNG
    settings: LoomSettingsSchema.optional() // Persist settings used for gen
  }),
  classes: z.array(RpgClassSchema),
  items: z.array(RpgItemSchema),
  bestiary: z.array(RpgBestiarySchema).optional(), // The Monster Slot
  loom: RpgLoomSchema.optional() // The Narrative Graph Slot
});

export type Stats = z.infer<typeof StatsSchema>;
export type RpgClass = z.infer<typeof RpgClassSchema>;
export type RpgItem = z.infer<typeof RpgItemSchema>;
export type RpgBestiary = z.infer<typeof RpgBestiarySchema>;
export type LoomNode = z.infer<typeof LoomNodeSchema>;
export type LoomEdge = z.infer<typeof LoomEdgeSchema>;
export type RpgLoom = z.infer<typeof RpgLoomSchema>;
export type LoomSettings = z.infer<typeof LoomSettingsSchema>;
export type Realm = z.infer<typeof RealmSchema>;
