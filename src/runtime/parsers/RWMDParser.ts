/**
 * Enhanced RWMD Parser - Parses Realm Walker Markup Description files to JSON
 * 
 * Supports advanced RWMD syntax with:
 * - Anchor resolution (@props/fountain → assets/models/props/fountain.glb)
 * - Inline position/rotation/scale syntax: pos:(x,y,z) rot:(rx,ry,rz) scale:(sx,sy,sz)
 * - NPC definitions with dialogue and quest IDs
 * - Portal definitions with target scenes and required flags
 * - Lighting setup (ambient, directional, point lights)
 * - Comprehensive validation
 */

import { 
  ParsedScene, 
  SceneData, 
  SceneGeometry, 
  SceneSlot,
  PropDefinition,
  NPCDefinition,
  PortalDefinition,
  LightingDefinition,
  ValidationError
} from '../../types';
import * as path from 'path';

export interface AnchorMap {
  [key: string]: string;
}

const DEFAULT_ANCHOR_MAP: AnchorMap = {
  '@props/': 'assets/models/props/',
  '@architecture/': 'assets/models/architecture/',
  '@npcs/': 'assets/models/npcs/',
  '@textures/': 'assets/textures/',
  '@environments/': 'assets/models/environments/'
};

export class RWMDParser {
  private anchorMap: AnchorMap;
  private validationErrors: ValidationError[] = [];

  constructor(customAnchorMap?: AnchorMap) {
    this.anchorMap = { ...DEFAULT_ANCHOR_MAP, ...customAnchorMap };
  }

