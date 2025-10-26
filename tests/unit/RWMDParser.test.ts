/**
 * Unit tests for Enhanced RWMD Parser
 */

import { RWMDParser, AnchorMap } from '../../src/runtime/parsers/RWMDParser';

describe('Enhanced RWMD Parser', () => {
  let parser: RWMDParser;

  beforeEach(() => {
    parser = new RWMDParser();
  });

  describe('Basic Parsing', () => {
    it('should parse scene ID and metadata', () => {
      const rwmd = `
        scene: village_square
        name: Village Square
        grid: 24x16
        atmosphere: peaceful, sunny
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.id).toBe('village_square');
      expect(result.scene.name).toBe('Village Square');
      expect(result.metadata?.grid).toEqual({ width: 24, height: 16 });
      expect(result.scene.atmosphere).toEqual(['peaceful', 'sunny']);
    });

    it('should handle backward compatible @scene syntax', () => {
      const rwmd = `
        @scene test_scene
        name: Test Scene
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.id).toBe('test_scene');
      expect(result.scene.name).toBe('Test Scene');
    });

    it('should ignore comments', () => {
      const rwmd = `
        # This is a comment
        scene: test
        # Another comment
        name: Test Scene
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.id).toBe('test');
      expect(result.scene.name).toBe('Test Scene');
    });
  });

  describe('Props Parsing', () => {
    it('should parse prop with anchor and position', () => {
      const rwmd = `
        scene: test
        
        props:
          - fountain @props/decorative_fountain pos:(12,12,0)
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.props).toHaveLength(1);
      expect(result.scene.props![0]).toEqual({
        id: 'fountain',
        anchor: '@props/decorative_fountain',
        modelPath: 'assets/models/props/decorative_fountain.glb',
        position: [12, 12, 0]
      });
    });

    it('should parse prop with rotation and scale', () => {
      const rwmd = `
        scene: test
        
        props:
          - statue @props/statue pos:(10,5,0) rot:(0,45,0) scale:(2,2,2)
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.props![0]).toMatchObject({
        id: 'statue',
        position: [10, 5, 0],
        rotation: [0, 45, 0],
        scale: [2, 2, 2]
      });
    });

    it('should parse interactive flag', () => {
      const rwmd = `
        scene: test
        
        props:
          - chest @props/treasure_chest pos:(5,5,0) interactive:true
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.props![0].interactive).toBe(true);
    });

    it('should parse multiple props', () => {
      const rwmd = `
        scene: test
        
        props:
          - fountain @props/fountain pos:(12,12,0)
          - bench @props/bench pos:(8,8,0)
          - tree @props/tree pos:(15,10,0)
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.props).toHaveLength(3);
      expect(result.scene.props![0].id).toBe('fountain');
      expect(result.scene.props![1].id).toBe('bench');
      expect(result.scene.props![2].id).toBe('tree');
    });
  });

  describe('NPC Parsing', () => {
    it('should parse NPC with position and dialogue', () => {
      const rwmd = `
        scene: test
        
        npcs:
          - elder pos:(12,8) dialogue:elder_greeting
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.npcs).toHaveLength(1);
      expect(result.scene.npcs![0]).toEqual({
        id: 'elder',
        position: [12, 8],
        dialogueId: 'elder_greeting'
      });
    });

    it('should parse NPC with quest ID', () => {
      const rwmd = `
        scene: test
        
        npcs:
          - merchant pos:(10,10) dialogue:merchant_wares quest:buy_supplies
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.npcs![0]).toMatchObject({
        id: 'merchant',
        dialogueId: 'merchant_wares',
        questId: 'buy_supplies'
      });
    });

    it('should parse NPC with model path', () => {
      const rwmd = `
        scene: test
        
        npcs:
          - guard pos:(5,5) @npcs/guard dialogue:guard_challenge
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.npcs![0].modelPath).toBe('assets/models/npcs/guard.glb');
    });

    it('should parse multiple NPCs', () => {
      const rwmd = `
        scene: test
        
        npcs:
          - elder pos:(12,8) dialogue:elder_greeting
          - merchant pos:(10,10) dialogue:merchant_wares
          - guard pos:(5,5) dialogue:guard_challenge
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.npcs).toHaveLength(3);
    });
  });

  describe('Portal Parsing', () => {
    it('should parse portal with target scene', () => {
      const rwmd = `
        scene: test
        
        portals:
          - exit pos:(12,0) target:palace_interior
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.portals).toHaveLength(1);
      expect(result.scene.portals![0]).toEqual({
        id: 'exit',
        position: [12, 0],
        target: 'palace_interior'
      });
    });

    it('should parse portal with required flags', () => {
      const rwmd = `
        scene: test
        
        portals:
          - locked_door pos:(12,16) target:treasure_room requires:has_key,completed_quest
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.portals![0]).toMatchObject({
        id: 'locked_door',
        target: 'treasure_room',
        requiresFlags: ['has_key', 'completed_quest']
      });
    });

    it('should parse portal with wall specification', () => {
      const rwmd = `
        scene: test
        
        portals:
          - north_exit pos:(12,0) target:north_room wall:north
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.portals![0].wall).toBe('north');
    });

    it('should parse locked portal', () => {
      const rwmd = `
        scene: test
        
        portals:
          - door pos:(12,8) target:locked_room locked:true
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.portals![0].locked).toBe(true);
    });
  });

  describe('Lighting Parsing', () => {
    it('should parse ambient lighting', () => {
      const rwmd = `
        scene: test
        
        lighting:
          ambient: #2a0a0a
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.lighting?.ambient).toEqual({
        color: '#2a0a0a',
        intensity: 1.0
      });
    });

    it('should parse directional lighting', () => {
      const rwmd = `
        scene: test
        
        lighting:
          directional: #ff4444 direction:(0.5,-1,0.3) intensity:2.0
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.lighting?.directional).toEqual({
        color: '#ff4444',
        direction: [0.5, -1, 0.3],
        intensity: 2.0
      });
    });

    it('should parse point lights', () => {
      const rwmd = `
        scene: test
        
        lighting:
          - pos:(12,8,3) color:#ff0000 intensity:2.0
          - pos:(6,6,2) color:#ffffff intensity:1.5
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.lighting?.points).toHaveLength(2);
      expect(result.scene.lighting?.points![0]).toEqual({
        position: [12, 8, 3],
        color: '#ff0000',
        intensity: 2.0
      });
    });

    it('should parse complete lighting setup', () => {
      const rwmd = `
        scene: test
        
        lighting:
          ambient: #1a1a1a
          directional: #ffaa00 direction:(0.5,-1,0.3) intensity:1.5
          - pos:(12,8,3) color:#ff0000 intensity:2.0
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.lighting?.ambient).toBeDefined();
      expect(result.scene.lighting?.directional).toBeDefined();
      expect(result.scene.lighting?.points).toHaveLength(1);
    });
  });

  describe('Anchor Resolution', () => {
    it('should resolve @props/ anchor', () => {
      const path = parser.resolveAnchor('@props/fountain');
      expect(path).toBe('assets/models/props/fountain.glb');
    });

    it('should resolve @architecture/ anchor', () => {
      const path = parser.resolveAnchor('@architecture/palace');
      expect(path).toBe('assets/models/architecture/palace.glb');
    });

    it('should resolve @npcs/ anchor', () => {
      const path = parser.resolveAnchor('@npcs/guard');
      expect(path).toBe('assets/models/npcs/guard.glb');
    });

    it('should handle anchor with subdirectories', () => {
      const path = parser.resolveAnchor('@props/furniture/chair');
      expect(path).toBe('assets/models/props/furniture/chair.glb');
    });

    it('should handle anchor with explicit .glb extension', () => {
      const path = parser.resolveAnchor('@props/fountain.glb');
      expect(path).toBe('assets/models/props/fountain.glb');
    });

    it('should use custom anchor map', () => {
      const customMap: AnchorMap = {
        '@custom/': 'custom/path/'
      };
      const customParser = new RWMDParser(customMap);
      const path = customParser.resolveAnchor('@custom/item');
      expect(path).toBe('custom/path/item.glb');
    });

    it('should return unmatched anchors as-is', () => {
      const path = parser.resolveAnchor('unknown/path');
      expect(path).toBe('unknown/path');
    });
  });

  describe('Validation', () => {
    it('should validate scene has ID', () => {
      const rwmd = `
        name: Test Scene
      `;

      const result = parser.parse(rwmd);

      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors!.some(e => 
        e.type === 'error' && e.message.includes('id')
      )).toBe(true);
    });

    it('should warn about portals without targets', () => {
      const rwmd = `
        scene: test
        
        portals:
          - door pos:(12,8)
      `;

      const result = parser.parse(rwmd);

      expect(result.validationErrors!.some(e =>
        e.type === 'warning' && e.message.includes('target')
      )).toBe(true);
    });

    it('should warn about props without model paths', () => {
      const rwmd = `
        scene: test
        
        props:
          - empty pos:(10,10,0)
      `;

      const result = parser.parse(rwmd);

      expect(result.validationErrors!.some(e =>
        e.type === 'warning' && e.message.includes('model path')
      )).toBe(true);
    });

    it('should not have errors for valid scene', () => {
      const rwmd = `
        scene: test
        name: Valid Test Scene
        grid: 24x16
        
        props:
          - fountain @props/fountain pos:(12,12,0)
        
        npcs:
          - elder pos:(12,8) dialogue:elder_greeting
        
        portals:
          - exit pos:(12,0) target:next_scene
      `;

      const result = parser.parse(rwmd);

      const errors = result.validationErrors?.filter(e => e.type === 'error') || [];
      expect(errors).toHaveLength(0);
    });
  });

  describe('Complex Scene Parsing', () => {
    it('should parse a complete complex scene', () => {
      const rwmd = `
        scene: crimson_gothic_arrival
        name: Gothic Arrival
        grid: 24x16
        atmosphere: eerie, blood-red, gothic
        
        props:
          - lantern @props/lanterns/blood_red pos:(4,2,0) interactive:true
          - architecture @architecture/victorian_facade pos:(12,8,0) scale:(2,2,2)
          - fountain @props/fountain pos:(12,12,0) rot:(0,45,0)
        
        npcs:
          - carmilla pos:(12,8) dialogue:carmilla_intro quest:meet_carmilla
          - servant pos:(6,6) dialogue:servant_warning
        
        portals:
          - palace_entrance pos:(12,0) target:palace_interior requires:met_carmilla wall:north
          - garden_exit pos:(24,8) target:dark_garden wall:east
        
        lighting:
          ambient: #2a0a0a
          directional: #ff4444 direction:(0.5,-1,0.3) intensity:1.5
          - pos:(12,8,3) color:#ff0000 intensity:2.0
          - pos:(6,6,2) color:#aa0000 intensity:1.5
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.id).toBe('crimson_gothic_arrival');
      expect(result.scene.props).toHaveLength(3);
      expect(result.scene.npcs).toHaveLength(2);
      expect(result.scene.portals).toHaveLength(2);
      expect(result.scene.lighting?.ambient).toBeDefined();
      expect(result.scene.lighting?.directional).toBeDefined();
      expect(result.scene.lighting?.points).toHaveLength(2);
      expect(result.scene.atmosphere).toHaveLength(3);
    });
  });

  describe('Backward Compatibility', () => {
    it('should parse old @geometry syntax', () => {
      const rwmd = `
        @scene test
        
        @geometry floor
        dimensions: 10, 10
        position: 0, 0, 0
        color: #808080
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.id).toBe('test');
      expect(result.scene.geometry).toHaveLength(1);
      expect(result.scene.geometry[0].type).toBe('floor');
    });

    it('should parse old @slot syntax', () => {
      const rwmd = `
        @scene test
        
        @slot npc_slot
        position: 12, 8, 0
        rotation: 0, 45, 0
      `;

      const result = parser.parse(rwmd);

      expect(result.scene.slots).toHaveLength(1);
      expect(result.scene.slots[0].id).toBe('npc_slot');
      expect(result.scene.slots[0].position).toEqual([12, 8, 0]);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid vector3 gracefully with validation errors', () => {
      const rwmd = `
        scene: test
        
        props:
          - prop @props/test pos:(invalid,vector,here)
      `;

      const result = parser.parse(rwmd);

      // Should have validation errors about invalid prop
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors!.length).toBeGreaterThan(0);
    });

    it('should handle malformed prop lines gracefully', () => {
      const rwmd = `
        scene: test
        
        props:
          - malformed prop line without proper formatting
      `;

      const result = parser.parse(rwmd);

      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors!.length).toBeGreaterThan(0);
    });
  });

  describe('Static Parse Method', () => {
    it('should parse using static method', () => {
      const rwmd = `
        scene: static_test
        name: Static Test
      `;

      const result = RWMDParser.parseString(rwmd);

      expect(result.scene.id).toBe('static_test');
      expect(result.scene.name).toBe('Static Test');
    });

    it('should accept custom anchor map in static method', () => {
      const rwmd = `
        scene: test
        
        props:
          - item @custom/thing pos:(5,5,0)
      `;

      const customMap: AnchorMap = {
        '@custom/': 'custom/models/'
      };

      const result = RWMDParser.parseString(rwmd, customMap);

      expect(result.scene.props![0].modelPath).toBe('custom/models/thing.glb');
    });
  });
});
