/**
 * GLB Loader - Loads GLB models using Three.js GLTFLoader
 * Provides a simplified interface for loading 3D models
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GLBLoader {
  private loader: GLTFLoader;
  private cache: Map<string, THREE.Object3D>;

  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
  }

  /**
   * Load a GLB model from a path
   */
  async load(path: string): Promise<THREE.Object3D> {
    // Check cache first
    if (this.cache.has(path)) {
      const cached = this.cache.get(path)!;
      return cached.clone();
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          this.cache.set(path, model);
          resolve(model.clone());
        },
        undefined,
        (error) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          reject(new Error(`Failed to load GLB model from ${path}: ${errorMessage}`));
        }
      );
    });
  }

  /**
   * Preload multiple models
   */
  async preload(paths: string[]): Promise<void> {
    await Promise.all(paths.map(path => this.load(path)));
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
