/**
 * Unit tests for GridSystemImpl
 * Tests A* pathfinding and coordinate conversion
 */

import { GridSystemImpl } from '../../src/runtime/systems/GridSystemImpl';
import { GridPosition } from '../../src/types/GridSystem';

describe('GridSystemImpl', () => {
  let gridSystem: GridSystemImpl;

  beforeEach(() => {
    gridSystem = new GridSystemImpl(10, 10, 1.0);
  });

  describe('Coordinate Conversion', () => {
    test('converts grid to world coordinates correctly', () => {
      const gridPos: GridPosition = [5, 5];
      const worldPos = gridSystem.gridToWorld(gridPos);
      
      // Center of tile should be at 0.5 offset
      expect(worldPos[0]).toBe(5.5);
      expect(worldPos[1]).toBe(0);
      expect(worldPos[2]).toBe(5.5);
    });

    test('converts world to grid coordinates correctly', () => {
      const worldPos: [number, number, number] = [5.7, 0, 5.3];
      const gridPos = gridSystem.worldToGrid(worldPos);
      
      expect(gridPos[0]).toBe(5);
      expect(gridPos[1]).toBe(5);
    });

    test('round-trip conversion preserves position', () => {
      const originalGrid: GridPosition = [3, 7];
      const world = gridSystem.gridToWorld(originalGrid);
      const backToGrid = gridSystem.worldToGrid(world);
      
      expect(backToGrid[0]).toBe(originalGrid[0]);
      expect(backToGrid[1]).toBe(originalGrid[1]);
    });
  });

  describe('Walkability', () => {
    test('all tiles are walkable by default', () => {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          expect(gridSystem.isWalkable([x, y])).toBe(true);
        }
      }
    });

    test('can mark tiles as non-walkable', () => {
      const pos: GridPosition = [5, 5];
      gridSystem.setWalkable(pos, false);
      
      expect(gridSystem.isWalkable(pos)).toBe(false);
    });

    test('out of bounds positions are not walkable', () => {
      expect(gridSystem.isWalkable([-1, 5])).toBe(false);
      expect(gridSystem.isWalkable([10, 5])).toBe(false);
      expect(gridSystem.isWalkable([5, -1])).toBe(false);
      expect(gridSystem.isWalkable([5, 10])).toBe(false);
    });
  });

  describe('Pathfinding', () => {
    test('finds straight path between adjacent tiles', () => {
      const start: GridPosition = [0, 0];
      const end: GridPosition = [0, 3];
      
      const path = gridSystem.findPath(start, end);
      
      expect(path).not.toBeNull();
      expect(path?.length).toBe(4);
      expect(path![0]).toEqual(start);
      expect(path![path!.length - 1]).toEqual(end);
    });

    test('finds path around obstacles', () => {
      // Create a wall at x=5, from y=1 to y=8 (excluding y=0 and y=9)
      for (let y = 1; y < 9; y++) {
        gridSystem.setWalkable([5, y], false);
      }
      
      const start: GridPosition = [3, 5];
      const end: GridPosition = [7, 5];
      
      const path = gridSystem.findPath(start, end);
      
      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThan(4); // Should go around wall
      
      // Verify path doesn't go through the blocked part of the wall (y=1 to y=8)
      for (const pos of path!) {
        if (pos[0] === 5) {
          // If x=5, y must be 0 or 9 (not blocked)
          expect(pos[1] === 0 || pos[1] === 9).toBe(true);
        }
      }
    });

    test('returns null when no path exists', () => {
      // Create complete enclosure
      for (let x = 4; x <= 6; x++) {
        gridSystem.setWalkable([x, 4], false);
        gridSystem.setWalkable([x, 6], false);
      }
      for (let y = 4; y <= 6; y++) {
        gridSystem.setWalkable([4, y], false);
        gridSystem.setWalkable([6, y], false);
      }
      
      const start: GridPosition = [5, 5];
      const end: GridPosition = [0, 0];
      
      const path = gridSystem.findPath(start, end);
      
      expect(path).toBeNull();
    });

    test('returns null for non-walkable start position', () => {
      gridSystem.setWalkable([0, 0], false);
      
      const path = gridSystem.findPath([0, 0], [5, 5]);
      
      expect(path).toBeNull();
    });

    test('returns null for non-walkable end position', () => {
      gridSystem.setWalkable([5, 5], false);
      
      const path = gridSystem.findPath([0, 0], [5, 5]);
      
      expect(path).toBeNull();
    });

    test('finds optimal path (shortest)', () => {
      const start: GridPosition = [0, 0];
      const end: GridPosition = [3, 3];
      
      const path = gridSystem.findPath(start, end);
      
      expect(path).not.toBeNull();
      // Manhattan distance is 6, optimal path length is 7 (including start)
      expect(path!.length).toBe(7);
    });
  });
});
