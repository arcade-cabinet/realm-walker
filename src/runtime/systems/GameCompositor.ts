/**
 * GameCompositor - Third tier of compositor architecture
 * Frames diorama viewport and UI
 * Combines scene geometry, story content, and handles presentation
 */

import * as THREE from 'three';
import { ComposedScene, SlotContent, GameViewport } from '../../types';
import { GLBLoader } from '../loaders/GLBLoader';

export class GameCompositor {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private glbLoader: GLBLoader;
  private loadedModels: Map<string, THREE.Object3D>;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.glbLoader = new GLBLoader();
    this.loadedModels = new Map();

    // Setup basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);

    // Default camera position
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Compose the final game viewport
   * Combines scene geometry and story content
   */
  async compose(composedScene: ComposedScene, activeContent: SlotContent[]): Promise<GameViewport> {
    // Clear previous scene content (keep lights)
    const objectsToRemove = this.scene.children.filter(
      child => !(child instanceof THREE.Light)
    );
    objectsToRemove.forEach(obj => this.scene.remove(obj));
    this.loadedModels.clear();

    // Add scene geometry
    for (const geo of composedScene.geometry) {
      this.scene.add(geo);
    }

    // Add slot markers to scene for reference
    for (const [slotId, slotMarker] of composedScene.slots) {
      this.scene.add(slotMarker);
    }

    // Load and add content to slots
    for (const content of activeContent) {
      const slot = composedScene.slots.get(content.slotId);
      if (!slot) {
        console.warn(`Slot ${content.slotId} not found in scene`);
        continue;
      }

      try {
        const model = await this.glbLoader.load(content.modelPath);
        
        // Apply content-specific transforms or use slot transforms
        if (content.position) {
          model.position.set(...content.position);
        } else {
          model.position.copy(slot.position);
        }

        if (content.rotation) {
          model.rotation.set(...content.rotation);
        } else {
          model.rotation.copy(slot.rotation);
        }

        if (content.scale) {
          model.scale.set(...content.scale);
        } else {
          model.scale.copy(slot.scale);
        }

        this.scene.add(model);
        this.loadedModels.set(content.slotId, model);
      } catch (error) {
        console.error(`Failed to load model for slot ${content.slotId}:`, error);
      }
    }

    return {
      camera: this.camera,
      scene: this.scene
    };
  }

  /**
   * Update camera aspect ratio
   */
  updateAspect(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Set camera position
   */
  setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }

  /**
   * Set camera look-at target
   */
  setCameraTarget(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z);
  }

  /**
   * Get the Three.js scene
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get the camera
   */
  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  /**
   * Get loaded models
   */
  getLoadedModels(): Map<string, THREE.Object3D> {
    return this.loadedModels;
  }
}
