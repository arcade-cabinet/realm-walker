/**
 * GridSystem types - Navigation and pathfinding for 2D tile grids
 */

export type GridPosition = [x: number, y: number];  // 2D tile coordinates
export type WorldPosition = [x: number, y: number, z: number];  // 3D world space

export interface GridSystem {
  width: number;
  height: number;
  walkable: boolean[][];  // 2D grid of walkable tiles
  tileSize: number;       // World units per tile
  
  // Pathfinding
  findPath(start: GridPosition, end: GridPosition): GridPosition[] | null;
  isWalkable(pos: GridPosition): boolean;
  worldToGrid(world: WorldPosition): GridPosition;
  gridToWorld(grid: GridPosition): WorldPosition;
}

export interface WallDef {
  side: 'north' | 'south' | 'east' | 'west';
  height: number;
  texture: string;
}
