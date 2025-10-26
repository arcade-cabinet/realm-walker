/**
 * ThreadAWorkflow - Generate content for Guardian Powers story thread
 * Handles scene, NPC, dialogue, and quest generation for A thread beats 0-9
 */

import { AnthropicClient } from '../AnthropicClient';
import { AssetLibrary } from '../AssetLibrary';
import { SceneTemplate } from '../../types/SceneDefinition';
import { StoryBinding } from '../../types/StoryBinding';

export interface GuardianBeat {
  beatNumber: number;
  guardianName: string;
  guardianTheme: string;
  powerName: string;
  powerDescription: string;
  location: string;
  atmosphericDescription: string;
  visualElements: string[];
  questObjective: string;
  flags: {
    required: string[];
    sets: string[];
  };
}

export interface GeneratedGuardianContent {
  scene: SceneTemplate;
  storyBinding: StoryBinding;
  guardianNPC: {
    id: string;
    name: string;
    description: string;
    modelPrompt: string;
    personality: string[];
    powers: string[];
  };
  dialogueTree: {
    id: string;
    nodes: DialogueNode[];
  };
  powerDescription: {
    name: string;
    description: string;
    mechanicalEffect: string;
    visualEffect: string;
  };
}

interface DialogueNode {
  id: string;
  speaker: 'guardian' | 'player';
  text: string;
  choices?: Array<{
    text: string;
    nextNodeId: string;
    flagRequirements?: string[];
    flagsSet?: string[];
  }>;
  flagRequirements?: string[];
  flagsSet?: string[];
}

export class ThreadAWorkflow {
  private anthropicClient: AnthropicClient;
  private assetLibrary: AssetLibrary;

