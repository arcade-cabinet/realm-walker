import { z } from 'zod';

// --- BASE SCHEMAS ---

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

export const StatsSchema = z.object({
  str: z.number(),
  agi: z.number(),
  int: z.number(),
  dex: z.number().optional(),
  hp: z.number(),
  sp: z.number().optional()
});

export type Stats = z.infer<typeof StatsSchema>;

// --- PRACTICAL SCHEMAS ---

export const RpgShopSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['general', 'blacksmith', 'alchemist', 'magic', 'relics']),
  locationNodeId: z.string(),
  inventory: z.array(z.object({
    itemId: z.string(),
    priceMultiplier: z.number().default(1),
    stock: z.number().default(99)
  })),
  keeper: z.object({
    name: z.string(),
    personality: z.string()
  })
});

export const RpgTalentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  classId: z.string().optional(),
  type: z.enum(['passive', 'active', 'ultimate']),
  requirements: z.object({
    level: z.number().default(1),
    stat: z.object({ name: z.string(), value: z.number() }).optional()
  }).default({ level: 1 }),
  effects: z.array(z.string())
});

export const RpgAbilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['physical', 'magical', 'support']),
  damage: z.number().default(0),
  cost: z.object({
    mp: z.number().default(0),
    sp: z.number().default(0)
  }).default({ mp: 0, sp: 0 }),
  target: z.enum(['single', 'all', 'self', 'ally']),
  visuals: z.object({
    animationId: z.string().default("none"),
    color: z.string().default("#FFFFFF")
  }).default({ animationId: "none", color: "#FFFFFF" })
});

export const RpgDialogueSchema = z.object({
  id: z.string(),
  speakerId: z.string().optional(),
  text: z.string(),
  trigger: z.enum(['greet', 'quest_start', 'quest_turnin', 'rumor', 'battle_cry']),
  conditions: z.array(z.string()).default([])
});

export const RpgNpcSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['villager', 'guard', 'merchant', 'boss', 'monster_elite']),
  description: z.string(),
  stats: StatsSchema,
  visuals: z.object({
    spriteId: z.string(),
    scale: z.number().default(1)
  }),
  dialogue: z.array(z.string()).default([]),
  lootTableId: z.string().optional()
});

export type RpgShop = z.infer<typeof RpgShopSchema>;
export type RpgTalent = z.infer<typeof RpgTalentSchema>;
export type RpgAbility = z.infer<typeof RpgAbilitySchema>;
export type RpgDialogue = z.infer<typeof RpgDialogueSchema>;
export type RpgNpc = z.infer<typeof RpgNpcSchema>;

// --- CORE RPG SCHEMAS ---

export const RpgClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  stats: StatsSchema,
  skillsToLearn: z.array(z.object({
    level: z.number(),
    skillId: z.string()
  })).default([]),
  visuals: z.object({
    spriteId: z.string(),
    billboard: z.boolean().default(true),
    scale: z.number().default(1),
    tint: z.string().optional()
  }).default({ spriteId: "hero_base" })
});

export const RpgItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().default(0),
  hpValue: z.number().default(0),
  hitRate: z.number().default(0),
  consumable: z.boolean().default(false),
  type: z.enum(['item', 'weapon', 'armor']),
  visuals: z.object({
    iconId: z.string(),
    spriteId: z.string().optional(),
    tint: z.string().optional()
  }).default({ iconId: "generic_item" })
});

export const RpgBestiarySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  stats: StatsSchema,
  behavior: z.enum(['aggressive', 'neutral', 'scared', 'stationary']).default('neutral'),
  lootTable: z.array(z.object({
    itemId: z.string(),
    chance: z.number()
  })).optional(),
  visuals: z.object({
    spriteId: z.string(),
    scale: z.number().default(1),
    tint: z.string().optional()
  }).default({ spriteId: "monster_base", scale: 1 })
});

export type RpgClass = z.infer<typeof RpgClassSchema>;
export type RpgItem = z.infer<typeof RpgItemSchema>;
export type RpgBestiary = z.infer<typeof RpgBestiarySchema>;

// --- LOOM SCHEMAS ---

export const LoomNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['start', 'end', 'hub', 'dungeon', 'town', 'wild']),
  biome: z.string(),
  dangerLevel: z.number().min(1).max(10),
  visuals: z.object({
    color: z.string().optional(),
    icon: z.string().optional()
  }).optional()
});

export const LoomEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(['road', 'path', 'river', 'portal']),
  travelTime: z.number()
});

