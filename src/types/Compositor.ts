/**
 * Compositor types - defines the three-tier architecture interfaces
 */

import * as THREE from 'three';
import { SceneData, SceneSlot } from './Scene';
import { SlotContent, QuestFlags } from './Story';

export interface ComposedScene {
  geometry: THREE.Object3D[];
  slots: Map<string, THREE.Object3D>;
}

export interface ComposedStory {
  models: THREE.Object3D[];
  activeSlots: string[];
}

export interface GameViewport {
  camera: THREE.Camera;
  scene: THREE.Scene;
  renderer?: THREE.WebGLRenderer;
}
