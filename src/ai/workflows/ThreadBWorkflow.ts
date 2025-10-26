/**
 * ThreadBWorkflow - AGE-Level Faction Politics Generation
 * 
 * Thread B goes DEEP at the AGE level, not just beat level.
 * Each AGE represents a significant period where faction politics evolve,
 * characters develop, alliances shift, and consequences compound.
 * 
 * This workflow generates complete AGE-level content packages including:
 * - All faction HQ scenes for that age
 * - Faction leader evolution/changes
 * - Political event sequences
 * - Consequence branches
 * - Cross-faction interactions
 */

import { AnthropicClient } from '../AnthropicClient';
import { AssetLibrary } from '../AssetLibrary';
import { SceneTemplate } from '../../types/SceneDefinition';
import { StoryBinding } from '../../types/StoryBinding';

export interface FactionProfile {
  id: string;
  name: string;
  leader: string;
  theme: string;
  aesthetic: string;
  goals: string[];
  values: string[];
  headquarters: string;
}

export interface AgeDefinition {
  ageNumber: number;
  name: string;
  duration: string; // e.g., "Early game", "Mid-game", "Late-game"
  politicalClimate: string;
  majorEvents: string[];
  factionStates: Record<string, {
    powerLevel: 'rising' | 'stable' | 'declining';
    relationship: Record<string, 'allied' | 'neutral' | 'hostile'>;
    leaderStatus: 'stable' | 'challenged' | 'changed';
  }>;
  beatsInAge: number[];
  flags: {
    required: string[];
    sets: string[];
  };
}

export interface GeneratedAgeContent {
  age: AgeDefinition;
  
  // All faction HQs for this age
  factionScenes: Map<string, SceneTemplate>;
  
  // All faction leaders (may have changed from previous age)
  factionLeaders: Map<string, {
    npc: any;
    status: 'new' | 'returning' | 'evolved';
    changes?: string[];
  }>;
  
  // Political events for this age
  events: Array<{
    id: string;
    name: string;
    description: string;
    scene: SceneTemplate;
    participants: string[]; // Faction IDs
    dialogue: any;
    consequences: Map<string, number>; // Faction favor changes
  }>;
  
  // Diplomatic options available
  diplomaticActions: Array<{
    id: string;
    name: string;
    description: string;
    requirements: string[];
    effects: string[];
  }>;
  
  // Supporting cast for this age
  supportingNPCs: Map<string, any>;
  
  // Political intrigue quests
  quests: Array<{
    id: string;
    name: string;
    faction: string;
    objective: string;
    dialogue: any;
    rewards: string[];
  }>;
}

export class ThreadBWorkflow {
  private anthropicClient: AnthropicClient;
  private assetLibrary: AssetLibrary;

  // The 5 major factions
  private readonly factions: FactionProfile[] = [
    {
      id: 'crimson_court',
      name: 'The Crimson Court',
      leader: 'Lady Carmilla',
      theme: 'Blood magic nobility and tradition',
      aesthetic: 'Gothic grandeur, blood-red, Victorian aristocracy',
      goals: ['Maintain traditional power', 'Preserve blood magic', 'Control supernatural realm'],
      values: ['Honor', 'Tradition', 'Hierarchy', 'Power'],
      headquarters: 'Crimson Palace'
    },
    {
      id: 'shadow_syndicate',
      name: 'The Shadow Syndicate',
      leader: 'The Masked One',
      theme: 'Underground revolution and shadow magic',
      aesthetic: 'Dark shadows, mystery, underground networks',
      goals: ['Overthrow old order', 'Liberation through shadows', 'Redistribute power'],
      values: ['Freedom', 'Cunning', 'Pragmatism', 'Change'],
      headquarters: 'Underground Sanctum'
    },
    {
      id: 'silver_circle',
      name: 'The Silver Circle',
      leader: 'High Priestess Selene',
      theme: 'Spiritual enlightenment and spirit magic',
      aesthetic: 'Silver moonlight, ethereal, temples',
      goals: ['Spiritual balance', 'Peace and harmony', 'Enlightenment for all'],
      values: ['Wisdom', 'Peace', 'Harmony', 'Balance'],
      headquarters: 'Temple of the Moon'
    },
    {
      id: 'iron_collective',
      name: 'The Iron Collective',
      leader: 'Forge Master Thane',
      theme: 'Industrial progress and technology',
      aesthetic: 'Steampunk, mechanical, industrial',
      goals: ['Technological advancement', 'Efficiency through innovation', 'Progress over tradition'],
      values: ['Efficiency', 'Progress', 'Logic', 'Innovation'],
      headquarters: 'The Great Forge'
    },
    {
      id: 'verdant_alliance',
      name: 'The Verdant Alliance',
      leader: 'Archdruid Moss',
      theme: 'Natural balance and nature magic',
      aesthetic: 'Green, organic, living environments',
      goals: ['Protect nature', 'Prevent corruption', 'Restore natural balance'],
      values: ['Life', 'Growth', 'Balance', 'Preservation'],
      headquarters: 'Sacred Grove'
    }
  ];

