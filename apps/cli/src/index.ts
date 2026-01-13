#!/usr/bin/env tsx
console.log("DEBUG: CLI Script Starting...");
import {
    ArchetypalTapestry,
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
  .option('--mock', 'Use mock data instead of API')
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
  .command('archetypal')
  .description('Generate an archetypal RPG realm inspired by mid-1990s classics')
  .option('-s, --seed <seed>', 'Seed for generation', 'Crystal-Sanctuary-1994')
  .option('-a, --age <age>', 'Age/Era theme', 'The Age of Espers')
  .option('--mock', 'Use mock data instead of API')
  .option('--danger <level>', 'Danger Level (1-10)', '7')
  .option('--magic <level>', 'Magic Level (1-10)', '8')
  .option('--tech <level>', 'Tech Level (1-10)', '3')
  .option('--combat <style>', 'Combat style preference', 'balanced')
  .option('--quest-focus <focus>', 'Quest focus type', 'balanced')
  .action(async (options) => {
    console.log('🌟 Generating Archetypal RPG Realm...');
    console.log('📖 Inspired by: Final Fantasy VI, Chrono Trigger, Secret of Mana, Earthbound');
    // Check for mock flag in process.argv as fallback
    const isMockMode = options.mock || process.argv.includes('--mock');

    // Mock handling for archetypal realm
    if (isMockMode) {
      console.log('🎭 Using MOCK archetypal data...');
      const { ArchetypalTapestry } = await import('@realm-walker/looms');
      const mockSettings = {
        seed: options.seed,
        age: options.age,
        controls: {
          worldScale: 6,
          minNodes: 5,
          dangerLevel: parseInt(options.danger),
          magicLevel: parseInt(options.magic),
          technologyLevel: parseInt(options.tech)
        },
        preferences: {
          factions: true,
          items: true,
          bestiary: true,
          hero: true,
          quests: true,
          biases: {
            questFocus: options.questFocus as any,
            combatDifficulty: options.combat as any
          }
        }
      };

      const mockRealm = ArchetypalTapestry.createMockArchetypalRealm(mockSettings);
      
      const outputDir = path.resolve(process.cwd(), './generated');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
      
      const filename = `${options.seed}_ARCHETYPAL_MOCK.json`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(mockRealm, null, 2));
      console.log(`✅ Mock Archetypal Realm generated: ${filepath}`);
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is required');
      process.exit(1);
    }

    const settings = {
      seed: options.seed,
      age: options.age,
      controls: {
        worldScale: 6,
        minNodes: 5,
        dangerLevel: parseInt(options.danger),
        magicLevel: parseInt(options.magic),
        technologyLevel: parseInt(options.tech)
      },
      preferences: {
        factions: true,
        items: true,
        bestiary: true,
        hero: true,
        quests: true,
        biases: {
          questFocus: options.questFocus as any,
          combatDifficulty: options.combat as any
        }
      }
    };

    console.log(`🧵 Weaving Archetypal Realm with Settings:`, settings.controls);

    try {
      const archetypalTapestry = new ArchetypalTapestry(apiKey);
      const archetypalRealm = await archetypalTapestry.weaveArchetypalRealm(settings);

      // Save the complete archetypal realm
      const outputDir = path.resolve(process.cwd(), './generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${options.seed}_ARCHETYPAL_${timestamp}.json`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(archetypalRealm, null, 2));
      console.log(`✅ Archetypal Realm Woven Successfully!`);
      console.log(`💾 Saved to: ${filepath}`);

      // Also create a TypeScript export
      const tsPath = filepath.replace('.json', '.ts');
      const tsContent = `export const ARCHETYPAL_REALM = ${JSON.stringify(archetypalRealm, null, 2)} as const;`;
      fs.writeFileSync(tsPath, tsContent);
      console.log(`📝 TypeScript registry: ${tsPath}`);

    } catch (error) {
      console.error('❌ Archetypal Weave failed:', error);
      process.exit(1);
    }
  });

program
  .command('simulate')
  .description('Run a headless simulation of the game loop using generated realm data')
  .option('-t, --ticks <count>', 'Number of simulation ticks to run', '10')
  .option('-r, --report-interval <interval>', 'Report state every N ticks', '1')
  .option('-v, --verbose', 'Enable verbose state reporting', false)
  .option('--mock', 'Use mock realm data for testing')
  .option('--verify-determinism', 'Run multiple simulations to verify deterministic behavior', false)
  .action(async (options) => {
    console.log('🚀 Starting RealmWalker Headless Simulation...');
    console.log(`📊 Configuration: ${options.ticks} ticks, report every ${options.reportInterval} ticks`);

    let realmData;

    // Handle mock mode
    if (options.mock) {
      console.log('🎭 Using mock realm data for simulation...');
      realmData = {
        age: { id: "mock-age", name: "Mock Simulation Era", description: "Test realm for headless simulation" },
        classes: [{ 
          id: "test-class", 
          name: "Test Agent", 
          description: "Simulation test agent",
          stats: { str: 10, agi: 8, int: 12, hp: 100 },
          visuals: { spriteId: "test-agent", scale: 1.0 }
        }],
        items: [{ 
          id: "test-item", 
          name: "Test Sword", 
          description: "Basic test weapon",
          type: "weapon",
          visuals: { iconId: "sword" }
        }],
        bestiary: [{ 
          id: "test-monster", 
          name: "Test Creature", 
          description: "Basic test enemy",
          stats: { str: 5, agi: 5, int: 3, hp: 50 },
          behavior: "neutral",
          visuals: { spriteId: "creature" }
        }],
        loom: {
          title: "Test Simulation World",
          summary: "A controlled environment for headless testing",
          nodes: [
            { id: "start", name: "Origin", description: "Starting location", biome: "plains", difficulty: 1 },
            { id: "middle", name: "Crossroads", description: "Decision point", biome: "forest", difficulty: 3 },
            { id: "end", name: "Destination", description: "Final location", biome: "mountain", difficulty: 5 }
          ],
          edges: [
            { from: "start", to: "middle", description: "Forest path", travelTime: 5 },
            { from: "middle", to: "end", description: "Mountain trail", travelTime: 8 }
          ]
        }
      };
    } else {
      // Load realm data from file
      const realmPath = path.join(process.cwd(), 'realm.json');
      if (!fs.existsSync(realmPath)) {
        console.error('❌ realm.json not found. Run "pnpm generate-realm" first or use --mock flag.');
        process.exit(1);
      }
      realmData = JSON.parse(fs.readFileSync(realmPath, 'utf-8'));
    }

    console.log(`📜 Loaded Realm: ${realmData.age?.name || 'Unknown'}`);

    // Determinism verification mode
    if (options.verifyDeterminism) {
      console.log('🔬 Running determinism verification (3 identical simulations)...');
      const results = [];
      
      for (let run = 1; run <= 3; run++) {
        console.log(`\n--- Determinism Run ${run} ---`);
        const result = await runSingleSimulation(realmData, {
          ticks: parseInt(options.ticks),
          reportInterval: parseInt(options.reportInterval),
          verbose: options.verbose,
          runId: run
        });
        results.push(result);
      }

      // Compare results (excluding runId which is intentionally different)
      const firstChecksum = results[0].stateChecksum;
      const allIdentical = results.every(result => result.stateChecksum === firstChecksum);
      
      if (allIdentical) {
        console.log('\n✅ DETERMINISM VERIFIED: All simulation runs produced identical results');
        console.log(`   Shared state checksum: ${firstChecksum}`);
        console.log(`   Entity count: ${results[0].finalEntityCount}`);
        console.log(`   Total ticks: ${results[0].totalTicks}`);
      } else {
        console.log('\n❌ DETERMINISM FAILED: Simulation runs produced different results');
        console.log('Checksum comparison:');
        results.forEach((result, index) => {
          console.log(`Run ${index + 1}: ${result.stateChecksum} (${result.finalEntityCount} entities)`);
        });
        process.exit(1);
      }
    } else {
      // Single simulation run
      await runSingleSimulation(realmData, {
        ticks: parseInt(options.ticks),
        reportInterval: parseInt(options.reportInterval),
        verbose: options.verbose,
        runId: 1
      });
    }

    console.log('\n🎯 Headless simulation completed successfully');
  });

async function runSingleSimulation(realmData: any, config: {
  ticks: number;
  reportInterval: number;
  verbose: boolean;
  runId: number;
}) {
  // 1. Hydrate Registry (fresh for each run)
  const { db, SchemaLoader } = await import('@realm-walker/mechanics');
  const loader = new SchemaLoader(db);
  loader.loadRealm(realmData);

  // 2. Initialize ECS with deterministic seed (fresh world for each run)
  const { World, InputSystem, Loop } = await import('@realm-walker/core');
  const { AISystem, Agent } = await import('@realm-walker/ai');

  // Create a fresh world for this simulation run with deterministic seed
  // For determinism verification, use the same seed for all runs
  const world = new World(`deterministic-simulation-seed`);
  console.log(`🌌 Core ECS World initialized for run ${config.runId}`);

  // 3. Spawn Agents based on Generated Classes
  const spawnedEntities = [];
  if (realmData.classes && realmData.classes.length > 0) {
    const cls = realmData.classes[0];
    if (config.verbose) {
      console.log(`🎭 Spawning Agent: ${cls.name} (${cls.visuals?.spriteId || 'no-sprite'})`);
    }

    const entity = world.create({
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      brain: { agent: new Agent() },
      visuals: {
        spriteId: cls.visuals?.spriteId || 'default_sprite',
        scale: cls.visuals?.scale || 1,
        tint: cls.visuals?.tint
      }
    });
    spawnedEntities.push(entity);
  } else {
    console.warn('⚠️ No classes found in realm data, spawning generic agent.');
    const entity = world.create({
      position: { x: 0, y: 0, z: 0 },
      brain: { agent: new Agent() }
    });
    spawnedEntities.push(entity);
  }

  // 4. Initialize Systems
  const loop = new Loop();
  const inputSystem = new InputSystem();
  const aiSystem = new AISystem(world);
  
  loop.addSystem(() => inputSystem.update());
  loop.addSystem((dt) => aiSystem.update(dt));

  // 5. State tracking for verification
  const stateHistory: any[] = [];
  let currentTick = 0;

  // 7. Run simulation
  return new Promise((resolve) => {
    let completed = false;
    
    const completeSimulation = () => {
      if (completed) return;
      completed = true;
      
      // Generate final report
      const finalReport = {
        runId: config.runId,
        totalTicks: currentTick,
        finalEntityCount: world.with('position').size,
        stateChecksum: generateStateChecksum(stateHistory),
        firstState: stateHistory[0] || null,
        lastState: stateHistory[stateHistory.length - 1] || null
      };

      if (config.verbose) {
        console.log('\n📋 Final Simulation Report:');
        console.log(`   Run ID: ${finalReport.runId}`);
        console.log(`   Total Ticks: ${finalReport.totalTicks}`);
        console.log(`   Final Entity Count: ${finalReport.finalEntityCount}`);
        console.log(`   State Checksum: ${finalReport.stateChecksum}`);
      }

      loop.stop();
      resolve(finalReport);
    };

    // Add completion check to the simulation loop
    loop.addSystem((dt) => {
      currentTick++;
      
      // Capture current state
      const entities = world.with('position');
      const currentState = {
        tick: currentTick,
        deltaTime: dt,
        entityCount: entities.size,
        entities: Array.from(entities).map(entity => ({
          id: entity.id,
          position: { ...entity.position },
          velocity: entity.velocity ? { ...entity.velocity } : null,
          hasAI: !!entity.brain,
          visuals: entity.visuals ? { spriteId: entity.visuals.spriteId, scale: entity.visuals.scale } : null
        }))
      };
      
      stateHistory.push(currentState);

      // Report state at specified intervals
      if (currentTick % config.reportInterval === 0 || config.verbose) {
        console.log(`📊 Tick ${currentTick}/${config.ticks}:`);
        console.log(`   Entities: ${currentState.entityCount}`);
        
        if (config.verbose && currentState.entities.length > 0) {
          currentState.entities.forEach(entity => {
            console.log(`   Entity ${entity.id}: pos(${entity.position.x.toFixed(2)}, ${entity.position.y.toFixed(2)}, ${entity.position.z.toFixed(2)})`);
            if (entity.velocity) {
              console.log(`     velocity(${entity.velocity.x.toFixed(2)}, ${entity.velocity.y.toFixed(2)}, ${entity.velocity.z.toFixed(2)})`);
            }
            if (entity.hasAI) {
              console.log(`     AI: active`);
            }
          });
        }
      }

      // Stop condition
      if (currentTick >= config.ticks) {
        console.log(`✅ Simulation completed: ${currentTick} ticks processed`);
        completeSimulation();
      }
    });

    loop.start();
  });
}

function generateStateChecksum(stateHistory: any[]): string {
  // Generate a simple checksum of the state history for determinism verification
  const stateString = JSON.stringify(stateHistory.map(state => ({
    tick: state.tick,
    entityPositions: state.entities.map((e: any) => ({ id: e.id, pos: e.position }))
  })));
  
  // Simple hash function for checksum
  let hash = 0;
  for (let i = 0; i < stateString.length; i++) {
    const char = stateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

program.parse(process.argv.filter(a => a !== '--'));
