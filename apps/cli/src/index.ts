#!/usr/bin/env tsx
console.log("DEBUG: CLI Script Starting...");
import { GenAIWrapper } from '@realm-walker/genai';
import { RealmSchema } from '@realm-walker/shared';
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
  .action(async (options) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY environment variable is required');
      process.exit(1);
    }

    const wrapper = new GenAIWrapper(apiKey);
    const theme = options.seed.replace(/-/g, ' ');

    console.log(`🌊 Generating realm for theme: "${theme}"...`);

    const prompt = `
      Generate complete game content for the "${options.age}" age of RealmWalker.
      Theme: ${theme}
      
      Requirements:
      - Classes: RPG-style classes (Warrior, Mage, etc.) adapted to the theme.
      - Items: Weapons, Armor, and Consumables.
      - **Visuals**: You MUST populate the 'visuals' field for Classes and Items.
        - spriteId: A short, descriptive ID for a 2D billboard sprite (e.g. 'pixel_knight_blue', 'sword_iron_icon').
        - iconId: A short ID for the inventory icon.
        - NO 3D MODELS.
      
      Outputs:
      - classes: 3-5 distinct classes.
      - items: 5-10 starting items. INTERESTING and THEMATIC. Use the provided schema for structured output.
    `;

    try {
      const realm = await wrapper.generateStructuredContent(
        prompt,
        RealmSchema,
        options.creative ? 1.2 : 0.8,
      );

      const outputDir = path.resolve(process.cwd(), './generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${options.seed}_${timestamp}.json`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(realm, null, 2));
      console.log(`✅ Realm generated successfully!`);
      console.log(`💾 Saved to: ${filepath}`);

      // Also generate a TS registry file
      const tsPath = filepath.replace('.json', '.ts');
      const tsContent = `export const REALM_CONTENT = ${JSON.stringify(realm, null, 2)} as const;`;
      fs.writeFileSync(tsPath, tsContent);
      console.log(`📝 TypeScript registry: ${tsPath}`);
    } catch (error) {
      console.error('❌ Generation failed:', error);
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
        brain: new Agent(),
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
        brain: new Agent()
      });
    }

    // 5. Run Loop
    const loop = new Loop(60);
    loop.addSystem(new InputSystem(world));
    loop.addSystem(new AISystem(world));

    let ticks = 0;
    const maxTicks = 5;

    console.log(`Simulation: Running for ${maxTicks} ticks...`);

    loop.start((dt) => {
      ticks++;
      // Log first entity position and visual state
      const entities = world.with('position', 'visuals');
      if (entities.size > 0) {
        const e = entities.first;
        if (e) {
          console.log(`[Tick ${ticks}] Pos: ${JSON.stringify(e.position)} | Sprite: ${e.visuals.spriteId}`);
        }
      }

      if (ticks >= maxTicks) {
        loop.stop();
        process.exit(0);
      }
    });

    loop.start();
  });

program.parse();
