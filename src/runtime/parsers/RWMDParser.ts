/**
 * RWMD Parser - Parses Realm Walker Markup Description files to JSON
 * 
 * RWMD format is a simple text format for defining scenes:
 * 
 * @scene <id>
 * name: <scene name>
 * 
 * @geometry <type>
 * dimensions: <comma-separated numbers>
 * position: <x, y, z>
 * color: <hex color>
 * 
 * @slot <id>
 * position: <x, y, z>
 * rotation: <x, y, z> (optional)
 * scale: <x, y, z> (optional)
 */

import { ParsedScene, SceneData, SceneGeometry, SceneSlot } from '../../types';

export class RWMDParser {
  /**
   * Parse RWMD text content to JSON scene data
   */
  parse(content: string): ParsedScene {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    const scene: SceneData = {
      id: '',
      name: '',
      geometry: [],
      slots: []
    };

    const metadata: Record<string, any> = {};
    
    let currentSection: 'scene' | 'geometry' | 'slot' | null = null;
    let currentGeometry: Partial<SceneGeometry> | null = null;
    let currentSlot: Partial<SceneSlot> | null = null;

    for (const line of lines) {
      // Scene definition
      if (line.startsWith('@scene')) {
        currentSection = 'scene';
        scene.id = line.split(' ')[1] || 'default';
        continue;
      }

      // Geometry definition
      if (line.startsWith('@geometry')) {
        if (currentGeometry) {
          scene.geometry.push(currentGeometry as SceneGeometry);
        }
        currentSection = 'geometry';
        const type = line.split(' ')[1] as SceneGeometry['type'];
        currentGeometry = { type, dimensions: [], position: [0, 0, 0] };
        continue;
      }

      // Slot definition
      if (line.startsWith('@slot')) {
        if (currentGeometry) {
          scene.geometry.push(currentGeometry as SceneGeometry);
          currentGeometry = null;
        }
        if (currentSlot) {
          scene.slots.push(currentSlot as SceneSlot);
        }
        currentSection = 'slot';
        currentSlot = { id: line.split(' ')[1] || 'default', position: [0, 0, 0] };
        continue;
      }

      // Parse properties
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim());
        
        if (currentSection === 'scene') {
          if (key === 'name') {
            scene.name = value;
          } else {
            metadata[key] = value;
          }
        } else if (currentSection === 'geometry' && currentGeometry) {
          this.parseGeometryProperty(currentGeometry, key, value);
        } else if (currentSection === 'slot' && currentSlot) {
          this.parseSlotProperty(currentSlot, key, value);
        }
      }
    }

    // Add final items
    if (currentGeometry) {
      scene.geometry.push(currentGeometry as SceneGeometry);
    }
    if (currentSlot) {
      scene.slots.push(currentSlot as SceneSlot);
    }

    return {
      scene,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined
    };
  }

  private parseGeometryProperty(geometry: Partial<SceneGeometry>, key: string, value: string): void {
    if (key === 'dimensions') {
      geometry.dimensions = value.split(',').map(v => parseFloat(v.trim()));
    } else if (key === 'position') {
      geometry.position = value.split(',').map(v => parseFloat(v.trim())) as [number, number, number];
    } else if (key === 'color') {
      geometry.color = value;
    }
  }

  private parseSlotProperty(slot: Partial<SceneSlot>, key: string, value: string): void {
    if (key === 'position') {
      slot.position = value.split(',').map(v => parseFloat(v.trim())) as [number, number, number];
    } else if (key === 'rotation') {
      slot.rotation = value.split(',').map(v => parseFloat(v.trim())) as [number, number, number];
    } else if (key === 'scale') {
      slot.scale = value.split(',').map(v => parseFloat(v.trim())) as [number, number, number];
    }
  }

  /**
   * Parse RWMD file from string content
   */
  static parseString(content: string): ParsedScene {
    const parser = new RWMDParser();
    return parser.parse(content);
  }
}
