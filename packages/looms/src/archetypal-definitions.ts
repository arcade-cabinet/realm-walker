import {
    LoomSettings,
    RpgCharacterProgression,
    RpgCharacterProgressionSchema,
    RpgCombatSystem,
    RpgCombatSystemSchema,
    RpgElementalSystem,
    RpgElementalSystemSchema,
    RpgMagicSystem,
    RpgMagicSystemSchema,
    RpgStatusEffect,
    RpgStatusEffectSchema,
    RpgTechnique,
    RpgTechniqueSchema,
    RpgTimelineEvent,
    RpgTimelineEventSchema,
    RpgWorldEvent,
    RpgWorldEventSchema
} from '@realm-walker/shared';
import { z } from 'zod';
import { GeminiModel } from './GeminiAdapter.js';
import { LoomDefinition } from './Loom.js';
import { RealmContext } from './definitions.js';

/**
 * ARCHETYPAL LOOM DDLs
 * 
 * These Looms are based on decomposition of mid-1990s RPG mechanics from:
 * - Final Fantasy VI (Esper/Magicite system, character progression, world events)
 * - Chrono Trigger (time travel, dual/triple techs, character combinations)
 * - Secret of Mana (real-time combat, ring menu, weapon progression)
 * - Earthbound (PSI system, modern setting, status effects)
 * 
 * Each Loom captures archetypal patterns that defined the golden age of RPGs.
 */

// --- MAGIC SYSTEM ARCHETYPAL LOOMS ---

/**
 * ESPER LOOM: Final Fantasy VI Magicite System
 * Generates magical beings that teach spells and provide stat bonuses
 */
export const EsperLoomDef: LoomDefinition<LoomSettings, RpgMagicSystem, RealmContext> = {
    name: "EsperLoom",
    tags: ['magic', 'summons', 'archetypal', 'ff6'],
    consumes: ['world', 'classes'],
    produces: ['magicSystem'],
    schema: RpgMagicSystemSchema as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const world = tapestry.get('world');
        const classes = tapestry.get('classes');
        
        const worldContext = world ? world.description : "A fantasy realm";
        const classContext = classes ? classes.map(c => c.name).join(', ') : "Warrior, Mage, Rogue";

        return `
        Weave an Esper/Magicite Magic System inspired by Final Fantasy VI.
        THEME: "${settings.age}"
        WORLD: ${worldContext}
        CLASSES: ${classContext}
        MAGIC LEVEL: ${settings.controls.magicLevel}/10
        
        ARCHETYPAL PATTERN - FF6 ESPER SYSTEM:
        1. Create 8-12 Espers (magical beings that become Magicite when defeated)
        2. Each Esper teaches 3-5 spells with learning rates (x1 to x10 multiplier)
        3. Espers provide stat bonuses when equipped during level up
        4. Include classic summons: Ifrit (Fire), Shiva (Ice), Ramuh (Lightning), Bahamut (Non-elemental)
        5. Spells have MP costs and elemental affinities
        6. Some Espers boost specific stats: +1 Strength, +2 Magic, etc.
        
        WARP CONSTRAINTS:
        - systemType: "esper_magicite"
        - learningMechanism: "ap_accumulation" 
        - statBonuses: true
        - summonPower: true
        - spellTiers: ["basic", "advanced", "ultimate"]
        
        Output strictly valid JSON for Magic System.
        `;
    },
    verify: (output) => {
        if (!output.espers || output.espers.length < 6) {
            throw new Error("Insufficient Espers generated (need at least 6)");
        }
        const hasClassicSummons = output.espers.some((e: any) => 
            ['Ifrit', 'Shiva', 'Ramuh', 'Bahamut'].includes(e.name)
        );
        if (!hasClassicSummons) {
            throw new Error("Missing classic FF6-style summons");
        }
    }
};

/**
 * PSI LOOM: Earthbound Psychic System
 * Generates PSI abilities with Greek letter progression (α, β, γ, Ω)
 */
