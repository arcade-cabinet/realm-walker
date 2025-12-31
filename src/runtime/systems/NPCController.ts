/**
 * NPCController - AI controller using Yuka.js steering behaviors
 * Provides intelligent NPC movement and behavior based on quest state
 */

import {
  Vehicle,
  EntityManager,
  SteeringBehavior,
  SeekBehavior,
  FleeBehavior,
  WanderBehavior,
  ObstacleAvoidanceBehavior,
  FollowPathBehavior,
  Path,
  Vector3,
  StateMachine,
  State
} from 'yuka';
import { QuestState, GridPosition, WorldPosition } from '../../types';
import * as THREE from 'three';

export interface NPCConfig {
  id: string;
  position: WorldPosition;
  maxSpeed?: number;
  maxForce?: number;
  wanderRadius?: number;
  detectionRadius?: number;
}

export interface NPCBehaviorState {
  type: 'idle' | 'wander' | 'patrol' | 'seek' | 'flee' | 'interact';
  target?: WorldPosition;
  path?: WorldPosition[];
  duration?: number;
}

/**
 * Idle state - NPC does nothing
 */
class IdleState extends State {
  enter(npc: NPCController): void {
    npc.vehicle.maxSpeed = 0;
  }

  execute(npc: NPCController): void {
    // Just stand there
  }
}

/**
 * Wander state - NPC moves randomly
 */
class WanderState extends State {
  private wanderBehavior?: WanderBehavior;

  enter(npc: NPCController): void {
    this.wanderBehavior = new WanderBehavior();
    this.wanderBehavior.radius = npc.wanderRadius;
    this.wanderBehavior.distance = 3;
    this.wanderBehavior.jitter = 1;
    
    npc.vehicle.steering.clear();
    npc.vehicle.steering.add(this.wanderBehavior);
    npc.vehicle.maxSpeed = npc.maxSpeed * 0.3; // Slow wandering
  }

  execute(npc: NPCController): void {
    // Wander behavior handles movement
  }

  exit(npc: NPCController): void {
    if (this.wanderBehavior) {
      npc.vehicle.steering.remove(this.wanderBehavior);
    }
  }
}

/**
 * Seek state - NPC moves toward target
 */
class SeekState extends State {
  private seekBehavior?: SeekBehavior;
  private target?: Vector3;

  enter(npc: NPCController): void {
    if (npc.behaviorState.target) {
      this.target = new Vector3(...npc.behaviorState.target);
      this.seekBehavior = new SeekBehavior(this.target);
      
      npc.vehicle.steering.clear();
      npc.vehicle.steering.add(this.seekBehavior);
      npc.vehicle.maxSpeed = npc.maxSpeed;
    }
  }

  execute(npc: NPCController): void {
    // Check if reached target
    if (this.target) {
      const distance = npc.vehicle.position.distanceTo(this.target);
      if (distance < 1.0) {
        // Reached target, switch to idle
        npc.stateMachine.changeTo('idle');
      }
    }
  }

  exit(npc: NPCController): void {
    if (this.seekBehavior) {
      npc.vehicle.steering.remove(this.seekBehavior);
    }
  }
}

/**
 * Flee state - NPC moves away from target
 */
class FleeState extends State {
  private fleeBehavior?: FleeBehavior;
  private target?: Vector3;
  private fleeDistance: number = 10;

  enter(npc: NPCController): void {
    if (npc.behaviorState.target) {
      this.target = new Vector3(...npc.behaviorState.target);
      this.fleeBehavior = new FleeBehavior(this.target);
      this.fleeBehavior.panicDistance = this.fleeDistance;
      
      npc.vehicle.steering.clear();
      npc.vehicle.steering.add(this.fleeBehavior);
      npc.vehicle.maxSpeed = npc.maxSpeed * 1.5; // Fast fleeing
    }
  }