  // Guardian beat definitions
  private readonly beats: GuardianBeat[] = [
    {
      beatNumber: 0,
      guardianName: 'None (Introduction)',
      guardianTheme: 'Learning about guardians',
      powerName: 'None',
      powerDescription: 'None',
      location: 'Village Square',
      atmosphericDescription: 'Welcoming but mysterious village square with hints of supernatural',
      visualElements: ['cobblestone', 'village buildings', 'subtle magical effects'],
      questObjective: 'Learn about the existence of guardians from the Village Elder',
      flags: {
        required: ['game_started'],
        sets: ['a_story_started']
      }
    },
    {
      beatNumber: 1,
      guardianName: 'Spirit of the Silver Grove',
      guardianTheme: 'Nature spirits and ethereal magic',
      powerName: 'Spirit Sight',
      powerDescription: 'See hidden objects and spiritual presences',
      location: 'Forest Clearing',
      atmosphericDescription: 'Mystical forest clearing with silver moonlight and ethereal mist',
      visualElements: ['ancient trees', 'silver light', 'floating spirits', 'mystical flowers'],
      questObjective: 'Prove worthiness to the Spirit Guardian through dialogue choices',
      flags: {
        required: ['a_story_started'],
        sets: ['a_guardian_spirit_met']
      }
    },
    {
      beatNumber: 2,
      guardianName: 'Carmilla',
      guardianTheme: 'Blood magic and Gothic power',
      powerName: 'Crimson Sense',
      powerDescription: 'Detect danger and hostile intent from others',
      location: 'Crimson Palace - Lower Hall',
      atmosphericDescription: 'Gothic hall with blood-red walls and imposing architecture',
      visualElements: ['crimson walls', 'Gothic arches', 'blood-red lighting', 'ornate decorations'],
      questObjective: 'Form blood pact with Carmilla through moral test',
      flags: {
        required: ['a_guardian_spirit_met'],
        sets: ['a_blood_guardian_bonded']
      }
    },
    {
      beatNumber: 3,
      guardianName: 'The Umbral One',
      guardianTheme: 'Shadows and darkness',
      powerName: 'Shadow Step',
      powerDescription: 'Phase through barriers using shadows',
      location: 'Forgotten Catacombs',
      atmosphericDescription: 'Dark ancient catacombs with deep shadows and stone architecture',
      visualElements: ['ancient stone', 'deep shadows', 'tomb architecture', 'shadow creatures'],
      questObjective: 'Navigate shadow puzzles and retrieve shadow essence',
      flags: {
        required: ['a_blood_guardian_bonded'],
        sets: ['a_shadow_power_gained']
      }
    },
    {
      beatNumber: 4,
      guardianName: 'Four Elemental Spirits',
      guardianTheme: 'Elemental balance and harmony',
      powerName: 'Elemental Attunement',
      powerDescription: 'Interact with and control elemental forces',
      location: 'Elemental Shrine',
      atmosphericDescription: 'Four connected chambers representing fire, water, earth, and air',
      visualElements: ['elemental effects', 'shrine architecture', 'floating crystals', 'natural forces'],
      questObjective: 'Balance all four elemental forces to prove harmony',
      flags: {
        required: ['a_shadow_power_gained'],
        sets: ['a_elements_balanced']
      }
    },
    {
      beatNumber: 5,
      guardianName: 'The Whispering Mind',
      guardianTheme: 'Psychic power and mental prowess',
      powerName: 'Thought Reading',
      powerDescription: 'See hidden intentions and thoughts of NPCs',
      location: 'Tower of Whispers',
      atmosphericDescription: 'Surreal tower with impossible geometry and psychic energy',
      visualElements: ['warped architecture', 'psychic effects', 'floating thoughts', 'mind-bending visuals'],
      questObjective: 'Pass mental trials and unlock psychic potential',
      flags: {
        required: ['a_elements_balanced'],
        sets: ['a_psychic_awakened']
      }
    },
    {
      beatNumber: 6,
      guardianName: 'Twin Guardians of Life and Death',
      guardianTheme: 'Balance of mortality and vitality',
      powerName: 'Vitality Sense',
      powerDescription: 'Detect life essence and communicate with spirits',
      location: 'The Eternal Garden',
      atmosphericDescription: 'Garden split between living verdant side and dead withered side',
      visualElements: ['living plants', 'dead trees', 'life/death contrast', 'twin guardians'],
      questObjective: 'Balance life and death forces while respecting both',
      flags: {
        required: ['a_psychic_awakened'],
        sets: ['a_lifedeath_mastered']
      }
    },
    {
      beatNumber: 7,
      guardianName: 'The Chronarch',
      guardianTheme: 'Time and temporal forces',
      powerName: 'Echo Sight',
      powerDescription: 'See past events and temporal echoes',
      location: 'Clockwork Cathedral',
      atmosphericDescription: 'Massive cathedral with clockwork mechanisms and temporal distortions',
      visualElements: ['giant clocks', 'gears', 'temporal rifts', 'time effects'],
      questObjective: 'Navigate temporal puzzles and prove understanding of time',
      flags: {
        required: ['a_lifedeath_mastered'],
        sets: ['a_time_guardian_met']
      }
    },
    {
      beatNumber: 8,
      guardianName: 'The Void Entity',
      guardianTheme: 'Emptiness and the unknown',
      powerName: 'Void Walk',
      powerDescription: 'Access hidden void spaces and see beyond reality',
      location: 'The Empty Place',
      atmosphericDescription: 'Minimal void space with existential atmosphere',
      visualElements: ['nothingness', 'void effects', 'minimal geometry', 'reality tears'],
      questObjective: 'Confront the void and decide whether to accept its power',
      flags: {
        required: ['a_time_guardian_met'],
        sets: ['a_void_power_accepted']
      }
    },
    {
      beatNumber: 9,
      guardianName: 'Council of All Guardians',
      guardianTheme: 'Ultimate power and ascension',
      powerName: 'Guardian\'s Authority',
      powerDescription: 'Master of all guardian powers, ultimate supernatural ability',
      location: 'The Sanctum of Guardians',
      atmosphericDescription: 'Epic sanctum with all previous guardians present',
      visualElements: ['grand architecture', 'all guardian symbols', 'powerful magic', 'ascension effects'],
      questObjective: 'Complete trials from all guardians and ascend to guardian status',
      flags: {
        required: ['a_void_power_accepted'],
        sets: ['a_guardian_ascended']
      }
    }
  ];

  constructor(anthropicClient: AnthropicClient, assetLibrary: AssetLibrary) {
    this.anthropicClient = anthropicClient;
    this.assetLibrary = assetLibrary;
  }

