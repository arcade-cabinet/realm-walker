/**
 * GameCompositor - Third tier of compositor architecture
 * Frames diorama viewport and UI
 * Combines scene geometry, story content, and handles presentation
 */

import * as THREE from 'three';
import { ComposedScene, ComposedStory, SlotContent, GameViewport } from '../../types';
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

    // Default camera position (diorama angle)
    this.camera.position.set(12, 15, 20);
    this.camera.lookAt(12, 0, 8);
  }

  /**
   * Compose from ComposedStory (new interface)
   */
  async composeStory(story: ComposedStory): Promise<GameViewport> {
    // Use the scene from the story
    this.scene = story.room.scene;

    // Add lighting if not present
    if (!this.scene.children.some(child => child instanceof THREE.Light)) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      this.scene.add(directionalLight);
    }

    // NPCs, props, and doors are already in the story with their meshes
    // Just add them to the scene
    for (const [id, npc] of story.npcs) {
      this.scene.add(npc.mesh);
    }

    for (const [id, prop] of story.props) {
      this.scene.add(prop.mesh);
    }

    for (const [id, door] of story.doors) {
      this.scene.add(door.mesh);
    }

    return {
      camera: this.camera,
      scene: this.scene
    };
  }

  /**
   * Compose the final game viewport (legacy interface)
   * Combines scene geometry and story content
   */
  async compose(composedScene: ComposedScene, activeContent: SlotContent[]): Promise<GameViewport> {
    // Use the scene from composedScene
    this.scene = composedScene.scene;

    // Add lighting if not present
    if (!this.scene.children.some(child => child instanceof THREE.Light)) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 5);
      this.scene.add(directionalLight);
    }

    this.loadedModels.clear();

    // Load and add content to slots
    for (const content of activeContent) {
      // Find the slot in the appropriate category
      const gridPos = composedScene.slots.npcs.get(content.slotId) ||
                      composedScene.slots.props.get(content.slotId) ||
                      composedScene.slots.doors.get(content.slotId);

      if (!gridPos) {
        console.warn(`Slot ${content.slotId} not found in scene`);
        continue;
      }

      try {
        const model = await this.glbLoader.load(content.modelPath);
        
        // Convert grid position to world position
        const worldPos = composedScene.gridSystem.gridToWorld(gridPos);
        
        // Apply content-specific transforms or use calculated position
        if (content.position) {
          model.position.set(...content.position);
        } else {
          model.position.set(...worldPos);
        }

        if (content.rotation) {
          model.rotation.set(...content.rotation);
        }

        if (content.scale) {
          model.scale.set(...content.scale);
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
