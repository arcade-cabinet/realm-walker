/**
 * Unit tests for SceneCompositor
 * Tests scene building and slot management
 */

import { SceneCompositor } from '../../src/runtime/systems/SceneCompositor';
import { SceneData, SceneTemplate } from '../../src/types';

describe('SceneCompositor', () => {
  let sceneCompositor: SceneCompositor;

  beforeEach(() => {
    sceneCompositor = new SceneCompositor();
  });

  describe('Legacy Scene Composition', () => {
    test('composes scene from SceneData', () => {
      const sceneData: SceneData = {
        id: 'test_scene',
        name: 'Test Scene',
        geometry: [
          {
            type: 'box',
            dimensions: [1, 1, 1],
            position: [0, 0, 0],
            color: '#ff0000'
          }
        ],
        slots: [
          { id: 'npc_test', position: [1, 0, 1] },
          { id: 'door_exit', position: [5, 0, 5] },
          { id: 'chest', position: [3, 0, 3] }
        ]
      };

      const composed = sceneCompositor.compose(sceneData);

      expect(composed.scene).toBeDefined();
      expect(composed.gridSystem).toBeDefined();
      expect(composed.slots.npcs.size).toBeGreaterThan(0);
      expect(composed.slots.doors.size).toBeGreaterThan(0);
      expect(composed.slots.props.size).toBeGreaterThan(0);
    });

    test('categorizes slots by name heuristics', () => {
      const sceneData: SceneData = {
        id: 'test',
        name: 'Test',
        geometry: [],
        slots: [
          { id: 'npc_elder', position: [1, 0, 1] },
          { id: 'door_main', position: [2, 0, 2] },
          { id: 'fountain', position: [3, 0, 3] }
        ]
      };

      const composed = sceneCompositor.compose(sceneData);

      expect(composed.slots.npcs.has('npc_elder')).toBe(true);
      expect(composed.slots.doors.has('door_main')).toBe(true);
      expect(composed.slots.props.has('fountain')).toBe(true);
    });

    test('creates grid system with default size', () => {
      const sceneData: SceneData = {
        id: 'test',
        name: 'Test',
        geometry: [],
        slots: []
      };

      const composed = sceneCompositor.compose(sceneData);

      expect(composed.gridSystem.width).toBe(10);
      expect(composed.gridSystem.height).toBe(10);
    });
  });

  describe('Template-Based Composition', () => {
    test('composes scene from SceneTemplate', () => {
      const template: SceneTemplate = {
        id: 'village_square',
        grid: { width: 24, height: 16 },
        floor: { texture: 'cobblestone' },
        slots: {
          npcs: [
            { id: 'elder', position: [12, 8] }
          ],
          props: [
            { id: 'fountain', position: [12, 12] }
          ],
          doors: [
            { id: 'exit', position: [12, 0], wall: 'south' }
          ]
        }
      };

      const composed = sceneCompositor.composeFromTemplate(template);

      expect(composed.gridSystem.width).toBe(24);
      expect(composed.gridSystem.height).toBe(16);
      expect(composed.slots.npcs.size).toBe(1);
      expect(composed.slots.props.size).toBe(1);
      expect(composed.slots.doors.size).toBe(1);
    });

    test('marks NPC positions as non-walkable', () => {
      const template: SceneTemplate = {
        id: 'test',
        grid: { width: 10, height: 10 },
        floor: { texture: 'test' },
        slots: {
          npcs: [
            { id: 'npc1', position: [5, 5] }
          ]
        }
      };

      const composed = sceneCompositor.composeFromTemplate(template);

      expect(composed.gridSystem.isWalkable([5, 5])).toBe(false);
    });

    test('marks prop positions as non-walkable', () => {
      const template: SceneTemplate = {
        id: 'test',
        grid: { width: 10, height: 10 },
        floor: { texture: 'test' },
        slots: {
          props: [
            { id: 'prop1', position: [3, 3] }
          ]
        }
      };

      const composed = sceneCompositor.composeFromTemplate(template);

      expect(composed.gridSystem.isWalkable([3, 3])).toBe(false);
    });

    test('keeps doors walkable', () => {
      const template: SceneTemplate = {
        id: 'test',
        grid: { width: 10, height: 10 },
        floor: { texture: 'test' },
        slots: {
          doors: [
            { id: 'door1', position: [5, 0], wall: 'north' }
          ]
        }
      };

      const composed = sceneCompositor.composeFromTemplate(template);

      expect(composed.gridSystem.isWalkable([5, 0])).toBe(true);
    });

    test('marks walls as non-walkable', () => {
      const template: SceneTemplate = {
        id: 'test',
        grid: { width: 10, height: 10 },
        floor: { texture: 'test' },
        walls: [
          { side: 'north', height: 3.0, texture: 'stone' }
        ],
        slots: {}
      };

      const composed = sceneCompositor.composeFromTemplate(template);

      // Check north wall tiles are non-walkable
      expect(composed.gridSystem.isWalkable([0, 0])).toBe(false);
      expect(composed.gridSystem.isWalkable([5, 0])).toBe(false);
      expect(composed.gridSystem.isWalkable([9, 0])).toBe(false);

      // Check interior tiles are still walkable
      expect(composed.gridSystem.isWalkable([5, 5])).toBe(true);
    });
  });

  describe('Slot Management', () => {
    test('gets all slot IDs', () => {
      const template: SceneTemplate = {
        id: 'test',
        grid: { width: 10, height: 10 },
        floor: { texture: 'test' },
        slots: {
          npcs: [{ id: 'npc1', position: [1, 1] }],
          props: [{ id: 'prop1', position: [2, 2] }],
          doors: [{ id: 'door1', position: [3, 3], wall: 'south' }]
        }
      };

      const composed = sceneCompositor.composeFromTemplate(template);
      const slotIds = sceneCompositor.getSlotIds(composed);

      expect(slotIds.length).toBe(3);
      expect(slotIds).toContain('npc1');
      expect(slotIds).toContain('prop1');
      expect(slotIds).toContain('door1');
    });

    test('handles empty slots', () => {
      const template: SceneTemplate = {
        id: 'test',
        grid: { width: 10, height: 10 },
        floor: { texture: 'test' },
        slots: {}
      };

      const composed = sceneCompositor.composeFromTemplate(template);
      const slotIds = sceneCompositor.getSlotIds(composed);

      expect(slotIds.length).toBe(0);
    });
  });

  describe('Scene Creation', () => {
    test('creates Three.js scene object', () => {
      const sceneData: SceneData = {
        id: 'test',
        name: 'Test',
        geometry: [],
        slots: []
      };

      const composed = sceneCompositor.compose(sceneData);

      expect(composed.scene.type).toBe('Scene');
      expect(composed.scene.children.length).toBeGreaterThan(0);
    });

    test('adds geometry to scene', () => {
      const sceneData: SceneData = {
        id: 'test',
        name: 'Test',
        geometry: [
          { type: 'box', dimensions: [1, 1, 1], position: [0, 0, 0] },
          { type: 'sphere', dimensions: [1], position: [2, 0, 0] }
        ],
        slots: []
      };

      const composed = sceneCompositor.compose(sceneData);

      // Should have at least the geometry meshes
      const meshCount = composed.scene.children.filter(child => child.type === 'Mesh').length;
      expect(meshCount).toBeGreaterThanOrEqual(2);
    });
  });
});