  /**
   * Generate complete content for a specific guardian beat
   */
  async generateBeat(beatNumber: number, context?: {
    playerChoices?: string[];
    previousBeats?: number[];
  }): Promise<GeneratedGuardianContent> {
    const beat = this.beats[beatNumber];
    if (!beat) {
      throw new Error(`Invalid beat number: ${beatNumber}`);
    }

    console.log(`\n🔮 Generating Guardian Beat ${beatNumber}: ${beat.guardianName}`);

    // Generate in parallel for speed
    const [scene, guardian, dialogue, powerDesc] = await Promise.all([
      this.generateScene(beat),
      this.generateGuardianNPC(beat),
      this.generateDialogueTree(beat, context),
      this.generatePowerDescription(beat)
    ]);

    // Generate story binding
    const storyBinding = this.generateStoryBinding(beat, guardian, scene);

    return {
      scene,
      storyBinding,
      guardianNPC: guardian,
      dialogueTree: dialogue,
      powerDescription: powerDesc
    };
  }

  /**
   * Generate scene for guardian encounter
   */
  private async generateScene(beat: GuardianBeat): Promise<SceneTemplate> {
    const prompt = `Generate a ${beat.atmosphericDescription} scene for a guardian encounter.

**Guardian**: ${beat.guardianName}
**Theme**: ${beat.guardianTheme}
**Location**: ${beat.location}
**Atmosphere**: ${beat.atmosphericDescription}
**Visual Elements**: ${beat.visualElements.join(', ')}
**Quest Objective**: ${beat.questObjective}

Create a detailed scene with:
- Appropriate grid size for the encounter (suggest dimensions)
- Floor texture matching the theme
- Wall and ceiling if enclosed space
- Prop slots for atmospheric elements
- NPC slot for the guardian
- Lighting suggestions
- Portal slots for entry/exit

Respond in this JSON format:
{
  "sceneId": "string",
  "gridDimensions": {"width": number, "height": number},
  "floorTexture": "string",
  "walls": [{"side": "string", "texture": "string"}],
  "ceiling": {"texture": "string", "height": number},
  "props": [{"id": "string", "description": "string", "position": [x, y]}],
  "npcSlots": [{"id": "string", "position": [x, y]}],
  "portals": [{"id": "string", "position": [x, y], "target": "string"}],
  "lighting": {"ambient": "string", "directional": [], "points": []}
}`;

    const response = await this.anthropicClient.generateText(prompt, {
      maxTokens: 2000,
      temperature: 0.7
    });

    // Parse response and convert to SceneTemplate
    const sceneData = JSON.parse(response);
    
    return {
      id: sceneData.sceneId || `guardian_beat_${beat.beatNumber}`,
      grid: {
        width: sceneData.gridDimensions.width || 20,
        height: sceneData.gridDimensions.height || 16
      },
      floor: {
        texture: sceneData.floorTexture || 'stone'
      },
      walls: sceneData.walls || [],
      ceiling: sceneData.ceiling,
      slots: {
        npcs: sceneData.npcSlots?.map((slot: any) => ({
          id: slot.id,
          position: slot.position as [number, number]
        })),
        props: sceneData.props?.map((prop: any) => ({
          id: prop.id,
          position: prop.position as [number, number]
        })),
        doors: sceneData.portals?.map((portal: any) => ({
          id: portal.id,
          position: portal.position as [number, number],
          wall: 'north'
        }))
      }
    };
  }

  /**
   * Generate guardian NPC character
   */
  private async generateGuardianNPC(beat: GuardianBeat): Promise<any> {
    const prompt = `Create a guardian character for the ${beat.guardianTheme} theme.

**Guardian Name**: ${beat.guardianName}
**Theme**: ${beat.guardianTheme}
**Power Granted**: ${beat.powerName} - ${beat.powerDescription}
**Atmosphere**: ${beat.atmosphericDescription}

Design a guardian NPC with:
- Physical appearance (for 3D model generation)
- Personality traits (ancient, wise, specific characteristics)
- Speaking style (formal, cryptic, direct, etc.)
- Powers and abilities they demonstrate
- How they test the player's worthiness

Respond in this JSON format:
{
  "id": "string",
  "name": "string",
  "description": "detailed physical description",
  "modelPrompt": "3D model generation prompt",
  "personality": ["trait1", "trait2", "trait3"],
  "speakingStyle": "description",
  "powers": ["power1", "power2"],
  "worthinessTest": "how they test player"
}`;

    const response = await this.anthropicClient.generateText(prompt, {
      maxTokens: 1500,
      temperature: 0.8
    });

    return JSON.parse(response);
  }

