/**
 * SceneDefinition types - Enhanced scene structure with grid-based layout
 */

import { GridPosition, WallDef } from './GridSystem';

export interface SceneTemplate {
  id: string;
  grid: { width: number; height: number };
  floor: { texture: string };
  walls?: WallDef[];
  ceiling?: { texture: string; height: number };
  slots: {
    npcs?: { id: string; position: GridPosition }[];
    props?: { id: string; position: GridPosition }[];
    doors?: { id: string; position: GridPosition; wall: string }[];
  };
}

export interface InteractionPoint {
  id: string;
  type: 'dialogue' | 'examine' | 'use' | 'portal';
  position: GridPosition;
  radius: number;  // Click detection radius
  
  // Gating
  requiresFlags?: string[];
  
  // Metadata
  dialogueId?: string;
  targetScene?: string;
  description?: string;
}