export const PsiLoomDef: LoomDefinition<LoomSettings, RpgMagicSystem, RealmContext> = {
    name: "PsiLoom", 
    tags: ['magic', 'psychic', 'archetypal', 'earthbound'],
    consumes: ['classes'],
    produces: ['psiSystem'],
    schema: RpgMagicSystemSchema as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const classes = tapestry.get('classes');
        const classContext = classes ? classes.map(c => c.name).join(', ') : "Psychic, Fighter, Healer";

        return `
        Weave a PSI (Psychic) Magic System inspired by Earthbound.
        THEME: "${settings.age}"
        CLASSES: ${classContext}
        MAGIC LEVEL: ${settings.controls.magicLevel}/10
        
        ARCHETYPAL PATTERN - EARTHBOUND PSI SYSTEM:
        1. Create PSI abilities with Greek letter tiers: α (Alpha), β (Beta), γ (Gamma), Ω (Omega)
        2. Categories: Offensive (PK Fire, PK Thunder), Healing (Lifeup), Support (PSI Shield)
        3. PP (Psychic Points) cost system instead of MP
        4. Status effects: Paralysis, Sleep, Confusion, Diamondize
        5. Unique abilities: Teleport, PSI Magnet (PP drain), Brain Shock
        6. Modern/sci-fi flavor rather than fantasy
        
        WARP CONSTRAINTS:
        - systemType: "psi_psychic"
        - powerTiers: ["alpha", "beta", "gamma", "omega"]
        - resourceType: "pp" (Psychic Points)
        - categories: ["offensive", "healing", "support", "status"]
        - flavor: "modern_psychic"
        
        Output strictly valid JSON for PSI Magic System.
        `;
    },
    verify: (output) => {
        if (!output.abilities || output.abilities.length < 8) {
            throw new Error("Insufficient PSI abilities generated");
        }
        const hasGreekTiers = output.abilities.some((a: any) => 
            a.name.includes('α') || a.name.includes('β') || a.name.includes('γ') || a.name.includes('Ω')
        );
        if (!hasGreekTiers) {
            throw new Error("Missing Greek letter tier progression");
        }
    }
};

// --- CHARACTER PROGRESSION ARCHETYPAL LOOMS ---

/**
 * MATERIA LOOM: Final Fantasy VII-style Customization
 * Generates socketed equipment and growth systems
 */
export const MateriaLoomDef: LoomDefinition<LoomSettings, RpgCharacterProgression, RealmContext> = {
    name: "MateriaLoom",
    tags: ['progression', 'customization', 'archetypal', 'ff7'],
    consumes: ['classes', 'magicSystem'],
    produces: ['materiaProgression'],
    schema: RpgCharacterProgressionSchema as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const classes = tapestry.get('classes');
        const magic = tapestry.get('magicSystem');
        
        return `
        Weave a Materia-style Character Progression System.
        THEME: "${settings.age}"
        MAGIC LEVEL: ${settings.controls.magicLevel}/10
        
        ARCHETYPAL PATTERN - FF7 MATERIA SYSTEM:
        1. Socketed equipment with Materia slots (1-8 slots per item)
        2. Materia types: Magic, Summon, Command, Support, Independent
        3. AP growth system - Materia levels up through battle experience
        4. Linked Materia combinations (All + Restore = Full Party Heal)
        5. Stat modifications from equipped Materia
        6. Master Materia that birth new copies when maxed
        
        WARP CONSTRAINTS:
        - systemType: "socketed_materia"
        - slotTypes: ["single", "linked_pair"]
        - materiaCategories: ["magic", "summon", "command", "support", "independent"]
        - growthMechanism: "ap_accumulation"
        - statModification: true
        
        Output strictly valid JSON for Character Progression System.
        `;
    },
    verify: (output) => {
        if (!output.materiaSlots || output.materiaSlots < 4) {
            throw new Error("Insufficient Materia customization depth");
        }
    }
};

/**
 * DUAL TECH LOOM: Chrono Trigger Combination Attacks
 * Generates cooperative techniques between characters
 */