  /**
   * Parse RWMD text content to JSON scene data with enhanced features
   */
  parse(content: string): ParsedScene {
    this.validationErrors = [];
    const lines = content.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    
    const scene: SceneData = {
      id: '',
      name: '',
      geometry: [],
      slots: [],
      props: [],
      npcs: [],
      portals: [],
      lighting: {},
      atmosphere: []
    };

    const metadata: Record<string, any> = {
      grid: { width: 10, height: 10 } // Default grid size
    };
    
    let currentSection: 'scene' | 'geometry' | 'slot' | 'props' | 'npcs' | 'portals' | 'lighting' | null = null;
    let currentGeometry: Partial<SceneGeometry> | null = null;
    let currentSlot: Partial<SceneSlot> | null = null;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;

      // Scene definition
      if (line.startsWith('scene:')) {
        currentSection = 'scene';
        scene.id = line.substring(6).trim();
        continue;
      }

      // Old-style scene definition (backward compatibility)
      if (line.startsWith('@scene')) {
        currentSection = 'scene';
        scene.id = line.split(' ')[1] || 'default';
        continue;
      }

      // Section headers
      if (line === 'props:' || line === 'props') {
        currentSection = 'props';
        continue;
      }
      if (line === 'npcs:' || line === 'npcs') {
        currentSection = 'npcs';
        continue;
      }
      if (line === 'portals:' || line === 'portals') {
        currentSection = 'portals';
        continue;
      }
      if (line === 'lighting:' || line === 'lighting') {
        currentSection = 'lighting';
        continue;
      }

      // Geometry definition (backward compatibility)
      if (line.startsWith('@geometry')) {
        if (currentGeometry) {
          scene.geometry.push(currentGeometry as SceneGeometry);
        }
        currentSection = 'geometry';
        const type = line.split(' ')[1] as SceneGeometry['type'];
        currentGeometry = { type, dimensions: [], position: [0, 0, 0] };
        continue;
      }

      // Slot definition (backward compatibility)
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

      // Parse list items (props, npcs, portals)
      if (line.startsWith('-') || line.startsWith('*')) {
        const content = line.substring(1).trim();
        
        if (currentSection === 'props') {
          try {
            const prop = this.parsePropLine(content);
            scene.props!.push(prop);
          } catch (error) {
            this.addError(`Invalid prop definition: ${error instanceof Error ? error.message : String(error)}`, lineNumber);
          }
        } else if (currentSection === 'npcs') {
          try {
            const npc = this.parseNPCLine(content);
            scene.npcs!.push(npc);
          } catch (error) {
            this.addError(`Invalid NPC definition: ${error instanceof Error ? error.message : String(error)}`, lineNumber);
          }
        } else if (currentSection === 'portals') {
          try {
            const portal = this.parsePortalLine(content);
            scene.portals!.push(portal);
          } catch (error) {
            this.addError(`Invalid portal definition: ${error instanceof Error ? error.message : String(error)}`, lineNumber);
          }
        } else if (currentSection === 'lighting') {
          try {
            const pointLight = this.parsePointLightLine(content);
            if (!scene.lighting!.points) {
              scene.lighting!.points = [];
            }
            scene.lighting!.points.push(pointLight);
          } catch (error) {
            this.addError(`Invalid point light definition: ${error instanceof Error ? error.message : String(error)}`, lineNumber);
          }
        }
        continue;
      }

      // Parse key:value properties
      if (line.includes(':')) {
        const colonIndex = line.indexOf(':');
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        
        if (currentSection === 'scene') {
          this.parseSceneProperty(scene, metadata, key, value);
        } else if (currentSection === 'geometry' && currentGeometry) {
          this.parseGeometryProperty(currentGeometry, key, value);
        } else if (currentSection === 'slot' && currentSlot) {
          this.parseSlotProperty(currentSlot, key, value);
        } else if (currentSection === 'lighting') {
          this.parseLightingProperty(scene.lighting!, key, value);
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

    // Validation
    this.validateScene(scene);

    return {
      scene,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      validationErrors: this.validationErrors.length > 0 ? this.validationErrors : undefined
    };
  }

  private parseSceneProperty(scene: SceneData, metadata: Record<string, any>, key: string, value: string): void {
    if (key === 'name') {
      scene.name = value;
    } else if (key === 'grid') {
      // Parse grid dimensions: "24x16" or "24 x 16"
      const gridMatch = value.match(/(\d+)\s*[x×]\s*(\d+)/i);
      if (gridMatch) {
        const width = parseInt(gridMatch[1], 10);
        const height = parseInt(gridMatch[2], 10);
        if (!isNaN(width) && !isNaN(height)) {
          metadata.grid = { width, height };
        }
      }
    } else if (key === 'atmosphere') {
      // Parse comma-separated atmosphere tags
      scene.atmosphere = value.split(',').map(tag => tag.trim());
    } else if (key === 'tags' || key === 'author' || key === 'version') {
      metadata[key] = value;
    } else {
      metadata[key] = value;
    }
  }

  private parsePropLine(content: string): PropDefinition {
    // Format: id @anchor pos:(x,y,z) rot:(rx,ry,rz) scale:(sx,sy,sz) interactive:true
    const parts = content.split(/\s+/);
    const prop: PropDefinition = {
      id: parts[0] || 'unknown_prop',
      position: [0, 0, 0]
    };

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      // Anchor resolution
      if (part.startsWith('@')) {
        prop.anchor = part;
        prop.modelPath = this.resolveAnchor(part);
      }

      // Position
      const posMatch = part.match(/pos:\(([^)]+)\)/);
      if (posMatch) {
        prop.position = this.parseVector3(posMatch[1]);
      }

      // Rotation
      const rotMatch = part.match(/rot:\(([^)]+)\)/);
      if (rotMatch) {
        prop.rotation = this.parseVector3(rotMatch[1]);
      }

      // Scale
      const scaleMatch = part.match(/scale:\(([^)]+)\)/);
      if (scaleMatch) {
        prop.scale = this.parseVector3(scaleMatch[1]);
      }

