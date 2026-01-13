import { LoomSettings } from '@realm-walker/shared';
import { Shuttle } from './Shuttle.js';
import { Tapestry } from './Tapestry.js';
import {
    ApocalypseLoomDef,
    AtbLoomDef,
    DualTechLoomDef,
    ElementalWheelLoomDef,
    // Archetypal Looms
    EsperLoomDef,
    MateriaLoomDef,
    PsiLoomDef,
    RingMenuLoomDef,
    StatusAilmentLoomDef,
    TimeTravelLoomDef
} from './archetypal-definitions.js';
import {
    AbilityLoomDef,
    BestiaryLoomDef,
    ClassLoomDef,
    DialogueLoomDef,
    DungeonLoomDef,
    FactionLoomDef,
    HeroLoomDef,
    HistoryLoomDef,
    ItemLoomDef,
    NpcLoomDef,
    PantheonLoomDef,
    QuestLoomDef,
    ShopLoomDef, TalentLoomDef,
    // Original Looms
    WorldLoomDef
} from './definitions.js';

/**
 * ARCHETYPAL TAPESTRY CONTEXT
 * 
 * Extended context that includes all mid-1990s RPG archetypal systems
 */
export interface ArchetypalRealmContext {
    // Core World Building
    settings: LoomSettings;
    world?: any;
    factions?: any[];
    items?: any[];
    bestiary?: any[];
    hero?: any;
    quests?: any[];
    history?: any[];
    pantheon?: any[];
    dungeons?: any[];
    shops?: any[];
    talents?: any[];
    npcs?: any[];
    classes?: any[];
    abilities?: any[];
    dialogue?: any[];
    
    // Archetypal Magic Systems
    magicSystem?: any;        // Esper/Magicite system
    psiSystem?: any;          // Earthbound PSI system
    
    // Character Progression Systems
    materiaProgression?: any; // FF7-style socketed system
    
    // Combat Systems
    atbCombat?: any;          // Active Time Battle
    ringMenuCombat?: any;     // Secret of Mana style
    dualTechs?: any[];        // Chrono Trigger combinations
    
    // World Event Systems
    timelineEvents?: any[];   // Time travel mechanics
    apocalypseEvents?: any[]; // World transformation events
    
    // Status & Elemental Systems
    statusEffects?: any[];    // Classic RPG status ailments
    elementalSystem?: any;    // Elemental wheel system
}

/**
 * ARCHETYPAL TAPESTRY ORCHESTRATOR
 * 
 * Weaves a complete RPG realm using both traditional and archetypal Loom patterns
 * inspired by the golden age of mid-1990s RPGs.
 */
export class ArchetypalTapestry {
    private shuttle: Shuttle<ArchetypalRealmContext>;
    
    constructor(apiKey?: string) {
        const tapestry = new Tapestry<ArchetypalRealmContext>({} as ArchetypalRealmContext);
        this.shuttle = new Shuttle(apiKey || process.env.GEMINI_API_KEY || '', tapestry);
    }
    
