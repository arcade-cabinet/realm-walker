/**
 * SceneCompositor - First tier of compositor architecture
 * Builds room geometry and creates empty slots
 * Knows NOTHING about story or quest flags
 */

import * as THREE from 'three';
import { SceneData, SceneGeometry, ComposedScene } from '../../types';

export class SceneCompositor {
  /**
   * Compose a scene from scene data
   * Creates geometry and empty slot markers
   */
  compose(sceneData: SceneData): ComposedScene {
    const geometry: THREE.Object3D[] = [];
    const slots = new Map<string, THREE.Object3D>();

    // Build geometry
    for (const geo of sceneData.geometry) {
      const mesh = this.createGeometry(geo);
      geometry.push(mesh);
    }

    // Create slot markers (empty Object3Ds for positioning)
    for (const slot of sceneData.slots) {
      const slotMarker = new THREE.Object3D();
      slotMarker.name = slot.id;
      slotMarker.position.set(...slot.position);
      
      if (slot.rotation) {
        slotMarker.rotation.set(...slot.rotation);
      }
      
      if (slot.scale) {
        slotMarker.scale.set(...slot.scale);
      }

      slots.set(slot.id, slotMarker);
    }

    return { geometry, slots };
  }

  /**
   * Create Three.js geometry from scene geometry definition
   */
  private createGeometry(geo: SceneGeometry): THREE.Mesh {
    let geometry: THREE.BufferGeometry;

    switch (geo.type) {
      case 'box':
        geometry = new THREE.BoxGeometry(...geo.dimensions);
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(geo.dimensions[0], geo.dimensions[1]);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(geo.dimensions[0], 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          geo.dimensions[0],
          geo.dimensions[1],
          geo.dimensions[2],
          32
        );
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshStandardMaterial({
      color: geo.color || '#cccccc'
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...geo.position);

    return mesh;
  }

  /**
   * Get all slot IDs from composed scene
   */
  getSlotIds(composed: ComposedScene): string[] {
    return Array.from(composed.slots.keys());
  }
}
