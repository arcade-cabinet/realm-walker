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

export const RealmSchema = z.object({
  age: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    theme: z.string(),
    seed: z.string().optional(), // For re-hydrating the PRNG
  }),
  classes: z.array(RpgClassSchema),
  items: z.array(RpgItemSchema),
  bestiary: z.array(RpgBestiarySchema).optional() // The Monster Slot
});

export type Stats = z.infer<typeof StatsSchema>;
export type RpgClass = z.infer<typeof RpgClassSchema>;
export type RpgItem = z.infer<typeof RpgItemSchema>;
export type RpgBestiary = z.infer<typeof RpgBestiarySchema>;
// export type Unit = z.infer<typeof UnitSchema>; // Deprecated
// export type Building = z.infer<typeof BuildingSchema>; // Deprecated
// export type Race = z.infer<typeof RaceSchema>; // Deprecated
export type Realm = z.infer<typeof RealmSchema>;
