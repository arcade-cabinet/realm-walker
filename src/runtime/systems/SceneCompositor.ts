/**
 * SceneCompositor - First tier of compositor architecture
 * Builds room geometry and creates empty slots
 * Knows NOTHING about story or quest flags
 */

import * as THREE from 'three';
import { SceneData, SceneGeometry, ComposedScene, SceneTemplate, GridPosition } from '../../types';
import { GridSystemImpl } from './GridSystemImpl';

export class SceneCompositor {
  /**
   * Compose a scene from scene data (legacy)
   * Creates geometry and empty slot markers
   */
  compose(sceneData: SceneData): ComposedScene {
    // Create a basic grid system
    const gridSystem = new GridSystemImpl(10, 10, 1.0);
    const scene = new THREE.Scene();

    // Build geometry
    for (const geo of sceneData.geometry) {
      const mesh = this.createGeometry(geo);
      scene.add(mesh);
    }

    // Convert legacy slots to categorized slots
    const slots = {
      npcs: new Map<string, GridPosition>(),
      props: new Map<string, GridPosition>(),
      doors: new Map<string, GridPosition>()
    };

    // Categorize slots based on ID patterns (simple heuristic)
    for (const slot of sceneData.slots) {
      const gridPos: GridPosition = [
        Math.floor(slot.position[0]),
        Math.floor(slot.position[2])
      ];
      
      if (slot.id.includes('npc') || slot.id.includes('guide') || slot.id.includes('elder')) {
        slots.npcs.set(slot.id, gridPos);
      } else if (slot.id.includes('door') || slot.id.includes('exit') || slot.id.includes('portal')) {
        slots.doors.set(slot.id, gridPos);
      } else {
        slots.props.set(slot.id, gridPos);
      }
    }

    return { scene, gridSystem, slots };
  }

  /**
   * Compose a scene from scene template (new grid-based)
   */
  composeFromTemplate(template: SceneTemplate): ComposedScene {
    const scene = new THREE.Scene();
    const gridSystem = new GridSystemImpl(
      template.grid.width,
      template.grid.height,
      1.0
    );

    // Build floor
    const floorGeometry = new THREE.PlaneGeometry(
      template.grid.width,
      template.grid.height
    );
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc  // Default gray color
    });
    // TODO: Load actual texture from template.floor.texture
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Build walls (if defined)
    if (template.walls) {
      for (const wall of template.walls) {
        const wallMesh = this.createWall(wall, template.grid);
        scene.add(wallMesh);
      }
    }

    // Extract categorized slots
    const slots = {
      npcs: new Map<string, GridPosition>(),
      props: new Map<string, GridPosition>(),
      doors: new Map<string, GridPosition>()
    };

    if (template.slots.npcs) {
      template.slots.npcs.forEach(npc => {
        slots.npcs.set(npc.id, npc.position);
      });
    }

    if (template.slots.props) {
      template.slots.props.forEach(prop => {
        slots.props.set(prop.id, prop.position);
      });
    }

    if (template.slots.doors) {
      template.slots.doors.forEach(door => {
        slots.doors.set(door.id, door.position);
      });
    }

    return { scene, gridSystem, slots };
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
   * Create a wall mesh from wall definition
   */
  private createWall(wall: any, grid: { width: number; height: number }): THREE.Mesh {
    const height = wall.height || 3.0;
    let geometry: THREE.BoxGeometry;
    let position: [number, number, number];

    switch (wall.side) {
      case 'north':
        geometry = new THREE.BoxGeometry(grid.width, height, 0.5);
        position = [grid.width / 2, height / 2, 0];
        break;
      case 'south':
        geometry = new THREE.BoxGeometry(grid.width, height, 0.5);
        position = [grid.width / 2, height / 2, grid.height];
        break;
      case 'east':
        geometry = new THREE.BoxGeometry(0.5, height, grid.height);
        position = [grid.width, height / 2, grid.height / 2];
        break;
      case 'west':
        geometry = new THREE.BoxGeometry(0.5, height, grid.height);
        position = [0, height / 2, grid.height / 2];
        break;
      default:
        geometry = new THREE.BoxGeometry(1, height, 0.5);
        position = [0, height / 2, 0];
    }

    const material = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa  // Default gray color for walls
    });
    // TODO: Load actual texture from wall.texture

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);

    return mesh;
  }

  /**
   * Get all slot IDs from composed scene
   */
  getSlotIds(composed: ComposedScene): string[] {
    return [
      ...Array.from(composed.slots.npcs.keys()),
      ...Array.from(composed.slots.props.keys()),
      ...Array.from(composed.slots.doors.keys())
    ];
  }
}

