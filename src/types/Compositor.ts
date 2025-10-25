/**
 * Compositor types - defines the three-tier architecture interfaces
 */

import * as THREE from 'three';
import { SceneData, SceneSlot } from './Scene';
import { SlotContent, QuestFlags } from './Story';
import { GridSystem, GridPosition } from './GridSystem';

export interface ComposedScene {
  scene: THREE.Scene;  // ONLY geometry
  gridSystem: GridSystem;  // Walkability
  slots: {
    npcs: Map<string, GridPosition>;
    props: Map<string, GridPosition>;
    doors: Map<string, GridPosition>;
  };
}

export interface ComposedStory {
  room: ComposedScene;  // From SceneCompositor
  npcs: Map<string, {
    position: GridPosition;
    mesh: THREE.Group;
    dialogueId?: string;
    questId?: string;
  }>;
  props: Map<string, {
    position: GridPosition;
    mesh: THREE.Group;
    interactive: boolean;
  }>;
  doors: Map<string, {
    position: GridPosition;
    mesh: THREE.Group;
    target: string;
    locked: boolean;
  }>;
}

export interface GameViewport {
  camera: THREE.Camera;
  scene: THREE.Scene;
  renderer?: THREE.WebGLRenderer;
}
