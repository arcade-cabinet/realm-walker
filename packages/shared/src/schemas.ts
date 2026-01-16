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

// --- Macro Looms ---

export const FactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  ideology: z.enum(['Technocracy', 'Theocracy', 'Monarchy', 'Anarchy', 'MerchantRepublic', 'Tribal']),
  visuals: z.object({
    color: z.string(), // Hex
    emblemId: z.string().optional()
  }),
  rivals: z.array(z.string()).optional(), // Rival Faction IDs
  allies: z.array(z.string()).optional(),
  control: z.array(z.string()).optional() // Controlled Node IDs
});

export const HistoryEventSchema = z.object({
  year: z.number(),
  name: z.string(),
  description: z.string(),
  relatedFactionId: z.string().optional()
});

export const HistorySchema = z.object({
  eras: z.array(z.object({
    name: z.string(),
    duration: z.string(), // "100 years"
    events: z.array(HistoryEventSchema)
  })),
  secrets: z.array(z.object({
    nodeId: z.string(),
    description: z.string(), // Hidden lore
    discoveryCondition: z.string().optional()
  })).optional()
});

// --- Micro Looms ---

export const TownSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  size: z.enum(['Hamlet', 'Village', 'Town', 'City', 'Metropolis']),
  services: z.array(z.enum(['Inn', 'Blacksmith', 'GeneralStore', 'Alchemist', 'GuildHall', 'Temple'])),
  npcDensity: z.string(), // "Crowded", "Sparse"
  aesthetics: z.string() // "Steampunk", "Rustic"
});

export const DungeonSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  dangerLevel: z.number().min(1).max(11),
  layout: z.enum(['Linear', 'Branching', 'Cyclic', 'Open', 'Labyrinth']),
  traps: z.number().min(0).max(100), // Percentage chance
  bossId: z.string().optional(), // Bestiary ID
  lootTableId: z.string().optional()
});

// --- Narrative Looms ---

export const HeroSchema = z.object({
  id: z.string(),
  name: z.string(),
  classId: z.string(), // RpgClass ID
  description: z.string(),
  personality: z.string(), // Context for Dialogue AI
  joinCondition: z.string(), // "Level(5)", "Item(sword)"
  visuals: z.object({
    spriteId: z.string(),
    portraitId: z.string().optional()
  })
});

export const QuestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  giverId: z.string().optional(), // Hero/NPC ID
  nodeId: z.string(), // Where it starts
  objectives: z.array(z.object({
    type: z.enum(['Kill', 'Fetch', 'Escort', 'Explore', 'Diplomacy']),
    targetId: z.string().optional(), // Item/Monster/Node ID
    amount: z.number().default(1),
    description: z.string()
  })),
  rewards: z.object({
    gold: z.number().optional(),
    xp: z.number().optional(),
    items: z.array(z.string()).optional() // Item IDs
  })
});

// --- Aggregation ---

export const RealmSchema = z.object({
  age: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    theme: z.string(),
    seed: z.string().optional(),
    settings: LoomSettingsSchema.optional()
  }),
  // Macro
  loom: RpgLoomSchema.optional(), // The Graph
  factions: z.array(FactionSchema).optional(),
  history: HistorySchema.optional(),
  // Micro
  towns: z.array(TownSchema).optional(),
  dungeons: z.array(DungeonSchema).optional(),
  // Narrative
  classes: z.array(RpgClassSchema),
  heroes: z.array(HeroSchema).optional(), // The 108 Stars
  bestiary: z.array(RpgBestiarySchema).optional(),
  items: z.array(RpgItemSchema),
  quests: z.array(QuestSchema).optional()
});

export type Stats = z.infer<typeof StatsSchema>;
export type RpgClass = z.infer<typeof RpgClassSchema>;
export type RpgItem = z.infer<typeof RpgItemSchema>;
export type RpgBestiary = z.infer<typeof RpgBestiarySchema>;
export type LoomNode = z.infer<typeof LoomNodeSchema>;
export type LoomEdge = z.infer<typeof LoomEdgeSchema>;
export type RpgLoom = z.infer<typeof RpgLoomSchema>;
export type LoomSettings = z.infer<typeof LoomSettingsSchema>;
// New Types
export type Faction = z.infer<typeof FactionSchema>;
export type History = z.infer<typeof HistorySchema>;
export type Town = z.infer<typeof TownSchema>;
export type Dungeon = z.infer<typeof DungeonSchema>;
export type Hero = z.infer<typeof HeroSchema>;
export type Quest = z.infer<typeof QuestSchema>;

export type Realm = z.infer<typeof RealmSchema>;
