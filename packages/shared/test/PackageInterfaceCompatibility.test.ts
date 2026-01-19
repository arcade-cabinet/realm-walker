import { describe, expect, it } from 'vitest';

describe('Package Interface Compatibility', () => {
  describe('Cross-Package Integration', () => {
    it('should validate all packages can be imported together', async () => {
      // Test that all packages can be imported without conflicts
      const coreModule = await import('@realm-walker/core');
      const aiModule = await import('@realm-walker/ai');
      const mechanicsModule = await import('@realm-walker/mechanics');
      const sharedModule = await import('@realm-walker/shared');
      
      expect(coreModule).toBeDefined();
      expect(aiModule).toBeDefined();
      expect(mechanicsModule).toBeDefined();
      expect(sharedModule).toBeDefined();
      
      // Verify key exports exist
      expect(coreModule.World).toBeDefined();
      expect(aiModule.Agent).toBeDefined();
      expect(mechanicsModule.db).toBeDefined();
      expect(sharedModule.Prng).toBeDefined();
    });

    it('should maintain consistent type interfaces across packages', async () => {
      const { World } = await import('@realm-walker/core');
      const { Agent } = await import('@realm-walker/ai');
      const { Prng } = await import('@realm-walker/shared');
      
      // Test that packages work together
      const world = new World('compatibility-test');
      const agent = new Agent();
      const prng = new Prng('test-seed');
      
      // Create entity with AI component
      const entity = world.create({
        position: { x: 0, y: 0, z: 0 },
        brain: { agent },
        testRng: prng.next()
      });
      
      expect(entity.brain.agent).toBe(agent);
      expect(typeof entity.testRng).toBe('number');
    });
  });

  describe('Version Compatibility', () => {
    it('should maintain backward compatibility for core interfaces', async () => {
      const { World, GameStateSerializer } = await import('@realm-walker/core');
      
      // Test legacy usage patterns still work
      const world = new World();
      const serializer = new GameStateSerializer();
      
      // Legacy entity creation
      const entity = world.create({
        x: 5, y: 5, // Old position format
        hp: 100,   // Old health format
        name: 'Legacy Entity'
      });
      
      expect(entity).toBeDefined();
      expect(entity.id).toBeDefined();
      
      // Serialization should handle legacy data
      const serialized = serializer.serialize(world);
      expect(serialized.entities).toHaveLength(1);
    });
  });
});