export const RpgLoomSchema = z.object({
  nodes: z.array(LoomNodeSchema),
  edges: z.array(LoomEdgeSchema),
  name: z.string().optional(),
  description: z.string().optional()
});

export const LoomSettingsSchema = z.object({
  seed: z.string(),
  age: z.string(),
  controls: z.object({
    worldScale: z.number().min(1).max(10),
    minNodes: z.number().min(3),
    dangerLevel: z.number().min(1).max(10),
    magicLevel: z.number().min(0).max(10),
    technologyLevel: z.number().min(0).max(10)
  }),
  preferences: z.object({
    factions: z.boolean().default(true),
    items: z.boolean().default(true),
    bestiary: z.boolean().default(true),
    hero: z.boolean().default(true),
    quests: z.boolean().default(true),
    biases: z.object({
      questFocus: z.enum(['dungeon', 'political', 'exploration', 'balanced']).default('balanced'),
      combatDifficulty: z.enum(['story', 'balanced', 'brutal']).default('balanced')
    }).optional()
  }).optional()
});

export const RealmSchema = z.object({
  age: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    theme: z.string(),
    seed: z.string().optional(),
  }),
  classes: z.array(RpgClassSchema),
  items: z.array(RpgItemSchema),
  bestiary: z.array(RpgBestiarySchema).optional()
});

export type LoomNode = z.infer<typeof LoomNodeSchema>;
export type LoomEdge = z.infer<typeof LoomEdgeSchema>;
export type RpgLoom = z.infer<typeof RpgLoomSchema>;
export type LoomSettings = z.infer<typeof LoomSettingsSchema>;
export type Realm = z.infer<typeof RealmSchema>;

// --- FACTION SCHEMAS ---

export const FactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  archetype: z.enum(['empire', 'rebellion', 'cult', 'merchant', 'scholars', 'tribe']),
  motto: z.string(),
  homeNodeId: z.string(),
  allies: z.array(z.string()),
  enemies: z.array(z.string()),
  colors: z.array(z.string()).length(2),
  emblem: z.string().optional()
});

export type RpgFaction = z.infer<typeof FactionSchema>;

// --- HERO & QUEST SCHEMAS ---

export const RpgHeroSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  biography: z.string(),
  classId: z.string().default('adventurer'),
  factionId: z.string().optional(),
  originNodeId: z.string(),
  stats: StatsSchema,
  visuals: z.object({
    portraitId: z.string().optional(),
    spriteId: z.string()
  })
});

export const RpgQuestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  giver: z.object({
    id: z.string(),
    type: z.enum(['hero', 'faction', 'board'])
  }),
  objectives: z.array(z.object({
    type: z.enum(['kill', 'fetch', 'explore', 'talk']),
    targetId: z.string(),
    amount: z.number().default(1),
    description: z.string()
  })),
  rewards: z.object({
    gold: z.number().optional(),
    items: z.array(z.string()).optional(),
    xp: z.number().optional()
  })
});

export type RpgHero = z.infer<typeof RpgHeroSchema>;
export type RpgQuest = z.infer<typeof RpgQuestSchema>;

// --- ESOTERIC SCHEMAS ---

export const RpgHistoryEventSchema = z.object({
  year: z.number(),
  name: z.string(),
  description: z.string(),
  era: z.string(),
  type: z.enum(['war', 'discovery', 'cataclysm', 'founding'])
});

export const RpgGodSchema = z.object({
  id: z.string(),
  name: z.string(),
  domains: z.array(z.string()),
  symbol: z.string(),
  description: z.string(),
  alignment: z.enum(['lawful', 'chaotic', 'neutral', 'good', 'evil']).optional()
});

export const RpgDungeonRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['entry', 'corridor', 'hall', 'puzzle', 'boss', 'loot']),
  traps: z.boolean().default(false),
  monsters: z.array(z.string()).optional(),
  loot: z.array(z.string()).optional()
});

export const RpgDungeonSchema = z.object({
  id: z.string(),
  name: z.string(),
  theme: z.string(),
  rooms: z.array(RpgDungeonRoomSchema),
  connections: z.array(z.object({
    from: z.string(),
    to: z.string()
  }))
});

export type RpgHistoryEvent = z.infer<typeof RpgHistoryEventSchema>;
export type RpgGod = z.infer<typeof RpgGodSchema>;
export type RpgDungeon = z.infer<typeof RpgDungeonSchema>;