  execute(npc: NPCController): void {
    // Check if far enough
    if (this.target) {
      const distance = npc.vehicle.position.distanceTo(this.target);
      if (distance > this.fleeDistance) {
        // Safe distance reached, switch to idle or wander
        npc.stateMachine.changeTo('wander');
      }
    }
  }

  exit(npc: NPCController): void {
    if (this.fleeBehavior) {
      npc.vehicle.steering.remove(this.fleeBehavior);
    }
  }
}

/**
 * Patrol state - NPC follows a predefined path
 */
class PatrolState extends State {
  private followPathBehavior?: FollowPathBehavior;
  private path?: Path;

  enter(npc: NPCController): void {
    if (npc.behaviorState.path && npc.behaviorState.path.length > 0) {
      this.path = new Path();
      
      // Add waypoints to path
      for (const waypoint of npc.behaviorState.path) {
        this.path.add(new Vector3(...waypoint));
      }
      
      // Make path loop
      this.path.loop = true;
      
      this.followPathBehavior = new FollowPathBehavior(this.path);
      
      npc.vehicle.steering.clear();
      npc.vehicle.steering.add(this.followPathBehavior);
      npc.vehicle.maxSpeed = npc.maxSpeed * 0.5; // Moderate patrol speed
    }
  }

  execute(npc: NPCController): void {
    // Path following is automatic
  }

  exit(npc: NPCController): void {
    if (this.followPathBehavior) {
      npc.vehicle.steering.remove(this.followPathBehavior);
    }
  }
}

/**
 * NPCController - Manages a single NPC's AI using Yuka
 */
export class NPCController {
  id: string;
  vehicle: Vehicle;
  stateMachine: StateMachine<NPCController>;
  behaviorState: NPCBehaviorState;
  
  maxSpeed: number;
  maxForce: number;
  wanderRadius: number;
  detectionRadius: number;
  
  mesh?: THREE.Object3D;

  constructor(config: NPCConfig, entityManager: EntityManager) {
    this.id = config.id;
    this.maxSpeed = config.maxSpeed || 2.0;
    this.maxForce = config.maxForce || 1.0;
    this.wanderRadius = config.wanderRadius || 5.0;
    this.detectionRadius = config.detectionRadius || 8.0;

    // Create Yuka vehicle
    this.vehicle = new Vehicle();
    this.vehicle.position.set(...config.position);
    this.vehicle.maxSpeed = this.maxSpeed;
    this.vehicle.maxForce = this.maxForce;
    this.vehicle.updateOrientation = true;

    // Add to entity manager
    entityManager.add(this.vehicle);

    // Setup state machine
    this.stateMachine = new StateMachine(this);
    this.stateMachine.add('idle', new IdleState());
    this.stateMachine.add('wander', new WanderState());
    this.stateMachine.add('seek', new SeekState());
    this.stateMachine.add('flee', new FleeState());
    this.stateMachine.add('patrol', new PatrolState());

    // Start in idle state
    this.behaviorState = { type: 'idle' };
    this.stateMachine.changeTo('idle');
  }

  /**
   * Update NPC based on quest state
   * Quest flags influence behavior selection
   */
  updateBehavior(questState: QuestState, playerPosition?: WorldPosition): void {
    const flagPrefix = `npc_${this.id}_`;
    
    // Check quest flags for this NPC
    if (questState.storyFlags[`${flagPrefix}hostile`]) {
      // Hostile - seek player
      if (playerPosition) {
        this.setBehavior({ type: 'seek', target: playerPosition });
      }
    } else if (questState.storyFlags[`${flagPrefix}afraid`]) {
      // Afraid - flee from player
      if (playerPosition) {
        this.setBehavior({ type: 'flee', target: playerPosition });
      }
    } else if (questState.storyFlags[`${flagPrefix}patrol`]) {
      // Patrolling - follow patrol path
      // Path would be defined in story binding
      const patrolPath = this.getPatrolPath(questState);
      if (patrolPath) {
        this.setBehavior({ type: 'patrol', path: patrolPath });
      } else {
        this.setBehavior({ type: 'wander' });
      }
    } else if (questState.storyFlags[`${flagPrefix}active`]) {
      // Active but not hostile - wander around
      this.setBehavior({ type: 'wander' });
    } else {
      // Default - idle
      this.setBehavior({ type: 'idle' });
    }
  }