export const DualTechLoomDef: LoomDefinition<LoomSettings, RpgTechnique[], RealmContext> = {
    name: "DualTechLoom",
    tags: ['combat', 'cooperation', 'archetypal', 'chrono-trigger'],
    consumes: ['classes', 'abilities'],
    produces: ['dualTechs'],
    schema: z.array(RpgTechniqueSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const classes = tapestry.get('classes');
        const abilities = tapestry.get('abilities');
        
        const classContext = classes ? classes.map(c => c.name).join(', ') : "Warrior, Mage, Rogue";
        
        return `
        Weave Dual/Triple Tech Combination Attacks inspired by Chrono Trigger.
        THEME: "${settings.age}"
        CLASSES: ${classContext}
        
        ARCHETYPAL PATTERN - CHRONO TRIGGER TECHS:
        1. Dual Techs: Two characters combine abilities (X-Strike, Ice Sword, Fire Whirl)
        2. Triple Techs: Three characters ultimate combinations (Delta Force, Grand Dream)
        3. Element combinations: Fire + Sword = Flame Sword, Ice + Lightning = Glacier
        4. Positioning matters: Line attacks, area effects, single target focus
        5. High MP/TP cost but devastating power
        6. Unique animations and dramatic names
        
        WARP CONSTRAINTS:
        - techTypes: ["dual", "triple"]
        - elementCombinations: true
        - positioningEffects: ["line", "area", "single", "all"]
        - powerLevel: "ultimate"
        - resourceCost: "high"
        
        Generate 8-12 Dual Techs and 3-5 Triple Techs.
        Output strictly valid JSON Array of Techniques.
        `;
    },
    verify: (output) => {
        if (output.length < 10) {
            throw new Error("Insufficient combination techniques generated");
        }
        const hasDualTechs = output.some((t: any) => t.participantCount === 2);
        const hasTripleTechs = output.some((t: any) => t.participantCount === 3);
        if (!hasDualTechs || !hasTripleTechs) {
            throw new Error("Missing both Dual and Triple Tech varieties");
        }
    }
};

// --- COMBAT SYSTEM ARCHETYPAL LOOMS ---

/**
 * ATB LOOM: Active Time Battle System
 * Generates real-time turn-based combat mechanics
 */
export const AtbLoomDef: LoomDefinition<LoomSettings, RpgCombatSystem, RealmContext> = {
    name: "AtbLoom",
    tags: ['combat', 'realtime', 'archetypal', 'ff4-ff6'],
    produces: ['atbCombat'],
    schema: RpgCombatSystemSchema as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings) => {
        return `
        Weave an Active Time Battle (ATB) Combat System.
        THEME: "${settings.age}"
        TECH LEVEL: ${settings.controls.technologyLevel}/10
        
        ARCHETYPAL PATTERN - FF4/FF6 ATB SYSTEM:
        1. Real-time charging ATB bars based on character Speed/Agility
        2. Action selection pauses or slows time (configurable)
        3. Speed determines turn frequency, not just turn order
        4. Spell casting times vary (Quick spells vs Slow powerful spells)
        5. Interrupt mechanics for long-casting spells
        6. Haste/Slow status effects modify ATB charge rate
        7. Wait modes: Active (real-time) vs Wait (paused during menus)
        
        WARP CONSTRAINTS:
        - systemType: "active_time_battle"
        - timingMechanism: "speed_based_charging"
        - actionModes: ["active", "wait", "recommended"]
        - castingTimes: true
        - interruptible: true
        - statusEffects: ["haste", "slow", "stop"]
        
        Output strictly valid JSON for Combat System.
        `;
    },
    verify: (output) => {
        if (output.systemType !== "active_time_battle") {
            throw new Error("Must be ATB system type");
        }
        if (!output.speedBasedTiming) {
            throw new Error("Missing speed-based timing mechanics");
        }
    }
};

/**
 * RING MENU LOOM: Secret of Mana Interface System
 * Generates radial menu combat interface
 */
export const RingMenuLoomDef: LoomDefinition<LoomSettings, RpgCombatSystem, RealmContext> = {
    name: "RingMenuLoom",
    tags: ['interface', 'realtime', 'archetypal', 'secret-of-mana'],
    consumes: ['abilities', 'items'],
    produces: ['ringMenuCombat'],
    schema: RpgCombatSystemSchema as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const abilities = tapestry.get('abilities');
        const items = tapestry.get('items');
        
        return `
        Weave a Ring Menu Real-Time Combat System inspired by Secret of Mana.
        THEME: "${settings.age}"
        
        ARCHETYPAL PATTERN - SECRET OF MANA RING SYSTEM:
        1. Real-time action combat with pause-for-menu mechanics
        2. Radial ring menus for spells, items, and commands
        3. Weapon charge meters that build power over time
        4. No button mashing - timing and patience rewarded
        5. Cooperative multiplayer support (up to 3 players)
        6. Magic casting interrupts movement temporarily
        7. Weapon skill levels that improve with use
        
        WARP CONSTRAINTS:
        - systemType: "realtime_ring_menu"
        - interfaceType: "radial_pause"
        - chargeMechanics: true
        - weaponSkillProgression: true
        - cooperativePlay: true
        - castingInterruption: true
        
        Output strictly valid JSON for Combat System.
        `;
    },
    verify: (output) => {
        if (!output.ringMenuInterface) {
            throw new Error("Missing ring menu interface mechanics");
        }
        if (!output.realtimeCombat) {
            throw new Error("Must support real-time combat");
        }
    }
};

