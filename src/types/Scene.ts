/**
 * Scene types - defines room geometry and empty slots
 * SceneCompositor uses these types (knows nothing about Story)
 */

export interface SceneSlot {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface SceneGeometry {
  type: 'box' | 'plane' | 'sphere' | 'cylinder';
  dimensions: number[];
  position: [number, number, number];
  color?: string;
}

export interface SceneData {
  id: string;
  name: string;
  geometry: SceneGeometry[];
  slots: SceneSlot[];
}

export interface ParsedScene {
  scene: SceneData;
  metadata?: {
    version?: string;
    author?: string;
    [key: string]: any;
  };
}