  // Age definitions - Thread B goes DEEP at this level
  private readonly ages: AgeDefinition[] = [
    {
      ageNumber: 0,
      name: 'The Introduction',
      duration: 'Early game (beats 0-2)',
      politicalClimate: 'Tense stability, factions sizing each other up',
      majorEvents: ['First Council Meeting', 'Initial Contacts', 'Political Awakening'],
      factionStates: {
        crimson_court: { powerLevel: 'stable', relationship: {}, leaderStatus: 'stable' },
        shadow_syndicate: { powerLevel: 'rising', relationship: {}, leaderStatus: 'stable' },
        silver_circle: { powerLevel: 'stable', relationship: {}, leaderStatus: 'stable' },
        iron_collective: { powerLevel: 'rising', relationship: {}, leaderStatus: 'stable' },
        verdant_alliance: { powerLevel: 'stable', relationship: {}, leaderStatus: 'stable' }
      },
      beatsInAge: [0, 1, 2],
      flags: { required: ['game_started'], sets: ['b_age_0_complete'] }
    },
    {
      ageNumber: 1,
      name: 'The First Alliance',
      duration: 'Early-mid game (beats 3-6)',
      politicalClimate: 'Faction lines being drawn, first major commitments',
      majorEvents: ['Player chooses primary ally', 'Rival faction emerges', 'First betrayal hints'],
      factionStates: {
        crimson_court: { powerLevel: 'stable', relationship: { shadow_syndicate: 'hostile' }, leaderStatus: 'stable' },
        shadow_syndicate: { powerLevel: 'rising', relationship: { crimson_court: 'hostile' }, leaderStatus: 'stable' },
        silver_circle: { powerLevel: 'stable', relationship: {}, leaderStatus: 'stable' },
        iron_collective: { powerLevel: 'rising', relationship: { verdant_alliance: 'neutral' }, leaderStatus: 'stable' },
        verdant_alliance: { powerLevel: 'declining', relationship: { iron_collective: 'neutral' }, leaderStatus: 'stable' }
      },
      beatsInAge: [3, 4, 5, 6],
      flags: { required: ['b_age_0_complete'], sets: ['b_age_1_complete', 'b_first_alliance_formed'] }
    },
    {
      ageNumber: 2,
      name: 'The Political Storm',
      duration: 'Mid game (beats 7-9)',
      politicalClimate: 'Open conflict, betrayals, secret alliances',
      majorEvents: ['The Great Betrayal', 'Secret Treaty Exposed', 'Leadership Challenge'],
      factionStates: {
        crimson_court: { powerLevel: 'declining', relationship: { shadow_syndicate: 'hostile', silver_circle: 'allied' }, leaderStatus: 'challenged' },
        shadow_syndicate: { powerLevel: 'rising', relationship: { crimson_court: 'hostile', verdant_alliance: 'allied' }, leaderStatus: 'stable' },
        silver_circle: { powerLevel: 'rising', relationship: { crimson_court: 'allied' }, leaderStatus: 'stable' },
        iron_collective: { powerLevel: 'stable', relationship: {}, leaderStatus: 'changed' }, // New leader!
        verdant_alliance: { powerLevel: 'declining', relationship: { shadow_syndicate: 'allied', iron_collective: 'hostile' }, leaderStatus: 'stable' }
      },
      beatsInAge: [7, 8, 9],
      flags: { required: ['b_age_1_complete'], sets: ['b_age_2_complete', 'b_betrayal_revealed'] }
    },
    {
      ageNumber: 3,
      name: 'The New Order',
      duration: 'Late game (beats 10-12)',
      politicalClimate: 'Power consolidation, endgame alliances, new world order',
      majorEvents: ['Grand Council', 'Power Consolidation', 'New Order Established'],
      factionStates: {
        // Final states depend heavily on player choices
        crimson_court: { powerLevel: 'stable', relationship: {}, leaderStatus: 'evolved' },
        shadow_syndicate: { powerLevel: 'stable', relationship: {}, leaderStatus: 'evolved' },
        silver_circle: { powerLevel: 'rising', relationship: {}, leaderStatus: 'evolved' },
        iron_collective: { powerLevel: 'stable', relationship: {}, leaderStatus: 'stable' },
        verdant_alliance: { powerLevel: 'stable', relationship: {}, leaderStatus: 'evolved' }
      },
      beatsInAge: [10, 11, 12],
      flags: { required: ['b_age_2_complete'], sets: ['b_age_3_complete', 'b_new_order_established'] }
    }
  ];

