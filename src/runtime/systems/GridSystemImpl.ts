/**
 * GridSystemImpl - Implementation of the GridSystem interface for navigation
 * Provides A* pathfinding and coordinate conversion
 */

import { GridSystem, GridPosition, WorldPosition } from '../../types/GridSystem';

export class GridSystemImpl implements GridSystem {
  width: number;
  height: number;
  walkable: boolean[][];
  tileSize: number;

  constructor(width: number, height: number, tileSize: number = 1.0) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    
    // Initialize all tiles as walkable
    this.walkable = Array.from({ length: height }, () => 
      Array.from({ length: width }, () => true)
    );
  }

  /**
   * Check if a position is walkable
   */
  isWalkable(pos: GridPosition): boolean {
    const [x, y] = pos;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    return this.walkable[y][x];
  }

  /**
   * Set walkability of a tile
   */
  setWalkable(pos: GridPosition, walkable: boolean): void {
    const [x, y] = pos;
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.walkable[y][x] = walkable;
    }
  }

  /**
   * Convert world position to grid position
   */
  worldToGrid(world: WorldPosition): GridPosition {
    const [wx, , wz] = world;  // Ignore y (height)
    const x = Math.floor(wx / this.tileSize);
    const z = Math.floor(wz / this.tileSize);
    return [x, z];
  }

  /**
   * Convert grid position to world position (center of tile)
   */
  gridToWorld(grid: GridPosition): WorldPosition {
    const [gx, gz] = grid;
    const wx = (gx + 0.5) * this.tileSize;
    const wz = (gz + 0.5) * this.tileSize;
    return [wx, 0, wz];
  }

  /**
   * Find path using A* algorithm
   */
  findPath(start: GridPosition, end: GridPosition): GridPosition[] | null {
    if (!this.isWalkable(start) || !this.isWalkable(end)) {
      return null;
    }

    interface Node {
      pos: GridPosition;
      g: number;  // Cost from start
      h: number;  // Heuristic to end
      f: number;  // Total cost
      parent: Node | null;
    }

    const openSet: Node[] = [];
    const closedSet = new Set<string>();
    
    const startNode: Node = {
      pos: start,
      g: 0,
      h: this.heuristic(start, end),
      f: this.heuristic(start, end),
      parent: null
    };
    
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      
      const posKey = `${current.pos[0]},${current.pos[1]}`;
      if (closedSet.has(posKey)) {
        continue;
      }
      
      closedSet.add(posKey);

      // Check if we reached the end
      if (current.pos[0] === end[0] && current.pos[1] === end[1]) {
        return this.reconstructPath(current);
      }

      // Check neighbors
      const neighbors = this.getNeighbors(current.pos);
      for (const neighborPos of neighbors) {
        const neighborKey = `${neighborPos[0]},${neighborPos[1]}`;
        if (closedSet.has(neighborKey)) {
          continue;
        }

        const g = current.g + 1;
        const h = this.heuristic(neighborPos, end);
        const f = g + h;

        const neighbor: Node = {
          pos: neighborPos,
          g,
          h,
          f,
          parent: current
        };

        openSet.push(neighbor);
      }
    }

    return null;  // No path found
  }

  /**
   * Get walkable neighbors of a position
   */
  private getNeighbors(pos: GridPosition): GridPosition[] {
    const [x, y] = pos;
    const neighbors: GridPosition[] = [];
    
    const directions: GridPosition[] = [
      [x, y - 1],     // North
      [x + 1, y],     // East
      [x, y + 1],     // South
      [x - 1, y]      // West
    ];

    for (const dir of directions) {
      if (this.isWalkable(dir)) {
        neighbors.push(dir);
      }
    }

    return neighbors;
  }

  /**
   * Manhattan distance heuristic
   */
  private heuristic(a: GridPosition, b: GridPosition): number {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  }

  /**
   * Reconstruct path from end node
   */
  private reconstructPath(endNode: { pos: GridPosition; parent: any | null }): GridPosition[] {
    const path: GridPosition[] = [];
    let current: any = endNode;
    
    while (current !== null) {
      path.unshift(current.pos);
      current = current.parent;
    }
    
    return path;
  }
}
