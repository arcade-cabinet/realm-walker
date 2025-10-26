/**
 * YukaGridSystem - Enhanced GridSystem using Yuka.js for pathfinding
 * Provides superior pathfinding performance using Yuka's AStar and NavMesh
 */

// @ts-ignore - Yuka doesn't have official types
import { AStar, Graph, NavNode, Edge, NavMesh } from 'yuka';
import { GridSystem, GridPosition, WorldPosition } from '../../types/GridSystem';

// Type definitions for Yuka components we use
interface YukaGraphNode {
  index: number;
}

interface YukaVector3 {
  x: number;
  y: number;
  z: number;
}

export class YukaGridSystem implements GridSystem {
  width: number;
  height: number;
  walkable: boolean[][];
  tileSize: number;

  private graph: Graph;
  private astar: AStar;
  private navMesh?: NavMesh;
  private useNavMesh: boolean;

  constructor(width: number, height: number, tileSize: number = 1.0, useNavMesh: boolean = false) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.useNavMesh = useNavMesh;
    
    // Initialize all tiles as walkable
    this.walkable = Array.from({ length: height }, () => 
      Array.from({ length: width }, () => true)
    );

    // Initialize Yuka graph for pathfinding
    this.graph = new Graph();
    this.astar = new AStar();
    
    this.rebuildGraph();
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
   * Set walkability of a tile and rebuild graph
   */
  setWalkable(pos: GridPosition, walkable: boolean): void {
    const [x, y] = pos;
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.walkable[y][x] = walkable;
      this.rebuildGraph();
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
   * Find path using Yuka's A* algorithm
   * More efficient than custom implementation
   */
  findPath(start: GridPosition, end: GridPosition): GridPosition[] | null {
    if (!this.isWalkable(start) || !this.isWalkable(end)) {
      return null;
    }

    // Use NavMesh if available (better for complex geometry)
    if (this.useNavMesh && this.navMesh) {
      return this.findPathNavMesh(start, end);
    }

    // Use Yuka A* for grid-based pathfinding
    const startNodeId = this.posToNodeId(start);
    const endNodeId = this.posToNodeId(end);

    const startNode = this.graph.getNode(startNodeId);
    const endNode = this.graph.getNode(endNodeId);

    if (!startNode || !endNode) {
      return null;
    }

    // Find path using Yuka's optimized A*
    this.astar = new (AStar as any)(this.graph, startNodeId, endNodeId);
    this.astar.search();

    if (!this.astar.found) {
      return null;
    }

    // Get the path (array of node IDs)
    const path = this.astar.getPath();

    // Convert node IDs back to grid positions
    return path.map((nodeId: number) => this.nodeIdToPos(nodeId));
  }

  /**
   * Find path using NavMesh (for complex 3D geometry)
   */
  private findPathNavMesh(start: GridPosition, end: GridPosition): GridPosition[] | null {
    if (!this.navMesh) {
      return null;
    }

    // Convert grid positions to world positions for NavMesh
    const startWorld = this.gridToWorld(start);
    const endWorld = this.gridToWorld(end);

    // Create Vector3-like objects for Yuka
    const from = { x: startWorld[0], y: startWorld[1], z: startWorld[2] };
    const to = { x: endWorld[0], y: endWorld[1], z: endWorld[2] };

    // Find path on NavMesh
    const path = this.navMesh.findPath(from, to);

    if (!path || path.length === 0) {
      return null;
    }

    // Convert world positions back to grid positions
    return path.map((point: YukaVector3) => 
      this.worldToGrid([point.x, point.y, point.z])
    );
  }

  /**
   * Rebuild the Yuka graph from walkability data
   */
  private rebuildGraph(): void {
    this.graph.clear();

    // Create nodes for walkable tiles
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.walkable[y][x]) {
          const nodeId = this.posToNodeId([x, y]);
          const node = new (NavNode as any)(nodeId);
          this.graph.addNode(node);
        }
      }
    }

    // Create edges between adjacent walkable tiles
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.walkable[y][x]) continue;

        const nodeId = this.posToNodeId([x, y]);

        // Check 4 cardinal directions
        const neighbors: GridPosition[] = [
          [x, y - 1],  // North
          [x + 1, y],  // East
          [x, y + 1],  // South
          [x - 1, y]   // West
        ];

        for (const [nx, ny] of neighbors) {
          if (this.isWalkable([nx, ny])) {
            const neighborId = this.posToNodeId([nx, ny]);
            // Cost of 1 for cardinal movement
            const edge = new (Edge as any)(nodeId, neighborId, 1);
            this.graph.addEdge(edge);
          }
        }

        // Optional: Add diagonal movement (cost sqrt(2) ≈ 1.414)
        const diagonals: GridPosition[] = [
          [x - 1, y - 1],  // NW
          [x + 1, y - 1],  // NE
          [x + 1, y + 1],  // SE
          [x - 1, y + 1]   // SW
        ];

        for (const [nx, ny] of diagonals) {
          if (this.isWalkable([nx, ny])) {
            // Check that both adjacent tiles are also walkable (no corner cutting)
            const dx = nx - x;
            const dy = ny - y;
            if (this.isWalkable([x + dx, y]) && this.isWalkable([x, y + dy])) {
              const neighborId = this.posToNodeId([nx, ny]);
              const edge = new (Edge as any)(nodeId, neighborId, 1.414);
              this.graph.addEdge(edge);
            }
          }
        }
      }
    }
  }

  /**
   * Convert grid position to unique node ID
   */
  private posToNodeId(pos: GridPosition): number {
    return pos[1] * this.width + pos[0];
  }

  /**
   * Convert node ID back to grid position
   */
  private nodeIdToPos(nodeId: number): GridPosition {
    const x = nodeId % this.width;
    const y = Math.floor(nodeId / this.width);
    return [x, y];
  }

  /**
   * Enable NavMesh pathfinding for complex geometry
   * Call this after building the scene if needed
   */
  enableNavMesh(navMesh: NavMesh): void {
    this.navMesh = navMesh;
    this.useNavMesh = true;
  }

  /**
   * Disable NavMesh and use grid-based pathfinding
   */
  disableNavMesh(): void {
    this.useNavMesh = false;
  }

  /**
   * Get the underlying Yuka graph for advanced usage
   */
  getGraph(): Graph {
    return this.graph;
  }

  /**
   * Get statistics about the pathfinding graph
   */
  getStats(): { nodes: number; edges: number; walkableTiles: number } {
    const nodes = this.graph.getNodeCount();
    const edges = this.graph.getEdgeCount();
    const walkableTiles = this.walkable.flat().filter(w => w).length;

    return { nodes, edges, walkableTiles };
  }
}