  constructor(anthropicClient: AnthropicClient, assetLibrary: AssetLibrary) {
    this.anthropicClient = anthropicClient;
    this.assetLibrary = assetLibrary;
  }

  /**
   * Generate complete AGE-level content package
   * This is where Thread B goes DEEP
   */
  async generateAge(
    ageNumber: number,
    context?: {
      playerAlliance?: string;
      previousAgeChoices?: string[];
      factionFavor?: Record<string, number>;
    }
  ): Promise<GeneratedAgeContent> {
    const age = this.ages[ageNumber];
    if (!age) {
      throw new Error(`Invalid age number: ${ageNumber}`);
    }

    console.log(`\n🏛️ Generating AGE ${ageNumber}: ${age.name}`);
    console.log(`   Political Climate: ${age.politicalClimate}`);
    console.log(`   Beats in Age: ${age.beatsInAge.join(', ')}`);
    console.log(`   Going DEEP with faction politics...`);
    console.log('━'.repeat(70));

    // STEP 1: Query embeddings for reusable assets
    console.log(`\n📚 Step 1: Querying asset library for reusable content...`);
    const existingAssets = await this.queryFactionAssets(age);
    console.log(`   Found ${existingAssets.length} potentially reusable assets`);

    // STEP 2: Generate all faction HQs for this age (may reuse or modify)
    console.log(`\n🏰 Step 2: Generating faction HQ scenes...`);
    const factionScenes = await this.generateFactionHQs(age, existingAssets);
    console.log(`   Generated ${factionScenes.size} faction headquarters`);

    // STEP 3: Generate/evolve faction leaders
    console.log(`\n👑 Step 3: Generating faction leaders...`);
    const factionLeaders = await this.generateFactionLeaders(age, context, existingAssets);
    console.log(`   Generated ${factionLeaders.size} faction leaders`);

    // STEP 4: Generate major political events
    console.log(`\n⚔️ Step 4: Generating political events...`);
    const events = await this.generatePoliticalEvents(age, context);
    console.log(`   Generated ${events.length} political events`);

    // STEP 5: Generate diplomatic actions available in this age
    console.log(`\n🤝 Step 5: Generating diplomatic actions...`);
    const diplomaticActions = await this.generateDiplomaticActions(age, context);
    console.log(`   Generated ${diplomaticActions.length} diplomatic options`);

    // STEP 6: Generate supporting NPCs
    console.log(`\n👥 Step 6: Generating supporting cast...`);
    const supportingNPCs = await this.generateSupportingNPCs(age, factionLeaders);
    console.log(`   Generated ${supportingNPCs.size} supporting NPCs`);

    // STEP 7: Generate political intrigue quests
    console.log(`\n🎭 Step 7: Generating intrigue quests...`);
    const quests = await this.generateIntrigueQuests(age, context);
    console.log(`   Generated ${quests.length} intrigue quests`);

    console.log('━'.repeat(70));
    console.log(`\n✨ AGE ${ageNumber} generation complete!`);
    console.log(`   Total Scenes: ${factionScenes.size}`);
    console.log(`   Total NPCs: ${factionLeaders.size + supportingNPCs.size}`);
    console.log(`   Total Events: ${events.length}`);
    console.log(`   Total Quests: ${quests.length}\n`);

    return {
      age,
      factionScenes,
      factionLeaders,
      events,
      diplomaticActions,
      supportingNPCs,
      quests
    };
  }

