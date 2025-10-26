/**
 * Tests for Yuka Grid System
 */

import { YukaGridSystem } from '../../src/runtime/systems/YukaGridSystem';
import { GridPosition } from '../../src/types';

describe('YukaGridSystem', () => {
  describe('Basic Grid Operations', () => {
    test('should create grid with correct dimensions', () => {
      const grid = new YukaGridSystem(10, 8, 1.0);
      
      expect(grid.width).toBe(10);
      expect(grid.height).toBe(8);
      expect(grid.tileSize).toBe(1.0);
    });

    test('should initialize all tiles as walkable', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          expect(grid.isWalkable([x, y])).toBe(true);
        }
      }
    });

    test('should set tile walkability', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      grid.setWalkable([2, 2], false);
      
      expect(grid.isWalkable([2, 2])).toBe(false);
      expect(grid.isWalkable([2, 3])).toBe(true);
    });

    test('should handle out-of-bounds checks', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      expect(grid.isWalkable([-1, 0])).toBe(false);
      expect(grid.isWalkable([0, -1])).toBe(false);
      expect(grid.isWalkable([5, 0])).toBe(false);
      expect(grid.isWalkable([0, 5])).toBe(false);
    });
  });

  describe('Coordinate Conversion', () => {
    test('should convert grid to world coordinates', () => {
      const grid = new YukaGridSystem(10, 10, 2.0);
      
      const world = grid.gridToWorld([0, 0]);
      
      // Center of tile at 0,0 with tileSize 2.0
      expect(world[0]).toBe(1.0);
      expect(world[1]).toBe(0);
      expect(world[2]).toBe(1.0);
    });

    test('should convert world to grid coordinates', () => {
      const grid = new YukaGridSystem(10, 10, 2.0);
      
      const gridPos = grid.worldToGrid([5.0, 0, 7.0]);
      
      // 5.0 / 2.0 = 2.5, floor = 2
      // 7.0 / 2.0 = 3.5, floor = 3
      expect(gridPos[0]).toBe(2);
      expect(gridPos[1]).toBe(3);
    });

    test('should round-trip grid/world conversion', () => {
      const grid = new YukaGridSystem(10, 10, 1.0);
      
      const original: GridPosition = [5, 7];
      const world = grid.gridToWorld(original);
      const converted = grid.worldToGrid(world);
      
      expect(converted[0]).toBe(original[0]);
      expect(converted[1]).toBe(original[1]);
    });
  });

  describe('Pathfinding', () => {
    test('should find simple path', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      const path = grid.findPath([0, 0], [4, 4]);
      
      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThan(0);
      expect(path![0]).toEqual([0, 0]);
      expect(path![path!.length - 1]).toEqual([4, 4]);
    });

    test('should find path around obstacles', () => {
      const grid = new YukaGridSystem(7, 5, 1.0);
      
      // Create wall (leave gap at top)
      grid.setWalkable([3, 1], false);
      grid.setWalkable([3, 2], false);
      grid.setWalkable([3, 3], false);
      grid.setWalkable([3, 4], false);
      
      const path = grid.findPath([0, 2], [6, 2]);
      
      expect(path).not.toBeNull();
      // Path must go around the wall (either over or under)
      expect(path!.length).toBeGreaterThan(6);
    });

    test('should return null for blocked path', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      // Completely surround target
      grid.setWalkable([3, 2], false);
      grid.setWalkable([4, 1], false);
      grid.setWalkable([4, 3], false);
      
      const path = grid.findPath([0, 0], [4, 2]);
      
      expect(path).toBeNull();
    });

    test('should return null for unwalkable start', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      grid.setWalkable([0, 0], false);
      
      const path = grid.findPath([0, 0], [4, 4]);
      
      expect(path).toBeNull();
    });

    test('should return null for unwalkable end', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      grid.setWalkable([4, 4], false);
      
      const path = grid.findPath([0, 0], [4, 4]);
      
      expect(path).toBeNull();
    });

    test('should find shortest path', () => {
      const grid = new YukaGridSystem(10, 10, 1.0);
      
      const path = grid.findPath([0, 0], [5, 5]);
      
      expect(path).not.toBeNull();
      // With diagonals, shortest path to (5,5) is 6 steps (5 diagonals + 1 straight)
      // Without diagonals, it would be 11 steps
      expect(path!.length).toBeLessThanOrEqual(6);
    });
  });

  describe('Statistics', () => {
    test('should report correct node count', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      const stats = grid.getStats();
      
      // 5x5 = 25 walkable tiles = 25 nodes
      expect(stats.nodes).toBe(25);
      expect(stats.walkableTiles).toBe(25);
    });

    test('should report correct node count with obstacles', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      grid.setWalkable([2, 2], false);
      grid.setWalkable([3, 3], false);
      
      const stats = grid.getStats();
      
      // 25 - 2 = 23 walkable tiles
      expect(stats.nodes).toBe(23);
      expect(stats.walkableTiles).toBe(23);
    });

    test('should report edge count', () => {
      const grid = new YukaGridSystem(5, 5, 1.0);
      
      const stats = grid.getStats();
      
      // Each interior node has 8 edges (4 cardinal + 4 diagonal)
      // Edge nodes and corner nodes have fewer
      expect(stats.edges).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    test('should handle large grids efficiently', () => {
      const grid = new YukaGridSystem(100, 100, 1.0);
      
      const start = performance.now();
      const path = grid.findPath([0, 0], [99, 99]);
      const time = performance.now() - start;
      
      expect(path).not.toBeNull();
      expect(time).toBeLessThan(100); // Should complete in <100ms
    });

    test('should handle multiple pathfinding calls', () => {
      const grid = new YukaGridSystem(50, 50, 1.0);
      
      const start = performance.now();
      
      for (let i = 0; i < 10; i++) {
        grid.findPath([0, 0], [49, 49]);
      }
      
      const time = performance.now() - start;
      
      expect(time).toBeLessThan(100); // 10 paths in <100ms
    });
  });
});