// --- WORLD EVENT ARCHETYPAL LOOMS ---

/**
 * TIME TRAVEL LOOM: Chrono Trigger Timeline System
 * Generates time periods and causal event chains
 */
export const TimeTravelLoomDef: LoomDefinition<LoomSettings, RpgTimelineEvent[], RealmContext> = {
    name: "TimeTravelLoom",
    tags: ['narrative', 'time', 'archetypal', 'chrono-trigger'],
    consumes: ['world', 'history'],
    produces: ['timelineEvents'],
    schema: z.array(RpgTimelineEventSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const world = tapestry.get('world');
        const history = tapestry.get('history');
        
        const worldContext = world ? world.description : "A world across time";
        const historyContext = history ? history.map(h => h.name).join(', ') : "Ancient events";
        
        return `
        Weave a Time Travel Timeline System inspired by Chrono Trigger.
        THEME: "${settings.age}"
        WORLD: ${worldContext}
        HISTORY: ${historyContext}
        
        ARCHETYPAL PATTERN - CHRONO TRIGGER TIME PERIODS:
        1. Multiple time eras: Prehistoric (65M BC), Ancient (12K BC), Middle Ages (600 AD), Present (1000 AD), Future (1999 AD, 2300 AD)
        2. Causal relationships: Actions in past affect future
        3. Time gates/portals as travel mechanism
        4. Era-specific technology and magic levels
        5. Recurring locations across time periods
        6. Butterfly effect consequences
        7. Multiple endings based on when final boss is defeated
        
        WARP CONSTRAINTS:
        - timePeriods: 4-6 distinct eras
        - causalChains: true
        - recurringLocations: true
        - technologyProgression: true
        - multipleEndings: true
        - butterflyEffects: true
        
        Generate timeline events showing cause-and-effect across eras.
        Output strictly valid JSON Array of Timeline Events.
        `;
    },
    verify: (output) => {
        if (output.length < 4) {
            throw new Error("Need at least 4 time periods");
        }
        const hasTimeSpan = output.some((e: any) => e.year < 0) && output.some((e: any) => e.year > 2000);
        if (!hasTimeSpan) {
            throw new Error("Timeline must span from ancient past to far future");
        }
    }
};

/**
 * APOCALYPSE LOOM: Final Fantasy VI World of Ruin
 * Generates world-changing catastrophic events
 */
export const ApocalypseLoomDef: LoomDefinition<LoomSettings, RpgWorldEvent[], RealmContext> = {
    name: "ApocalypseLoom",
    tags: ['narrative', 'catastrophe', 'archetypal', 'ff6'],
    consumes: ['world', 'factions', 'npcs'],
    produces: ['apocalypseEvents'],
    schema: z.array(RpgWorldEventSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const world = tapestry.get('world');
        const factions = tapestry.get('factions');
        
        const worldContext = world ? world.description : "A balanced world";
        const factionContext = factions ? factions.map(f => f.name).join(', ') : "Various factions";
        
        return `
        Weave an Apocalyptic World Event System inspired by FF6's World of Ruin.
        THEME: "${settings.age}"
        WORLD: ${worldContext}
        FACTIONS: ${factionContext}
        DANGER LEVEL: ${settings.controls.dangerLevel}/10
        
        ARCHETYPAL PATTERN - FF6 WORLD OF RUIN:
        1. Catastrophic mid-game event that transforms the world
        2. "World of Balance" becomes "World of Ruin"
        3. Continents shattered into islands
        4. Party members scattered and must be reunited
        5. Some locations destroyed, others transformed
        6. New areas accessible only post-apocalypse
        7. Darker tone, higher stakes, optional character quests
        8. Non-linear exploration in the ruined world
        
        WARP CONSTRAINTS:
        - eventType: "world_transformation"
        - scope: "global_catastrophe"
        - consequences: ["geography_change", "party_separation", "tone_shift"]
        - newAreas: true
        - characterArcs: true
        - nonLinearExploration: true
        
        Generate the apocalyptic event and its cascading consequences.
        Output strictly valid JSON Array of World Events.
        `;
    },
    verify: (output) => {
        if (output.length < 1) {
            throw new Error("Must generate at least one apocalyptic event");
        }
        const hasGlobalScope = output.some((e: any) => e.scope === "global" || e.scope === "world");
        if (!hasGlobalScope) {
            throw new Error("Apocalypse must have global/world scope");
        }
    }
};