  /**
   * Set NPC behavior directly
   */
  setBehavior(state: NPCBehaviorState): void {
    // Only change if different
    if (this.behaviorState.type !== state.type) {
      this.behaviorState = state;
      this.stateMachine.changeTo(state.type);
    } else if (state.target) {
      // Update target if same state but new target
      this.behaviorState.target = state.target;
      // Re-enter state to update target
      this.stateMachine.changeTo(state.type);
    }
  }

  /**
   * Update NPC (called each frame)
   */
  update(delta: number): void {
    // Update state machine
    this.stateMachine.update();
    
    // Sync Three.js mesh with Yuka vehicle position
    if (this.mesh) {
      this.mesh.position.set(
        this.vehicle.position.x,
        this.vehicle.position.y,
        this.vehicle.position.z
      );
      
      // Update rotation to face movement direction
      if (this.vehicle.velocity.length() > 0.1) {
        const forward = this.vehicle.velocity.clone().normalize();
        const angle = Math.atan2(forward.x, forward.z);
        this.mesh.rotation.y = angle;
      }
    }
  }

  /**
   * Attach Three.js mesh to this NPC
   */
  setMesh(mesh: THREE.Object3D): void {
    this.mesh = mesh;
    mesh.position.set(
      this.vehicle.position.x,
      this.vehicle.position.y,
      this.vehicle.position.z
    );
  }

  /**
   * Get current position as WorldPosition
   */
  getPosition(): WorldPosition {
    return [
      this.vehicle.position.x,
      this.vehicle.position.y,
      this.vehicle.position.z
    ];
  }

  /**
   * Set position
   */
  setPosition(position: WorldPosition): void {
    this.vehicle.position.set(...position);
    if (this.mesh) {
      this.mesh.position.set(...position);
    }
  }

  /**
   * Get patrol path from quest state
   * This would be defined in story bindings
   */
  private getPatrolPath(questState: QuestState): WorldPosition[] | undefined {
    // In a real implementation, this would read from story bindings
    // For now, return undefined
    return undefined;
  }

  /**
   * Cleanup
   */
  dispose(entityManager: EntityManager): void {
    entityManager.remove(this.vehicle);
  }
}

/**
 * NPCManager - Manages all NPCs in a scene
 */
export class NPCManager {
  private entityManager: EntityManager;
  private npcs: Map<string, NPCController>;

  constructor() {
    this.entityManager = new EntityManager();
    this.npcs = new Map();
  }

  /**
   * Create an NPC
   */
  createNPC(config: NPCConfig): NPCController {
    const npc = new NPCController(config, this.entityManager);
    this.npcs.set(config.id, npc);
    return npc;
  }

  /**
   * Remove an NPC
   */
  removeNPC(id: string): void {
    const npc = this.npcs.get(id);
    if (npc) {
      npc.dispose(this.entityManager);
      this.npcs.delete(id);
    }
  }

  /**
   * Get NPC by ID
   */
  getNPC(id: string): NPCController | undefined {
    return this.npcs.get(id);
  }

  /**
   * Update all NPCs
   */
  update(delta: number, questState: QuestState, playerPosition?: WorldPosition): void {
    // Update all NPC behaviors based on quest state
    for (const npc of this.npcs.values()) {
      npc.updateBehavior(questState, playerPosition);
      npc.update(delta);
    }
    
    // Update Yuka entity manager (steering calculations)
    this.entityManager.update(delta);
  }

  /**
   * Get all NPCs
   */
  getAllNPCs(): NPCController[] {
    return Array.from(this.npcs.values());
  }

  /**
   * Clear all NPCs
   */
  clear(): void {
    for (const npc of this.npcs.values()) {
      npc.dispose(this.entityManager);
    }
    this.npcs.clear();
  }
}