  /**
   * Generate dialogue tree for guardian encounter
   */
  private async generateDialogueTree(beat: GuardianBeat, context?: any): Promise<any> {
    const prompt = `Create a branching dialogue tree for ${beat.guardianName}.

**Guardian Theme**: ${beat.guardianTheme}
**Quest Objective**: ${beat.questObjective}
**Required Flags**: ${beat.flags.required.join(', ')}
**Sets Flags**: ${beat.flags.sets.join(', ')}

Create a dialogue with:
- Opening greeting (guardian's first words)
- Explanation of their power and domain
- Test/challenge for the player (dialogue-based)
- 3-4 player response options at key moments
- Worthy path (player succeeds)
- Unworthy path (player fails, can retry)
- Questioning path (player seeks more information)
- Power granting conclusion

The dialogue should be:
- Mysterious and ancient in tone
- Reflective of the guardian's theme
- Include moral/philosophical questions
- Branch based on player choices
- Lead to either power grant or rejection

Respond with dialogue tree JSON (nodes with id, speaker, text, choices).`;

    const response = await this.anthropicClient.generateText(prompt, {
      maxTokens: 3000,
      temperature: 0.7
    });

    return JSON.parse(response);
  }

  /**
   * Generate power description
   */
  private async generatePowerDescription(beat: GuardianBeat): Promise<any> {
    const prompt = `Create detailed power description for ${beat.powerName}.

**Power**: ${beat.powerName}
**Basic Description**: ${beat.powerDescription}
**Guardian**: ${beat.guardianName}
**Theme**: ${beat.guardianTheme}

Provide:
- Full power description (player-facing)
- Mechanical effect (gameplay implications)
- Visual effect (how it appears when used)
- Lore explanation (why this power exists)

Make it feel epic and supernatural while being clear about function.`;

    const response = await this.anthropicClient.generateText(prompt, {
      maxTokens: 1000,
      temperature: 0.7
    });

    return JSON.parse(response);
  }

  /**
   * Generate story binding for the scene
   */
  private generateStoryBinding(beat: GuardianBeat, guardian: any, scene: SceneTemplate): StoryBinding {
    return {
      scene_id: scene.id,
      npc_placements: {
        [guardian.id]: {
          npc_id: guardian.id,
          dialogue: `guardian_${beat.beatNumber}_dialogue`,
          quest: `guardian_beat_${beat.beatNumber}`
        }
      },
      prop_placements: {},
      door_states: {}
    };
  }

  /**
   * Generate all beats in sequence
   */
  async generateAllBeats(
    options: {
      startBeat?: number;
      endBeat?: number;
      outputDir?: string;
      storeInLibrary?: boolean;
    } = {}
  ): Promise<GeneratedGuardianContent[]> {
    const start = options.startBeat || 0;
    const end = options.endBeat || 9;
    const results: GeneratedGuardianContent[] = [];

    console.log(`\n📚 Generating Guardian Thread A: Beats ${start}-${end}`);
    console.log('━'.repeat(60));

    for (let i = start; i <= end; i++) {
      const content = await this.generateBeat(i, {
        previousBeats: results.map((_, idx) => idx)
      });
      
      results.push(content);

      // Store in asset library if requested
      if (options.storeInLibrary) {
        await this.storeInLibrary(content, i);
      }

      console.log(`✅ Beat ${i} complete: ${this.beats[i].guardianName}`);
    }

    console.log('━'.repeat(60));
    console.log(`\n🎉 Generated ${results.length} guardian beats!`);

    return results;
  }

  /**
   * Store generated content in asset library
   */
  private async storeInLibrary(content: GeneratedGuardianContent, beatNumber: number): Promise<void> {
    // Store scene
    await this.assetLibrary.addContent({
      type: 'scene',
      content: JSON.stringify(content.scene),
      thread: 'A',
      tags: [`guardian`, `beat_${beatNumber}`, content.guardianNPC.name]
    });

    // Store NPC
    await this.assetLibrary.addContent({
      type: 'npc',
      content: JSON.stringify(content.guardianNPC),
      thread: 'A',
      tags: [`guardian`, `beat_${beatNumber}`, content.guardianNPC.name]
    });

    // Store dialogue
    await this.assetLibrary.addContent({
      type: 'dialogue',
      content: JSON.stringify(content.dialogueTree),
      thread: 'A',
      tags: [`guardian`, `beat_${beatNumber}`, content.guardianNPC.name]
    });
  }

  /**
   * Get beat specification
   */
  getBeat(beatNumber: number): GuardianBeat {
    return this.beats[beatNumber];
  }

  /**
   * Get all beat specifications
   */
  getAllBeats(): GuardianBeat[] {
    return [...this.beats];
  }
}
