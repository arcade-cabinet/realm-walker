/**
 * Demo: Third-Party Library Integration
 * Demonstrates React Three Fiber, Yuka.js pathfinding, and NPC AI
 */

import { SceneCompositor } from './runtime/systems/SceneCompositor';
import { YukaGridSystem } from './runtime/systems/YukaGridSystem';
import { NPCManager } from './runtime/systems/NPCController';
import { QuestManager } from './runtime/systems/QuestManager';
import { SceneTemplate } from './types/SceneDefinition';
import { GridPosition, WorldPosition } from './types/GridSystem';

async function demoYukaPathfinding() {
  console.log('\n=== Yuka.js Pathfinding Demo ===\n');

  // Create a test scene
  const sceneTemplate: SceneTemplate = {
    id: 'yuka_test_scene',
    grid: { width: 16, height: 12 },
    floor: { texture: 'stone' },
    slots: {
      npcs: [
        { id: 'guard', position: [2, 2] },
        { id: 'merchant', position: [14, 10] }
      ],
      props: [
        { id: 'fountain', position: [8, 6] }
      ]
    }
  };

  // Create grid system using Yuka
  console.log('Creating Yuka-enhanced grid system...');
  const yukaGrid = new YukaGridSystem(16, 12, 1.0);

  // Add some obstacles
  yukaGrid.setWalkable([7, 5], false);
  yukaGrid.setWalkable([8, 5], false);
  yukaGrid.setWalkable([9, 5], false);
  yukaGrid.setWalkable([7, 6], false);
  yukaGrid.setWalkable([9, 6], false);
  yukaGrid.setWalkable([7, 7], false);
  yukaGrid.setWalkable([8, 7], false);
  yukaGrid.setWalkable([9, 7], false);

  console.log('Grid stats:', yukaGrid.getStats());

  // Test pathfinding
  console.log('\nFinding path from [2, 2] to [14, 10]...');
  const start: GridPosition = [2, 2];
  const end: GridPosition = [14, 10];
  
  const pathStart = performance.now();
  const path = yukaGrid.findPath(start, end);
  const pathTime = performance.now() - pathStart;

  if (path) {
    console.log(`✅ Path found with ${path.length} steps in ${pathTime.toFixed(2)}ms`);
    console.log('Path:', path.slice(0, 5), '...', path.slice(-3));
  } else {
    console.log('❌ No path found');
  }

  // Test world/grid conversion
  const worldPos = yukaGrid.gridToWorld([8, 6]);
  const gridPos = yukaGrid.worldToGrid(worldPos);
  console.log(`\nConversion test: [8, 6] → ${worldPos} → [${gridPos}]`);
}

async function demoNPCAI() {
  console.log('\n=== Yuka.js NPC AI Demo ===\n');

  // Create NPC manager
  const npcManager = new NPCManager();
  const questManager = new QuestManager();

  // Create NPCs
  console.log('Creating NPCs with Yuka steering behaviors...');
  
  const guard = npcManager.createNPC({
    id: 'guard',
    position: [2, 0, 2],
    maxSpeed: 2.0,
    wanderRadius: 5.0
  });

  const merchant = npcManager.createNPC({
    id: 'merchant',
    position: [14, 0, 10],
    maxSpeed: 1.5,
    wanderRadius: 3.0
  });

  console.log(`✅ Created ${npcManager.getAllNPCs().length} NPCs`);

  // Define simulation interface
  interface Simulation {
    name: string;
    flags: Record<string, boolean>;
    playerPos: WorldPosition;
  }

  // Simulate game loop
  console.log('\nSimulating NPC behaviors...');
  
  const simulations: Simulation[] = [
    {
      name: 'Idle state',
      flags: {},
      playerPos: [8, 0, 6]
    },
    {
      name: 'Guard wanders',
      flags: { 'npc_guard_active': true },
      playerPos: [8, 0, 6]
    },
    {
      name: 'Guard seeks player',
      flags: { 'npc_guard_hostile': true },
      playerPos: [8, 0, 6]
    },
    {
      name: 'Merchant flees',
      flags: { 'npc_merchant_afraid': true },
      playerPos: [14, 0, 10]
    }
  ];

  for (const sim of simulations) {
    console.log(`\n--- ${sim.name} ---`);
    
    // Reset quest flags for each simulation
    questManager.reset();

    for (const [flag, value] of Object.entries(sim.flags)) {
      questManager.setFlag(flag, value);
    }

    // Update NPCs for a few frames
    for (let i = 0; i < 5; i++) {
      npcManager.update(0.016, questManager.getState(), sim.playerPos);
      
      if (i === 4) {
        console.log(`Guard position: [${guard.getPosition().map(v => v.toFixed(1)).join(', ')}]`);
        console.log(`Merchant position: [${merchant.getPosition().map(v => v.toFixed(1)).join(', ')}]`);
      }
    }
  }

  // Cleanup
  npcManager.clear();
  console.log('\n✅ NPC demo complete');
}

async function demoPerformanceComparison() {
  console.log('\n=== Performance Comparison: Custom A* vs Yuka A* ===\n');

  // Create both implementations
  const { GridSystemImpl } = await import('./runtime/systems/GridSystemImpl');
  const customGrid = new GridSystemImpl(32, 32, 1.0);
  const yukaGrid = new YukaGridSystem(32, 32, 1.0);

  // Add same obstacles to both
  for (let i = 10; i < 20; i++) {
    customGrid.setWalkable([i, 15], false);
    yukaGrid.setWalkable([i, 15], false);
  }

  // Test pathfinding performance
  const tests = 100;
  const testCases: { start: GridPosition, end: GridPosition }[] = [
    { start: [0, 0], end: [31, 31] },
    { start: [0, 31], end: [31, 0] },
    { start: [16, 0], end: [16, 31] },
    { start: [5, 5], end: [25, 25] }
  ];

  console.log(`Running ${tests} iterations per test case...`);

  for (const { start, end } of testCases) {
    console.log(`\nPath: [${start[0]}, ${start[1]}] → [${end[0]}, ${end[1]}]`);
    
    // Custom A*
    const customStart = performance.now();
    for (let i = 0; i < tests; i++) {
      customGrid.findPath(start, end);
    }
    const customTime = performance.now() - customStart;

    // Yuka A*
    const yukaStart = performance.now();
    for (let i = 0; i < tests; i++) {
      yukaGrid.findPath(start, end);
    }
    const yukaTime = performance.now() - yukaStart;

    const speedup = customTime / yukaTime;
    console.log(`  Custom A*: ${customTime.toFixed(2)}ms`);
    console.log(`  Yuka A*:   ${yukaTime.toFixed(2)}ms`);
    console.log(`  Speedup:   ${speedup.toFixed(2)}x ${speedup > 1 ? '🚀' : '⚠️'}`);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  Third-Party Library Integration Demo             ║');
  console.log('║  React Three Fiber + Yuka.js + PathFinding        ║');
  console.log('╚════════════════════════════════════════════════════╝');

  try {
    // Demo 1: Yuka pathfinding
    await demoYukaPathfinding();

    // Demo 2: NPC AI with steering behaviors
    await demoNPCAI();

    // Demo 3: Performance comparison
    await demoPerformanceComparison();

    console.log('\n✅ All demos completed successfully!');
    console.log('\nNext steps:');
    console.log('  - Integrate R3FGameCompositor for React rendering');
    console.log('  - Add NavMesh support for complex geometry');
    console.log('  - Create patrol paths in story bindings');
    console.log('  - Add more steering behaviors (pursue, evade, etc.)');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { demoYukaPathfinding, demoNPCAI, demoPerformanceComparison };
