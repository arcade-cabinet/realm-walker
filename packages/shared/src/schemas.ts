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
// --- ARCHETYPAL SCHEMAS FOR MID-1990S RPG SYSTEMS ---

export const RpgMagicSystemSchema = z.object({
  id: z.string(),
  name: z.string(),
  systemType: z.enum(['esper_magicite', 'psi_psychic', 'materia_socketed', 'vancian', 'mana_pool']),
  description: z.string(),
  resourceType: z.enum(['mp', 'pp', 'ap', 'mana', 'spell_slots']),
  learningMechanism: z.enum(['ap_accumulation', 'level_based', 'item_based', 'trainer_based']),
  espers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    element: z.string(),
    spells: z.array(z.object({
      name: z.string(),
      learningRate: z.number(),
      mpCost: z.number(),
      power: z.number()
    })),
    statBonus: z.object({
      stat: z.string(),
      bonus: z.number()
    }).optional(),
    summonPower: z.number()
  })).optional(),
  abilities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    tier: z.string(), // α, β, γ, Ω for PSI
    category: z.enum(['offensive', 'healing', 'support', 'status']),
    cost: z.number(),
    power: z.number(),
    description: z.string()
  })).optional(),
  spellTiers: z.array(z.string()).optional(),
  statBonuses: z.boolean().default(false),
  summonPower: z.boolean().default(false)
});

export const RpgCharacterProgressionSchema = z.object({
  id: z.string(),
  name: z.string(),
  systemType: z.enum(['socketed_materia', 'skill_trees', 'class_based', 'stat_allocation']),
  description: z.string(),
  materiaSlots: z.number().optional(),
  slotTypes: z.array(z.enum(['single', 'linked_pair'])).optional(),
  materiaCategories: z.array(z.enum(['magic', 'summon', 'command', 'support', 'independent'])).optional(),
  growthMechanism: z.enum(['ap_accumulation', 'use_based', 'level_based']),
  statModification: z.boolean().default(false),
  customizationDepth: z.enum(['low', 'medium', 'high']),
  skillTrees: z.array(z.object({
    id: z.string(),
    name: z.string(),
    nodes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      requirements: z.array(z.string()),
      effects: z.array(z.string())
    }))
  })).optional()
});

export const RpgEquipmentSystemSchema = z.object({
  id: z.string(),
  name: z.string(),
  systemType: z.enum(['traditional', 'socketed', 'upgrade_based', 'set_based']),
  description: z.string(),
  socketTypes: z.array(z.string()).optional(),
  upgradeSystem: z.boolean().default(false),
  setBonus: z.boolean().default(false),
  durability: z.boolean().default(false),
  enchantments: z.boolean().default(false)
});

export const RpgCombatSystemSchema = z.object({
  id: z.string(),
  name: z.string(),
  systemType: z.enum(['active_time_battle', 'realtime_ring_menu', 'turn_based', 'tactical_grid']),
  description: z.string(),
  timingMechanism: z.enum(['speed_based_charging', 'initiative_order', 'simultaneous', 'player_controlled']),
  speedBasedTiming: z.boolean().default(false),
  actionModes: z.array(z.enum(['active', 'wait', 'recommended'])).optional(),
  castingTimes: z.boolean().default(false),
  interruptible: z.boolean().default(false),
  ringMenuInterface: z.boolean().default(false),
  realtimeCombat: z.boolean().default(false),
  chargeMechanics: z.boolean().default(false),
  weaponSkillProgression: z.boolean().default(false),
  cooperativePlay: z.boolean().default(false),
  castingInterruption: z.boolean().default(false),
  statusEffects: z.array(z.string()).optional()
});

export const RpgWorldEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  eventType: z.enum(['world_transformation', 'political_change', 'natural_disaster', 'magical_phenomenon']),
  scope: z.enum(['local', 'regional', 'global', 'world']),
  consequences: z.array(z.enum(['geography_change', 'party_separation', 'tone_shift', 'new_areas', 'character_arcs'])),
  triggerConditions: z.array(z.string()),
  permanentChanges: z.boolean().default(true),
  newAreas: z.boolean().default(false),
  characterArcs: z.boolean().default(false),
  nonLinearExploration: z.boolean().default(false)
});

export const RpgTimelineEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  year: z.number(),
  era: z.string(),
  timePeriod: z.string(),
  causalChains: z.array(z.object({
    cause: z.string(),
    effect: z.string(),
    timePeriod: z.string()
  })).optional(),
  recurringLocations: z.array(z.string()).optional(),
  technologyLevel: z.number().min(0).max(10),
  magicLevel: z.number().min(0).max(10),
  butterflyEffects: z.array(z.object({
    action: z.string(),
    consequence: z.string(),
    affectedPeriod: z.string()
  })).optional()
});

export const RpgSummonSchema = z.object({
  id: z.string(),
  name: z.string(),
  element: z.string(),
  description: z.string(),
  power: z.number(),
  mpCost: z.number(),
  animation: z.string(),
  effects: z.array(z.string()),
  rarity: z.enum(['common', 'rare', 'legendary', 'ultimate'])
});

export const RpgTechniqueSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  participantCount: z.number().min(2).max(3),
  techType: z.enum(['dual', 'triple']),
  requiredCharacters: z.array(z.string()),
  elementCombinations: z.array(z.string()).optional(),
  positioningEffects: z.array(z.enum(['line', 'area', 'single', 'all'])),
  powerLevel: z.enum(['normal', 'high', 'ultimate']),
  resourceCost: z.enum(['low', 'medium', 'high']),
  mpCost: z.number(),
  damage: z.number(),
  effects: z.array(z.string())
});

export const RpgStatusEffectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.enum(['negative', 'positive', 'neutral', 'unique']),
  duration: z.enum(['temporary', 'battle_persistent', 'until_cured']),
  stackable: z.boolean().default(false),
  visualIndicator: z.string(),
  effects: z.array(z.object({
    type: z.enum(['stat_modifier', 'action_restriction', 'damage_over_time', 'special']),
    value: z.number().optional(),
    description: z.string()
  })),
  cureConditions: z.array(z.string()),
  immunities: z.array(z.string()).optional()
});

export const RpgElementalSystemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  elements: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    weakTo: z.array(z.string()),
    strongAgainst: z.array(z.string()),
    absorbs: z.array(z.string()).optional(),
    nullifies: z.array(z.string()).optional()
  })),
  coreElements: z.array(z.string()),
  advancedElements: z.array(z.string()).optional(),
  weaknessChains: z.boolean().default(true),
  absorptionPossible: z.boolean().default(false),
  environmentalInteractions: z.boolean().default(false),
  equipmentAffinities: z.boolean().default(false)
});

// Export types for the new archetypal schemas
export type RpgMagicSystem = z.infer<typeof RpgMagicSystemSchema>;
export type RpgCharacterProgression = z.infer<typeof RpgCharacterProgressionSchema>;
export type RpgEquipmentSystem = z.infer<typeof RpgEquipmentSystemSchema>;
export type RpgCombatSystem = z.infer<typeof RpgCombatSystemSchema>;
export type RpgWorldEvent = z.infer<typeof RpgWorldEventSchema>;
export type RpgTimelineEvent = z.infer<typeof RpgTimelineEventSchema>;
export type RpgSummon = z.infer<typeof RpgSummonSchema>;
export type RpgTechnique = z.infer<typeof RpgTechniqueSchema>;
export type RpgStatusEffect = z.infer<typeof RpgStatusEffectSchema>;
export type RpgElementalSystem = z.infer<typeof RpgElementalSystemSchema>;