    /**
     * Weaves a complete archetypal RPG realm following mid-1990s patterns
     */
    async weaveArchetypalRealm(settings: LoomSettings): Promise<ArchetypalRealmContext> {
        console.log("🌟 Weaving Archetypal RPG Realm...");
        console.log(`📖 Theme: ${settings.age}`);
        console.log(`🎲 Seed: ${settings.seed}`);
        
        // Initialize with settings
        this.shuttle.addJob(
            { ...WorldLoomDef, name: "InitializeSettings" } as any,
            {
                transform: () => settings,
                onWeave: (result, tapestry) => {
                    tapestry.weave('settings', settings);
                    tapestry.weave('world', result);
                }
            }
        );
        
        // === PHASE 1: FOUNDATIONAL WORLD BUILDING ===
        console.log("🏗️  Phase 1: Foundational World Building");
        
        // Core world structure
        this.shuttle
            .addJob(WorldLoomDef)
            .addJob(HistoryLoomDef)
            .addJob(PantheonLoomDef)
            .addJob(FactionLoomDef);
            
        // === PHASE 2: ARCHETYPAL MAGIC SYSTEMS ===
        console.log("✨ Phase 2: Archetypal Magic Systems");
        
        // Choose magic system based on theme/preferences
        if (settings.controls.magicLevel >= 7) {
            // High magic: Use Esper system (FF6 style)
            this.shuttle.addJob(EsperLoomDef);
        } else if (settings.age.toLowerCase().includes('modern') || settings.age.toLowerCase().includes('sci')) {
            // Modern/Sci-fi: Use PSI system (Earthbound style)
            this.shuttle.addJob(PsiLoomDef);
        } else {
            // Default: Traditional magic with elemental wheel
            this.shuttle.addJob(ElementalWheelLoomDef);
        }
        
        // === PHASE 3: CHARACTER SYSTEMS ===
        console.log("👥 Phase 3: Character Systems");
        
        this.shuttle
            .addJob(ClassLoomDef)
            .addJob(HeroLoomDef)
            .addJob(AbilityLoomDef)
            .addJob(TalentLoomDef);
            
        // Add archetypal progression system
        if (settings.controls.technologyLevel >= 6) {
            // High tech: Materia-style customization
            this.shuttle.addJob(MateriaLoomDef);
        }
        
        // Add combination techniques (Chrono Trigger style)
        this.shuttle.addJob(DualTechLoomDef);
        
        // === PHASE 4: COMBAT SYSTEMS ===
        console.log("⚔️  Phase 4: Combat Systems");
        
        // Choose combat system based on preferences
        if (settings.preferences?.biases?.combatDifficulty === 'brutal') {
            // Real-time combat for brutal difficulty
            this.shuttle.addJob(RingMenuLoomDef);
        } else {
            // ATB for balanced/story mode
            this.shuttle.addJob(AtbLoomDef);
        }
        
        // Universal status effects
        this.shuttle.addJob(StatusAilmentLoomDef);
        
        // === PHASE 5: WORLD CONTENT ===
        console.log("🌍 Phase 5: World Content");
        
        this.shuttle
            .addJob(ItemLoomDef)
            .addJob(BestiaryLoomDef)
            .addJob(DungeonLoomDef)
            .addJob(ShopLoomDef)
            .addJob(NpcLoomDef)
            .addJob(QuestLoomDef)
            .addJob(DialogueLoomDef);
            
        // === PHASE 6: ARCHETYPAL NARRATIVE SYSTEMS ===
        console.log("📚 Phase 6: Archetypal Narrative Systems");
        
        // Add time travel mechanics if appropriate
        if (settings.age.toLowerCase().includes('time') || 
            settings.preferences?.biases?.questFocus === 'exploration') {
            this.shuttle.addJob(TimeTravelLoomDef);
        }
        
        // Add apocalyptic transformation potential
        if (settings.controls.dangerLevel >= 8) {
            this.shuttle.addJob(ApocalypseLoomDef);
        }
        
        // Launch the complete orchestration
        const result = await this.shuttle.launch();
        
        console.log("🎉 Archetypal Realm Weaving Complete!");
        this.logArchetypalSummary(result);
        
        return result;
    }
    
    /**
     * Logs a summary of the archetypal systems generated
     */
    private logArchetypalSummary(realm: ArchetypalRealmContext): void {
        console.log("\n📊 ARCHETYPAL REALM SUMMARY");
        console.log("=" .repeat(50));
        
        // Core Systems
        if (realm.world) {
            console.log(`🗺️  World: ${realm.world.nodes?.length || 0} locations`);
        }
        if (realm.factions) {
            console.log(`🏛️  Factions: ${realm.factions.length}`);
        }
        if (realm.classes) {
            console.log(`👤 Classes: ${realm.classes.length}`);
        }
        
        // Magic Systems
        if (realm.magicSystem) {
            console.log(`✨ Magic System: ${realm.magicSystem.systemType}`);
            if (realm.magicSystem.espers) {
                console.log(`   📿 Espers: ${realm.magicSystem.espers.length}`);
            }
        }
        if (realm.psiSystem) {
            console.log(`🧠 PSI System: ${realm.psiSystem.abilities?.length || 0} abilities`);
        }
        if (realm.elementalSystem) {
            console.log(`🔥 Elemental System: ${realm.elementalSystem.elements?.length || 0} elements`);
        }
        
        // Combat Systems
        if (realm.atbCombat) {
            console.log(`⚔️  Combat: Active Time Battle`);
        }
        if (realm.ringMenuCombat) {
            console.log(`⚔️  Combat: Real-time Ring Menu`);
        }
        if (realm.dualTechs) {
            console.log(`🤝 Combination Techs: ${realm.dualTechs.length}`);
        }
        
        // Progression Systems
        if (realm.materiaProgression) {
            console.log(`📈 Progression: Materia System (${realm.materiaProgression.materiaSlots} slots)`);
        }
        
        // Narrative Systems
        if (realm.timelineEvents) {
            console.log(`⏰ Timeline Events: ${realm.timelineEvents.length} periods`);
        }
        if (realm.apocalypseEvents) {
            console.log(`💥 Apocalypse Events: ${realm.apocalypseEvents.length}`);
        }
        
        // Content
        if (realm.items) {
            console.log(`🎒 Items: ${realm.items.length}`);
        }
        if (realm.bestiary) {
            console.log(`👹 Monsters: ${realm.bestiary.length}`);
        }
        if (realm.quests) {
            console.log(`📜 Quests: ${realm.quests.length}`);
        }
        if (realm.statusEffects) {
            console.log(`🌟 Status Effects: ${realm.statusEffects.length}`);
        }
        
        console.log("=" .repeat(50));
    }
    