      // Interactive flag
      if (part.startsWith('interactive:')) {
        prop.interactive = part.split(':')[1] === 'true';
      }
    }

    return prop;
  }

  private parseNPCLine(content: string): NPCDefinition {
    // Format: id pos:(x,y) dialogue:dialogue_id quest:quest_id
    const parts = content.split(/\s+/);
    const npc: NPCDefinition = {
      id: parts[0] || 'unknown_npc',
      position: [0, 0]
    };

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      // Position (2D for NPCs)
      const posMatch = part.match(/pos:\(([^)]+)\)/);
      if (posMatch) {
        const coords = posMatch[1].split(',').map(n => parseFloat(n.trim()));
        if (coords.length >= 2) {
          npc.position = [coords[0], coords[1]];
        }
      }

      // Dialogue ID
      if (part.startsWith('dialogue:')) {
        npc.dialogueId = part.split(':')[1];
      }

      // Quest ID
      if (part.startsWith('quest:')) {
        npc.questId = part.split(':')[1];
      }

      // Model path (anchor)
      if (part.startsWith('@')) {
        npc.modelPath = this.resolveAnchor(part);
      }
    }

    return npc;
  }

  private parsePortalLine(content: string): PortalDefinition {
    // Format: id pos:(x,y) target:target_scene requires:flag1,flag2 wall:north
    const parts = content.split(/\s+/);
    const portal: PortalDefinition = {
      id: parts[0] || 'unknown_portal',
      position: [0, 0],
      target: ''
    };

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      // Position
      const posMatch = part.match(/pos:\(([^)]+)\)/);
      if (posMatch) {
        const coords = posMatch[1].split(',').map(n => parseFloat(n.trim()));
        if (coords.length >= 2) {
          portal.position = [coords[0], coords[1]];
        }
      }

      // Target scene
      if (part.startsWith('target:')) {
        portal.target = part.split(':')[1];
      }

      // Required flags
      if (part.startsWith('requires:')) {
        const flags = part.substring(9).split(',').map(f => f.trim());
        portal.requiresFlags = flags;
      }

      // Wall specification
      if (part.startsWith('wall:')) {
        const wall = part.split(':')[1] as 'north' | 'south' | 'east' | 'west';
        if (['north', 'south', 'east', 'west'].includes(wall)) {
          portal.wall = wall;
        }
      }

      // Locked flag
      if (part.startsWith('locked:')) {
        portal.locked = part.split(':')[1] === 'true';
      }
    }

    return portal;
  }

  private parsePointLightLine(content: string): { position: [number, number, number]; color: string; intensity: number } {
    // Format: pos:(x,y,z) color:#ff0000 intensity:2.0
    const light = {
      position: [0, 0, 0] as [number, number, number],
      color: '#ffffff',
      intensity: 1.0
    };

    const parts = content.split(/\s+/);
    for (const part of parts) {
      const posMatch = part.match(/pos:\(([^)]+)\)/);
      if (posMatch) {
        light.position = this.parseVector3(posMatch[1]);
      }

      if (part.startsWith('color:')) {
        light.color = part.split(':')[1];
      }

      if (part.startsWith('intensity:')) {
        light.intensity = parseFloat(part.split(':')[1]);
      }
    }

    return light;
  }

  private parseLightingProperty(lighting: LightingDefinition, key: string, value: string): void {
    if (key === 'ambient') {
      lighting.ambient = { color: value, intensity: 1.0 };
    } else if (key === 'directional') {
      // Parse: #ff4444 direction:(0.5,-1,0.3) intensity:2.0
      const parts = value.split(/\s+/);
      const color = parts[0];
      let direction: [number, number, number] = [0, -1, 0];
      let intensity = 1.0;

      for (const part of parts.slice(1)) {
        const dirMatch = part.match(/direction:\(([^)]+)\)/);
        if (dirMatch) {
          direction = this.parseVector3(dirMatch[1]);
        }
        if (part.startsWith('intensity:')) {
          intensity = parseFloat(part.split(':')[1]);
        }
      }

      lighting.directional = { color, direction, intensity };
    }
  }

  private parseGeometryProperty(geometry: Partial<SceneGeometry>, key: string, value: string): void {
    if (key === 'dimensions') {
      const dims = value.split(',').map(v => {
        const num = parseFloat(v.trim());
        if (isNaN(num)) {
          throw new Error(`Invalid dimension value: "${v.trim()}" (expected a number)`);
        }
        return num;
      });
      geometry.dimensions = dims;
    } else if (key === 'position') {
      const pos = value.split(',').map(v => {
        const num = parseFloat(v.trim());
        if (isNaN(num)) {
          throw new Error(`Invalid position value: "${v.trim()}" (expected a number)`);
        }
        return num;
      });
      if (pos.length !== 3) {
        throw new Error(`Position must have exactly 3 values (x, y, z), got ${pos.length}`);
      }
      geometry.position = pos as [number, number, number];
    } else if (key === 'color') {
      geometry.color = value;
    }
  }

  private parseSlotProperty(slot: Partial<SceneSlot>, key: string, value: string): void {
    if (key === 'position') {
      const pos = value.split(',').map(v => {
        const num = parseFloat(v.trim());
        if (isNaN(num)) {
          throw new Error(`Invalid position value: "${v.trim()}" (expected a number)`);
        }
        return num;
      });
      if (pos.length !== 3) {
        throw new Error(`Position must have exactly 3 values (x, y, z), got ${pos.length}`);
      }
      slot.position = pos as [number, number, number];
    } else if (key === 'rotation') {
      const rot = value.split(',').map(v => {
        const num = parseFloat(v.trim());
        if (isNaN(num)) {
          throw new Error(`Invalid rotation value: "${v.trim()}" (expected a number)`);
        }
        return num;
      });
      if (rot.length !== 3) {
        throw new Error(`Rotation must have exactly 3 values (x, y, z), got ${rot.length}`);
        }
      slot.rotation = rot as [number, number, number];
    } else if (key === 'scale') {
      const scale = value.split(',').map(v => {
        const num = parseFloat(v.trim());
        if (isNaN(num)) {
          throw new Error(`Invalid scale value: "${v.trim()}" (expected a number)`);
        }
        return num;
      });
      if (scale.length !== 3) {
        throw new Error(`Scale must have exactly 3 values (x, y, z), got ${scale.length}`);
      }
      slot.scale = scale as [number, number, number];
    }
  }

  /**
   * Parse a vector3 from comma-separated string
   */
  private parseVector3(value: string): [number, number, number] {
    const parts = value.split(',').map(v => parseFloat(v.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) {
      throw new Error(`Invalid vector3: "${value}" (expected 3 numbers separated by commas)`);
    }
    return parts as [number, number, number];
  }

  /**
   * Resolve anchor to full path
   * @example resolveAnchor('@props/fountain') → 'assets/models/props/fountain.glb'
   */
  resolveAnchor(anchor: string): string {
    for (const [prefix, basePath] of Object.entries(this.anchorMap)) {
      if (anchor.startsWith(prefix)) {
        const relativePath = anchor.substring(prefix.length);
        // Add .glb extension if not present
        const fullPath = relativePath.endsWith('.glb') ? relativePath : `${relativePath}.glb`;
        return path.join(basePath, fullPath).replace(/\\/g, '/');
      }
    }

    // If no anchor match, return as-is
    return anchor;
  }

  /**
   * Validate scene data
   */
  private validateScene(scene: SceneData): void {
    // Required fields
    if (!scene.id) {
      this.addError('Scene must have an id');
    }

    // Validate portals have targets
    for (const portal of scene.portals || []) {
      if (!portal.target) {
        this.addWarning(`Portal "${portal.id}" has no target scene`);
      }
    }

    // Validate NPCs have positions
    for (const npc of scene.npcs || []) {
      if (npc.position[0] === 0 && npc.position[1] === 0) {
        this.addWarning(`NPC "${npc.id}" has default position (0,0)`);
      }
    }

    // Validate props have positions
    for (const prop of scene.props || []) {
      if (!prop.modelPath && !prop.anchor) {
        this.addWarning(`Prop "${prop.id}" has no model path or anchor`);
      }
    }
  }

  /**
   * Add validation error
   */
  private addError(message: string, line?: number): void {
    this.validationErrors.push({
      type: 'error',
      message,
      line
    });
  }

  /**
   * Add validation warning
   */
  private addWarning(message: string, line?: number): void {
    this.validationErrors.push({
      type: 'warning',
      message,
      line
    });
  }

  /**
   * Get validation errors
   */
  getValidationErrors(): ValidationError[] {
    return this.validationErrors;
  }

  /**
   * Parse RWMD file from string content (static method)
   */
  static parseString(content: string, customAnchorMap?: AnchorMap): ParsedScene {
    try {
      const parser = new RWMDParser(customAnchorMap);
      return parser.parse(content);
    } catch (error) {
      throw new Error(`RWMD parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
