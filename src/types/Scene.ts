/**
 * Scene types - defines room geometry and empty slots
 * SceneCompositor uses these types (knows nothing about Story)
 */

import { WorldPosition } from './GridSystem';

export interface SceneSlot {
  id: string;
  position: WorldPosition;
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface SceneGeometry {
  type: 'box' | 'plane' | 'sphere' | 'cylinder';
  dimensions: number[];
  position: WorldPosition;
  color?: string;
}

export interface PropDefinition {
  id: string;
  anchor?: string;
  modelPath?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  interactive?: boolean;
}

export interface NPCDefinition {
  id: string;
  position: [number, number];
  dialogueId?: string;
  questId?: string;
  modelPath?: string;
}

export interface PortalDefinition {
  id: string;
  position: [number, number];
  target: string;
  requiresFlags?: string[];
  locked?: boolean;
  wall?: 'north' | 'south' | 'east' | 'west';
}

export interface LightingDefinition {
  ambient?: { color: string; intensity?: number };
  directional?: { color: string; direction: [number, number, number]; intensity?: number };
  points?: Array<{
    position: [number, number, number];
    color: string;
    intensity: number;
  }>;
}

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  line?: number;
}

export interface SceneData {
  id: string;
  name: string;
  geometry: SceneGeometry[];
  slots: SceneSlot[];
  // Enhanced RWMD properties
  props?: PropDefinition[];
  npcs?: NPCDefinition[];
  portals?: PortalDefinition[];
  lighting?: LightingDefinition;
  atmosphere?: string[];
}

export interface ParsedScene {
  scene: SceneData;
  metadata?: {
    version?: string;
    author?: string;
    grid?: { width: number; height: number };
    [key: string]: any;
  };
  validationErrors?: ValidationError[];
}

