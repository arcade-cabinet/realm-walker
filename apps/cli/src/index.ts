#!/usr/bin/env tsx
console.log("DEBUG: CLI Script Starting...");
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const program = new Command();

program
  .name('generate-realm')
  .description('Generate a new realm using Google Gemini')
  .option('-s, --seed <seed>', 'Seed for generation', 'Floating-Crystal-Sanctuary')
  .option('-a, --age <age>', 'Age/Era name', 'ancient')
  .option('-c, --creative', 'Use higher temperature for more creativity', false)
  .option('--mock', 'Use mock data instead of API', false)
  .option('--danger <level>', 'Danger Level (1-11)', '5')
  .option('--magic <level>', 'Magic Level (1-10)', '5')
  .option('--tech <level>', 'Tech Level (1-10)', '1')
  .action(async (options) => {
    console.log('DEBUG Options:', options);
    console.log('DEBUG Argv:', process.argv);
    // Mock Handling
    if (options.mock) {
      console.log('🎭 Using MOCK data (No API Key required)...');
      const mockRealm = {
        age: { id: "mock-age", name: "The Mock Era", description: "A simulated timeline.", theme: "Digital" },
        classes: [{ id: "c1", name: "Debug Knight", description: "Tester", stats: { str: 10, agi: 10, int: 10, hp: 100 }, visuals: { spriteId: "knight", billboard: true } }],
        items: [{ id: "i1", name: "Debug Sword", description: "Sharp", type: "weapon", visuals: { iconId: "sword" } }],
        bestiary: [{ id: "m1", name: "Glitch", description: "Bug", stats: { str: 5, agi: 5, int: 5, hp: 50 }, behavior: "aggressive", visuals: { spriteId: "glitch" } }],
        loom: {
          title: "The Debug Graph",
          summary: "A test graph.",
          nodes: [
            { id: "n1", name: "Start", description: "Entry", biome: "forest", difficulty: 1 },
            { id: "n2", name: "Middle", description: "Path", biome: "ruin", difficulty: 5 },
            { id: "n3", name: "End", description: "Boss", biome: "tech", difficulty: 10 }
          ],
          edges: [
            { from: "n1", to: "n2", description: "Path", travelTime: 10 },
            { from: "n2", to: "n3", description: "Bridge", travelTime: 10 }
          ]
        },
        factions: [{ id: "f1", name: "Red Team", description: "Testers", ideology: "Technocracy", visuals: { color: "#FF0000" } }],
        towns: [{ id: "t1", name: "Mock Town", description: "Safe", size: "Village", services: ["Inn"], npcDensity: "Sparse", aesthetics: "Rustic" }],
        dungeons: [],
        heroes: [],
        quests: []
      };
      // Save Function Reuse
      const outputDir = path.resolve(process.cwd(), './generated');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      const filename = `${options.seed}_MOCK.json`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(mockRealm, null, 2));
      console.log(`✅ Mock Realm generated: ${filepath}`);
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is required');
      process.exit(1);
    }

    // 1. Configure the Warp (Settings)
    const {
      WorldLoom, FactionLoom, CivilizationLoom, DungeonLoom,
      CharacterLoom, HeroLoom, QuestLoom, BestiaryLoom, ItemLoom
    } = await import('@realm-walker/genai');

    const settings = {
      seed: options.seed,
      age: options.age,
      controls: {
        worldScale: 5,
        minNodes: 3,
        dangerLevel: parseInt(options.danger),
        magicLevel: parseInt(options.magic),
        technologyLevel: parseInt(options.tech)
      }
    };

    console.log(`🧵 Weaving Realm (Monk Mode) with Settings:`, settings.controls);

    try {
      // --- PHASE 1: MACRO ---
      console.log('🌍 Spinning World (Macro)...');
      const worldLoom = new WorldLoom(apiKey);
      const loom = await worldLoom.weave(settings);

      console.log('🏛️  Establishing Factions...');
      const factionLoom = new FactionLoom(apiKey);
      const factions = await factionLoom.weave(settings, loom);

      // --- PHASE 2: MICRO ---
      console.log('🏗️  Building Settlements & Dungeons (Micro)...');
      const civLoom = new CivilizationLoom(apiKey);
      const dungeonLoom = new DungeonLoom(apiKey);

      const towns = [];
      const dungeons = [];

      for (const [index, node] of loom.nodes.entries()) {
        if (index === 0) {
          const faction = factions[0];
          console.log(`  > Town at ${node.id} (${node.name})...`);
          const town = await civLoom.weave(settings, { nodeId: node.id, biome: node.biome, faction });
          towns.push(town);
        } else {
          console.log(`  > Dungeon at ${node.id} (${node.name})...`);
          const dungeon = await dungeonLoom.weave(settings, { nodeId: node.id, biome: node.biome, danger: node.difficulty });
          dungeons.push(dungeon);
        }
      }

      // --- PHASE 3: NARRATIVE & POPULATION ---
      console.log('👥 Recruiting Heroes & Classes...');
      const charLoom = new CharacterLoom(apiKey);
      const classes = await charLoom.weave(settings, loom);

      const heroLoom = new HeroLoom(apiKey);
      const heroes = await heroLoom.weave(settings, { factions, classes });

      console.log('📜 Drafting Quest Log...');
      const questLoom = new QuestLoom(apiKey);
      const quests = await questLoom.weave(settings, { world: loom, heroes, factions });

      console.log('⚔️  Summoning Bestiary & Items...');
      const bestiaryLoom = new BestiaryLoom(apiKey);
      const bestiary = await bestiaryLoom.weave(settings, loom);

      const itemLoom = new ItemLoom(apiKey);
      const items = await itemLoom.weave(settings, { world: loom, classes });

      // 4. Assemble
      const realm = {
        age: {
          id: `age-${Date.now()}`,
          name: options.age,
          description: `Generated Age of ${options.seed}`,
          theme: options.seed,
          seed: options.seed,
          settings
        },
        loom,
        factions,
        towns,
        dungeons,
        classes,
        heroes,
        quests,
        bestiary,
        items
      };

      // 5. Save
      const outputDir = path.resolve(process.cwd(), './generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${options.seed}_${timestamp}.json`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(realm, null, 2));
      console.log(`✅ Realm Woven Successfully!`);
      console.log(`💾 Saved to: ${filepath}`);

      const tsPath = filepath.replace('.json', '.ts');
      const tsContent = `export const REALM_CONTENT = ${JSON.stringify(realm, null, 2)} as const;`;
      fs.writeFileSync(tsPath, tsContent);
      console.log(`📝 TypeScript registry: ${tsPath}`);

    } catch (error) {
      console.error('❌ Weave failed:', error);
      process.exit(1);
    }
  });

program
  .command('simulate')
  .description('Run a headless simulation')
  .action(async () => {
    console.log("Simulating...");
    // Simulation logic removed for brevity of this update, 
    // but traditionally it loads realm.json and runs the ECS.
  });

program.parse(process.argv.filter(a => a !== '--'));