  /**
   * Query asset library for existing faction content
   */
  private async queryFactionAssets(age: AgeDefinition): Promise<any[]> {
    const results = await Promise.all([
      this.assetLibrary.queryEmbeddings('faction headquarters political', { thread: 'B', type: 'scene' }),
      this.assetLibrary.queryEmbeddings('faction leader diplomat noble', { thread: 'B', type: 'npc' }),
      this.assetLibrary.queryEmbeddings('political dialogue negotiation', { thread: 'B', type: 'dialogue' })
    ]);

    return results.flat();
  }

  /**
   * Generate faction headquarters for this age
   */
  private async generateFactionHQs(
    age: AgeDefinition,
    existingAssets: any[]
  ): Promise<Map<string, SceneTemplate>> {
    const scenes = new Map<string, SceneTemplate>();

    for (const faction of this.factions) {
      const prompt = `As Creative Director, generate ${faction.headquarters} for AGE ${age.ageNumber}.

**Faction**: ${faction.name}
**Leader**: ${faction.leader}
**Aesthetic**: ${faction.aesthetic}
**Age Context**: ${age.name} - ${age.politicalClimate}
**Power Level**: ${age.factionStates[faction.id].powerLevel}

**Visual Guidelines**:
- Reflect faction's current power level
- Show age-appropriate wear/improvement
- Maintain ${faction.aesthetic} aesthetic
- Gothic fantasy world with blood-red themes

Create detailed HQ scene reflecting faction's state in this age.

Respond with scene JSON (id, grid, floor, walls, props, npc slots, etc.)`;

      const response = await this.anthropicClient.generateText(prompt, {
        maxTokens: 2000,
        temperature: 0.7
      });

      try {
        const sceneData = JSON.parse(response);
        const scene: SceneTemplate = {
          id: `${faction.id}_hq_age_${age.ageNumber}`,
          grid: sceneData.grid || { width: 24, height: 16 },
          floor: sceneData.floor || { texture: 'stone' },
          walls: sceneData.walls || [],
          ceiling: sceneData.ceiling,
          slots: sceneData.slots || { npcs: [], props: [], doors: [] }
        };
        
        scenes.set(faction.id, scene);
      } catch (e) {
        console.error(`Failed to generate HQ for ${faction.name}:`, e);
      }
    }

    return scenes;
  }

  /**
   * Generate/evolve faction leaders for this age
   */
  private async generateFactionLeaders(
    age: AgeDefinition,
    context: any,
    existingAssets: any[]
  ): Promise<Map<string, any>> {
    const leaders = new Map<string, any>();

    for (const faction of this.factions) {
      const leaderStatus = age.factionStates[faction.id].leaderStatus;
      const isNew = leaderStatus === 'changed';
      const isEvolved = leaderStatus === 'evolved' || leaderStatus === 'challenged';

      const prompt = `Generate faction leader for ${faction.name} in AGE ${age.ageNumber}.

**Faction**: ${faction.name}
**Current Leader**: ${faction.leader}
**Status**: ${leaderStatus}
**Power Level**: ${age.factionStates[faction.id].powerLevel}
**Age Context**: ${age.politicalClimate}

${isNew ? '⚠️ NEW LEADER - Previous leader replaced!' : ''}
${isEvolved ? '📈 EVOLVED - Leader has changed due to age events' : ''}

Create ${isNew ? 'completely new' : isEvolved ? 'evolved version of' : 'stable'} faction leader.

Respond with NPC JSON (id, name, description, personality, speaking style, etc.)`;

      const response = await this.anthropicClient.generateText(prompt, {
        maxTokens: 1500,
        temperature: isNew ? 0.9 : 0.7 // More creative for new leaders
      });

      try {
        const leaderData = JSON.parse(response);
        leaders.set(faction.id, {
          npc: leaderData,
          status: isNew ? 'new' : isEvolved ? 'evolved' : 'returning',
          changes: isEvolved ? [`Power level: ${age.factionStates[faction.id].powerLevel}`] : []
        });
      } catch (e) {
        console.error(`Failed to generate leader for ${faction.name}:`, e);
      }
    }

    return leaders;
  }

