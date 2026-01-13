#!/usr/bin/env tsx
console.log("DEBUG: CLI Script Starting...");
import {
  BestiaryLoomDef,
  ClassLoomDef,
  ItemLoomDef,
  RealmContext,
  Shuttle,
  Tapestry,
  WorldLoomDef
} from '@realm-walker/looms';
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
      // ... (Keep existing mock logic or update if needed, but for now focus on the Weave)
      // I'll keep the mock logic simple for this tool call to avoid massive diffs, 
      // but ideally the Mock should also respect the new structure.
      // For now, I will return early if mock to avoid breaking the verified test.
      // Re-implementing the mock fully here to be safe and remove old code.
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
        }
      };
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

    console.log(`🧵 Weaving Realm with Settings:`, settings.controls);

    try {
      // 2. The Shuttle (Orchestration)
      const tapestry = new Tapestry<RealmContext>({ settings });
      const shuttle = new Shuttle<RealmContext>(apiKey, tapestry);

      // Register Jobs (Dependencies handled by order of addition here)
      shuttle.addJob(WorldLoomDef);
      shuttle.addJob(ClassLoomDef);
      shuttle.addJob(BestiaryLoomDef);
      shuttle.addJob(ItemLoomDef);

      console.log(`🚀 Launching Shuttle...`);
      const context = await shuttle.launch();

      // 3. Assemble
      const realm = {
        age: {
          id: `age-${Date.now()}`,
          name: options.age,
          description: `Generated Age of ${options.seed}`,
          theme: options.seed,
          seed: options.seed,
          settings
        },
        loom: context.world,
        classes: context.classes,
        bestiary: context.bestiary,
        items: context.items
      };

      // 4. Save
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
  .description('Run a headless simulation of the game loop using generated realm data')
  .action(async () => {
    console.log('🚀 Starting RealmWalker Simulation...');

    // 1. Load Realm Data
    const realmPath = path.join(process.cwd(), 'realm.json');
    if (!fs.existsSync(realmPath)) {
      console.error('❌ realm.json not found. Run "pnpm generate-realm" first.');
      process.exit(1);
    }
    const realmData = JSON.parse(fs.readFileSync(realmPath, 'utf-8'));
    console.log(`📜 Loaded Realm: ${realmData.age?.name || 'Unknown'}`);

    // 2. Hydrate Registry
    const { db, SchemaLoader } = await import('@realm-walker/mechanics');
    const loader = new SchemaLoader(db);
    loader.loadRealm(realmData);

    // 3. Initialize ECS
    const { world, createEntity, InputSystem, Loop } = await import('@realm-walker/core');
    const { AISystem, Agent } = await import('@realm-walker/ai');

    console.log('🌌 Core ECS World initialized');

    // 4. Spawn Agents based on Generated Classes
    if (realmData.classes && realmData.classes.length > 0) {
      const cls = realmData.classes[0];
      console.log(`Creation: Spawning Agent of Class: ${cls.name} (${cls.visuals?.spriteId || 'no-sprite'})`);

      createEntity({
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        brain: { agent: new Agent() },
        visuals: {
          spriteId: cls.visuals?.spriteId || 'default_sprite',
          scale: cls.visuals?.scale || 1,
          tint: cls.visuals?.tint
        }
      });
    } else {
      console.warn('⚠️ No classes found in realm data, spawning generic agent.');
      createEntity({
        position: { x: 0, y: 0, z: 0 },
        brain: { agent: new Agent() }
      });
    }

    // 5. Run Loop
    const loop = new Loop();
    const inputSystem = new InputSystem();
    const aiSystem = new AISystem(world);
    loop.addSystem(() => inputSystem.update());
    loop.addSystem((dt) => aiSystem.update(dt));

    let ticks = 0;
    const maxTicks = 5;

    console.log(`Simulation: Running for ${maxTicks} ticks...`);

    loop.addSystem((_dt) => {
      ticks++;
      // Log first entity position and visual state
      const entities = world.with('position', 'visuals');
      if (entities.size > 0 && ticks % 1 === 0) {
        const [first] = entities;
        console.log(`Tick ${ticks}: Entity ${first.id} at ${JSON.stringify(first.position)}`);
      }

      if (ticks >= maxTicks) {
        console.log("Simulation: Complete.");
        loop.stop();
        process.exit(0);
      }
    });

    loop.start();
  });

program.parse(process.argv.filter(a => a !== '--'));