// --- STATUS EFFECT ARCHETYPAL LOOMS ---

/**
 * STATUS AILMENT LOOM: Classic RPG Status Effects
 * Generates comprehensive status effect systems
 */
export const StatusAilmentLoomDef: LoomDefinition<LoomSettings, RpgStatusEffect[], RealmContext> = {
    name: "StatusAilmentLoom",
    tags: ['combat', 'status', 'archetypal', 'classic-rpg'],
    produces: ['statusEffects'],
    schema: z.array(RpgStatusEffectSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings) => {
        return `
        Weave Classic RPG Status Effects inspired by mid-1990s games.
        THEME: "${settings.age}"
        MAGIC LEVEL: ${settings.controls.magicLevel}/10
        
        ARCHETYPAL PATTERN - CLASSIC STATUS EFFECTS:
        1. Negative: Poison, Sleep, Paralysis, Confusion, Silence, Blind, Petrify
        2. Positive: Haste, Protect, Shell, Regen, Reflect, Float
        3. Unique: Berserk (auto-attack), Charm (enemy control), Stop (time freeze)
        4. Earthbound-style: Diamondize, Mushroomization, Feeling Strange
        5. Duration-based or battle-persistent
        6. Stackable effects where appropriate
        7. Visual indicators and battle message feedback
        
        WARP CONSTRAINTS:
        - categories: ["negative", "positive", "neutral", "unique"]
        - durations: ["temporary", "battle_persistent", "until_cured"]
        - stackable: some effects
        - visualIndicators: true
        - cureConditions: defined for each
        
        Generate 15-20 status effects covering all major categories.
        Output strictly valid JSON Array of Status Effects.
        `;
    },
    verify: (output) => {
        if (output.length < 12) {
            throw new Error("Insufficient status effects generated");
        }
        const hasNegative = output.some((s: any) => s.category === "negative");
        const hasPositive = output.some((s: any) => s.category === "positive");
        if (!hasNegative || !hasPositive) {
            throw new Error("Must have both positive and negative status effects");
        }
    }
};

// --- ELEMENTAL SYSTEM ARCHETYPAL LOOMS ---

/**
 * ELEMENTAL WHEEL LOOM: Rock-Paper-Scissors Magic System
 * Generates elemental affinities and weaknesses
 */
export const ElementalWheelLoomDef: LoomDefinition<LoomSettings, RpgElementalSystem, RealmContext> = {
    name: "ElementalWheelLoom",
    tags: ['magic', 'elements', 'archetypal', 'classic-rpg'],
    produces: ['elementalSystem'],
    schema: RpgElementalSystemSchema as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings) => {
        return `
        Weave an Elemental Affinity System inspired by classic RPGs.
        THEME: "${settings.age}"
        MAGIC LEVEL: ${settings.controls.magicLevel}/10
        
        ARCHETYPAL PATTERN - ELEMENTAL WHEEL:
        1. Core Elements: Fire, Ice, Lightning, Earth, Water, Wind
        2. Advanced: Holy/Light, Dark/Shadow, Poison, Non-elemental
        3. Weakness chains: Fire weak to Ice, Ice weak to Fire, etc.
        4. Absorption possibilities: Fire creatures absorb Fire damage
        5. Null/Immunity: Some creatures immune to certain elements
        6. Elemental weapons and armor
        7. Environmental interactions: Fire melts ice, Lightning conducts through water
        
        WARP CONSTRAINTS:
        - coreElements: ["fire", "ice", "lightning", "earth", "water", "wind"]
        - advancedElements: ["holy", "dark", "poison", "non-elemental"]
        - weaknessChains: true
        - absorptionPossible: true
        - environmentalInteractions: true
        - equipmentAffinities: true
        
        Output strictly valid JSON for Elemental System.
        `;
    },
    verify: (output) => {
        if (!output.elements || output.elements.length < 6) {
            throw new Error("Must have at least 6 core elements");
        }
        const hasCoreElements = ['fire', 'ice', 'lightning'].every(element =>
            output.elements.some((e: any) => e.name.toLowerCase().includes(element))
        );
        if (!hasCoreElements) {
            throw new Error("Missing core elemental triad");
        }
    }
};