    /**
     * Creates a mock archetypal realm for testing
     */
    static createMockArchetypalRealm(settings: LoomSettings): ArchetypalRealmContext {
        return {
            settings,
            world: {
                nodes: [
                    { id: 'start', name: 'Origin Town', type: 'start', biome: 'grassland', dangerLevel: 1 },
                    { id: 'dungeon1', name: 'Crystal Cave', type: 'dungeon', biome: 'cave', dangerLevel: 5 },
                    { id: 'end', name: 'Final Tower', type: 'end', biome: 'magical', dangerLevel: 10 }
                ],
                edges: [
                    { from: 'start', to: 'dungeon1', type: 'road', travelTime: 2 },
                    { from: 'dungeon1', to: 'end', type: 'portal', travelTime: 1 }
                ]
            },
            factions: [
                { id: 'empire', name: 'Gestahl Empire', archetype: 'empire', homeNodeId: 'end' },
                { id: 'returners', name: 'Returners', archetype: 'rebellion', homeNodeId: 'start' }
            ],
            classes: [
                { id: 'warrior', name: 'Warrior', stats: { str: 8, agi: 5, int: 3, hp: 100, sp: 20 } },
                { id: 'mage', name: 'Mage', stats: { str: 3, agi: 6, int: 9, hp: 60, sp: 80 } }
            ],
            magicSystem: {
                id: 'esper_system',
                name: 'Esper Magicite System',
                systemType: 'esper_magicite',
                resourceType: 'mp',
                learningMechanism: 'ap_accumulation',
                espers: [
                    { 
                        id: 'ifrit', 
                        name: 'Ifrit', 
                        element: 'fire',
                        spells: [
                            { name: 'Fire', learningRate: 10, mpCost: 4, power: 25 },
                            { name: 'Fira', learningRate: 5, mpCost: 12, power: 60 }
                        ],
                        summonPower: 80
                    }
                ],
                statBonuses: true,
                summonPower: true
            },
            atbCombat: {
                id: 'atb_system',
                name: 'Active Time Battle',
                systemType: 'active_time_battle',
                timingMechanism: 'speed_based_charging',
                speedBasedTiming: true,
                actionModes: ['active', 'wait'],
                castingTimes: true,
                interruptible: true
            },
            dualTechs: [
                {
                    id: 'x_strike',
                    name: 'X-Strike',
                    participantCount: 2,
                    techType: 'dual',
                    requiredCharacters: ['warrior', 'warrior'],
                    positioningEffects: ['line'],
                    powerLevel: 'high',
                    resourceCost: 'medium',
                    mpCost: 8,
                    damage: 150,
                    effects: ['physical_damage', 'armor_pierce']
                }
            ],
            statusEffects: [
                {
                    id: 'poison',
                    name: 'Poison',
                    category: 'negative',
                    duration: 'battle_persistent',
                    stackable: false,
                    visualIndicator: 'purple_bubbles',
                    effects: [
                        { type: 'damage_over_time', value: 5, description: 'Loses 5 HP per turn' }
                    ],
                    cureConditions: ['antidote', 'esuna', 'battle_end']
                }
            ],
            elementalSystem: {
                id: 'classic_elements',
                name: 'Classic Elemental Wheel',
                elements: [
                    { id: 'fire', name: 'Fire', color: '#FF4444', weakTo: ['ice'], strongAgainst: ['ice'] },
                    { id: 'ice', name: 'Ice', color: '#4444FF', weakTo: ['fire'], strongAgainst: ['fire'] },
                    { id: 'lightning', name: 'Lightning', color: '#FFFF44', weakTo: ['earth'], strongAgainst: ['water'] }
                ],
                coreElements: ['fire', 'ice', 'lightning'],
                weaknessChains: true,
                absorptionPossible: true
            }
        };
    }
}