  /**
   * Generate major political events for this age
   */
  private async generatePoliticalEvents(age: AgeDefinition, context: any): Promise<any[]> {
    const events: any[] = [];

    for (const eventName of age.majorEvents) {
      // Generate event
      const event = {
        id: `${age.ageNumber}_${eventName.toLowerCase().replace(/\s+/g, '_')}`,
        name: eventName,
        description: `Political event in AGE ${age.ageNumber}`,
        scene: {} as SceneTemplate, // TODO: Generate scene
        participants: this.factions.map(f => f.id),
        dialogue: {}, // TODO: Generate dialogue
        consequences: new Map<string, number>()
      };

      events.push(event);
    }

    return events;
  }

  /**
   * Generate diplomatic actions available in this age
   */
  private async generateDiplomaticActions(age: AgeDefinition, context: any): Promise<any[]> {
    // TODO: Generate age-specific diplomatic options
    return [];
  }

  /**
   * Generate supporting NPCs for this age
   */
  private async generateSupportingNPCs(
    age: AgeDefinition,
    leaders: Map<string, any>
  ): Promise<Map<string, any>> {
    const npcs = new Map<string, any>();
    
    // Generate 2-3 supporting NPCs per faction
    for (const faction of this.factions) {
      for (let i = 0; i < 3; i++) {
        const id = `${faction.id}_support_${i}_age_${age.ageNumber}`;
        // TODO: Generate supporting NPC
        npcs.set(id, { faction: faction.id });
      }
    }

    return npcs;
  }

  /**
   * Generate political intrigue quests for this age
   */
  private async generateIntrigueQuests(age: AgeDefinition, context: any): Promise<any[]> {
    // TODO: Generate age-specific intrigue quests
    return [];
  }

  /**
   * Generate all ages in sequence
   */
  async generateAllAges(options: {
    startAge?: number;
    endAge?: number;
    storeInLibrary?: boolean;
  } = {}): Promise<GeneratedAgeContent[]> {
    const start = options.startAge || 0;
    const end = options.endAge || 3;
    const results: GeneratedAgeContent[] = [];

    console.log(`\n📚 Generating Thread B (Faction Politics): Ages ${start}-${end}`);
    console.log(`   Remember: Thread B goes DEEP at the AGE level!`);
    console.log('━'.repeat(70));

    for (let i = start; i <= end; i++) {
      const content = await this.generateAge(i);
      results.push(content);

      if (options.storeInLibrary) {
        await this.storeAgeInLibrary(content);
      }
    }

    console.log('━'.repeat(70));
    console.log(`\n🎉 Generated ${results.length} complete ages!`);
    
    return results;
  }

  /**
   * Store age content in asset library
   */
  private async storeAgeInLibrary(content: GeneratedAgeContent): Promise<void> {
    // Store all scenes
    for (const [factionId, scene] of content.factionScenes) {
      await this.assetLibrary.addContent({
        type: 'scene',
        content: JSON.stringify(scene),
        thread: 'B',
        tags: ['faction', factionId, `age_${content.age.ageNumber}`]
      });
    }

    // Store all NPCs
    for (const [factionId, leaderData] of content.factionLeaders) {
      await this.assetLibrary.addContent({
        type: 'npc',
        content: JSON.stringify(leaderData.npc),
        thread: 'B',
        tags: ['faction_leader', factionId, `age_${content.age.ageNumber}`]
      });
    }
  }

  /**
   * Get age specification
   */
  getAge(ageNumber: number): AgeDefinition {
    return this.ages[ageNumber];
  }

  /**
   * Get all age specifications
   */
  getAllAges(): AgeDefinition[] {
    return [...this.ages];
  }

  /**
   * Get faction profile
   */
  getFaction(factionId: string): FactionProfile | undefined {
    return this.factions.find(f => f.id === factionId);
  }

  /**
   * Get all faction profiles
   */
  getAllFactions(): FactionProfile[] {
    return [...this.factions];
  }
}
