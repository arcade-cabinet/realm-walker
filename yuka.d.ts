/**
 * Type declarations for Yuka.js
 * https://github.com/Mugen87/yuka
 */

declare module 'yuka' {
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    clone(): Vector3;
    copy(v: Vector3): this;
    add(v: Vector3): this;
    subtract(v: Vector3): this;
    multiply(v: Vector3): this;
    distanceTo(v: Vector3): number;
    length(): number;
    normalize(): this;
  }

  export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    
    constructor(x?: number, y?: number, z?: number, w?: number);
  }

  export class Node {
    index: number;
    constructor(index: number);
  }

  export class Edge {
    from: number;
    to: number;
    cost: number;
    
    constructor(from: number, to: number, cost: number);
    clone(): Edge;
  }

  export class Graph {
    constructor();
    addNode(node: Node): this;
    addEdge(edge: Edge): this;
    getNode(nodeIndex: number): Node | null;
    getNodeCount(): number;
    getEdgeCount(): number;
    clear(): this;
  }

  export class AStar {
    graph: Graph | null;
    source: number;
    target: number;
    found: boolean;
    heuristic: { calculate(graph: Graph, source: number, target: number): number };
    
    constructor(graph?: Graph | null, source?: number, target?: number);
    search(): this;
    getPath(): number[];
    clear(): this;
  }

  export class NavMesh {
    constructor();
    fromPolygons(polygons: any[]): this;
    findPath(from: { x: number; y: number; z: number }, to: { x: number; y: number; z: number }): Array<{ x: number; y: number; z: number }> | null;
  }

  export class Path {
    loop: boolean;
    
    constructor();
    add(waypoint: Vector3): this;
    clear(): this;
  }

  export class GameEntity {
    position: Vector3;
    rotation: Quaternion;
    velocity: Vector3;
    boundingRadius: number;
    
    constructor();
    update(delta: number): this;
  }

  export class Vehicle extends GameEntity {
    maxSpeed: number;
    maxForce: number;
    mass: number;
    steering: SteeringManager;
    updateOrientation: boolean;
    
    constructor();
  }

  export class SteeringManager {
    behaviors: SteeringBehavior[];
    
    constructor(vehicle: Vehicle);
    add(behavior: SteeringBehavior): this;
    remove(behavior: SteeringBehavior): this;
    clear(): this;
  }

  export class SteeringBehavior {
    active: boolean;
    weight: number;
    
    constructor();
    calculate(vehicle: Vehicle, force: Vector3, delta: number): Vector3;
  }

  export class SeekBehavior extends SteeringBehavior {
    constructor(target: Vector3);
  }

  export class FleeBehavior extends SteeringBehavior {
    panicDistance: number;
    
    constructor(target: Vector3);
  }

  export class WanderBehavior extends SteeringBehavior {
    radius: number;
    distance: number;
    jitter: number;
    
    constructor();
  }

  export class ObstacleAvoidanceBehavior extends SteeringBehavior {
    constructor(obstacles: GameEntity[]);
  }

  export class FollowPathBehavior extends SteeringBehavior {
    constructor(path: Path);
  }

  export class PursuitBehavior extends SteeringBehavior {
    constructor(vehicle: Vehicle);
  }

  export class EvadeBehavior extends SteeringBehavior {
    constructor(vehicle: Vehicle);
  }

  export class EntityManager {
    entities: GameEntity[];
    
    constructor();
    add(entity: GameEntity): this;
    remove(entity: GameEntity): this;
    clear(): this;
    update(delta: number): this;
  }

  export class State {
    enter(owner: any): void;
    execute(owner: any): void;
    exit(owner: any): void;
  }

  export class StateMachine<T = any> {
    owner: T;
    currentState: State | null;
    previousState: State | null;
    
    constructor(owner: T);
    add(name: string, state: State): this;
    remove(name: string): this;
    changeTo(name: string): this;
    update(): this;
  }
}
