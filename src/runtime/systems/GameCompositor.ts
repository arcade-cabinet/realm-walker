/**
 * GameCompositor - Third tier of compositor architecture
 * Frames diorama viewport and UI
 * Combines scene geometry, story content, and handles presentation
 */

import * as THREE from 'three';
import { ComposedScene, ComposedStory, SlotContent, GameViewport } from '../../types';
import { GLBLoader } from '../loaders/GLBLoader';

export interface RaycastResult {
  object: THREE.Object3D;
  point: THREE.Vector3;
  distance: number;
  slotId?: string;
}

export class GameCompositor {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private glbLoader: GLBLoader;
  private loadedModels: Map<string, THREE.Object3D>;
  private raycaster: THREE.Raycaster;
  private slotObjects: Map<string, THREE.Object3D>;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.glbLoader = new GLBLoader();
    this.loadedModels = new Map();
    this.raycaster = new THREE.Raycaster();
    this.slotObjects = new Map();

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
   * Frame the scene in a diorama-style view
   */
  frameDioramaView(gridWidth: number, gridHeight: number): void {
    // Calculate center of the grid
    const centerX = gridWidth / 2;
    const centerZ = gridHeight / 2;

    // Position camera for isometric-style diorama view
    const distance = Math.max(gridWidth, gridHeight) * 1.5;
    const height = distance * 0.7;

    this.camera.position.set(
      centerX + distance * 0.6,
      height,
      centerZ + distance * 0.8
    );

    this.camera.lookAt(centerX, 0, centerZ);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Perform raycasting to detect clicked objects
   */
  raycast(normalizedX: number, normalizedY: number): RaycastResult | null {
    // Update raycaster with camera and mouse position
    const mouse = new THREE.Vector2(normalizedX, normalizedY);
    this.raycaster.setFromCamera(mouse, this.camera);

    // Find intersections
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      
      // Try to find slot ID for this object
      let slotId: string | undefined;
      for (const [id, obj] of this.slotObjects.entries()) {
        if (obj === intersection.object || obj.children.includes(intersection.object as any)) {
          slotId = id;
          break;
        }
      }

      return {
        object: intersection.object,
        point: intersection.point,
        distance: intersection.distance,
        slotId
      };
    }

    return null;
  }

  /**
   * Get clickable objects (for hover effects)
   */
  getClickableObjects(): THREE.Object3D[] {
    return Array.from(this.slotObjects.values());
  }

  /**
   * Add hover effect to an object
   */
  addHoverEffect(object: THREE.Object3D, hovered: boolean): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (hovered) {
          // Add emissive glow
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.setHex(0x444444);
            child.material.emissiveIntensity = 0.3;
          }
        } else {
          // Remove glow
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.setHex(0x000000);
            child.material.emissiveIntensity = 0;
          }
        }
      }
    });
  }

  /**
   * Compose from ComposedStory (new interface)
   * NOTE: This method is deprecated and violates layer separation.
   * StoryCompositor should not create Three.js meshes.
   * Use compose(composedScene, activeContent) instead.
   * 
   * @deprecated
   */
  async composeStory(story: ComposedStory): Promise<GameViewport> {
    throw new Error('composeStory() is deprecated. Use compose(composedScene, activeContent) instead. ' +
                    'StoryCompositor should not create Three.js objects - this violates layer separation.');
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

    // Frame the diorama view
    this.frameDioramaView(composedScene.gridSystem.width, composedScene.gridSystem.height);

    this.loadedModels.clear();
    this.slotObjects.clear();

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
        } else {
          // Set default scale if not provided
          model.scale.set(1, 1, 1);
        }

        // Add user data for identification
        model.userData.slotId = content.slotId;

        this.scene.add(model);
        this.loadedModels.set(content.slotId, model);
        this.slotObjects.set(content.slotId, model);
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
