/**
 * Unit tests for InteractionSystem
 * Tests player interaction handling with scene elements
 */

import { InteractionSystem, ClickEvent, InteractionHandler } from '../../src/runtime/systems/InteractionSystem';
import { InteractionPoint } from '../../src/types';

describe('InteractionSystem', () => {
  let system: InteractionSystem;
  let mockHandlers: InteractionHandler;

  beforeEach(() => {
    mockHandlers = {
      onDialogue: jest.fn(),
      onExamine: jest.fn(),
      onUse: jest.fn(),
      onPortal: jest.fn(),
    };
    system = new InteractionSystem(mockHandlers);
  });

  describe('Interaction Registration', () => {
    test('should register interaction points', () => {
      const point: InteractionPoint = {
        id: 'test_npc',
        type: 'dialogue',
        position: [5, 5],
        radius: 1,
        dialogueId: 'test_dialogue',
      };

      system.registerInteraction(point);
      
      const interactions = system.getInteractions();
      expect(interactions).toHaveLength(1);
      expect(interactions[0].id).toBe('test_npc');
    });

    test('should remove interaction points', () => {
      const point: InteractionPoint = {
        id: 'test_npc',
        type: 'dialogue',
        position: [5, 5],
        radius: 1,
      };

      system.registerInteraction(point);
      expect(system.getInteractions()).toHaveLength(1);

      system.removeInteraction('test_npc');
      expect(system.getInteractions()).toHaveLength(0);
    });

    test('should get all registered interactions', () => {
      const point1: InteractionPoint = {
        id: 'npc1',
        type: 'dialogue',
        position: [5, 5],
        radius: 1,
      };
      const point2: InteractionPoint = {
        id: 'npc2',
        type: 'examine',
        position: [10, 10],
        radius: 1,
      };

      system.registerInteraction(point1);
      system.registerInteraction(point2);

      const interactions = system.getInteractions();
      expect(interactions).toHaveLength(2);
    });

    test('should clear all interactions', () => {
      system.registerInteraction({
        id: 'test1',
        type: 'dialogue',
        position: [5, 5],
        radius: 1,
      });
      system.registerInteraction({
        id: 'test2',
        type: 'use',
        position: [10, 10],
        radius: 1,
      });

      expect(system.getInteractions()).toHaveLength(2);
      
      system.clearInteractions();
      expect(system.getInteractions()).toHaveLength(0);
    });
  });

  describe('Click Handling', () => {
    test('should trigger dialogue handler when clicking near NPC', () => {
      const npcPoint: InteractionPoint = {
        id: 'guide',
        type: 'dialogue',
        position: [5, 5],
        radius: 2,
        dialogueId: 'guide_greeting',
      };

      system.registerInteraction(npcPoint);

      const clickEvent: ClickEvent = {
        worldPosition: [5, 0, 5],
        gridPosition: [5, 5],
        timestamp: Date.now(),
      };

      const handled = system.handleClick(clickEvent, {});

      expect(handled).toBe(true);
      expect(mockHandlers.onDialogue).toHaveBeenCalledWith('guide', 'guide_greeting');
    });

    test('should trigger examine handler for examine interactions', () => {
      const examinePoint: InteractionPoint = {
        id: 'chest',
        type: 'examine',
        position: [10, 10],
        radius: 1,
        description: 'A locked chest',
      };

      system.registerInteraction(examinePoint);

      const clickEvent: ClickEvent = {
        worldPosition: [10, 0, 10],
        gridPosition: [10, 10],
        timestamp: Date.now(),
      };

      const handled = system.handleClick(clickEvent, {});

      expect(handled).toBe(true);
      expect(mockHandlers.onExamine).toHaveBeenCalledWith('chest', 'A locked chest');
    });

    test('should trigger use handler for use interactions', () => {
      const usePoint: InteractionPoint = {
        id: 'lever',
        type: 'use',
        position: [7, 7],
        radius: 1,
      };

      system.registerInteraction(usePoint);

      const clickEvent: ClickEvent = {
        worldPosition: [7, 0, 7],
        gridPosition: [7, 7],
        timestamp: Date.now(),
      };

      const handled = system.handleClick(clickEvent, {});

      expect(handled).toBe(true);
      expect(mockHandlers.onUse).toHaveBeenCalledWith('lever');
    });

    test('should trigger portal handler for portal interactions', () => {
      const portalPoint: InteractionPoint = {
        id: 'door',
        type: 'portal',
        position: [15, 15],
        radius: 1,
        targetScene: 'next_room',
      };

      system.registerInteraction(portalPoint);

      const clickEvent: ClickEvent = {
        worldPosition: [15, 0, 15],
        gridPosition: [15, 15],
        timestamp: Date.now(),
      };

      const handled = system.handleClick(clickEvent, {});

      expect(handled).toBe(true);
      expect(mockHandlers.onPortal).toHaveBeenCalledWith('next_room');
    });

    test('should not trigger interaction if click is too far away', () => {
      const point: InteractionPoint = {
        id: 'npc',
        type: 'dialogue',
        position: [5, 5],
        radius: 1,
        dialogueId: 'test',
      };

      system.registerInteraction(point);

      const clickEvent: ClickEvent = {
        worldPosition: [20, 0, 20],
        gridPosition: [20, 20],
        timestamp: Date.now(),
      };

      const handled = system.handleClick(clickEvent, {});

      expect(handled).toBe(false);
      expect(mockHandlers.onDialogue).not.toHaveBeenCalled();
    });

    test('should return false if click has no grid position', () => {
      const point: InteractionPoint = {
        id: 'npc',
        type: 'dialogue',
        position: [5, 5],
        radius: 1,
      };

      system.registerInteraction(point);

      const clickEvent: ClickEvent = {
        worldPosition: [5, 0, 5],
        // No gridPosition
        timestamp: Date.now(),
      };

      const handled = system.handleClick(clickEvent, {});
      expect(handled).toBe(false);
    });
  });

  describe('Flag Requirements', () => {
    test('should respect flag requirements', () => {
      const point: InteractionPoint = {
        id: 'gated_npc',
        type: 'dialogue',
        position: [5, 5],
        radius: 1,
        dialogueId: 'secret',
        requiresFlags: ['quest_completed'],
      };

      system.registerInteraction(point);

      const clickEvent: ClickEvent = {
        worldPosition: [5, 0, 5],
        gridPosition: [5, 5],
        timestamp: Date.now(),
      };

      // Without flag
      let handled = system.handleClick(clickEvent, {});
      expect(handled).toBe(false);

      // With flag
      handled = system.handleClick(clickEvent, { quest_completed: true });
      expect(handled).toBe(true);
      expect(mockHandlers.onDialogue).toHaveBeenCalledWith('gated_npc', 'secret');
    });

    test('should require all flags when multiple are specified', () => {
      const point: InteractionPoint = {
        id: 'special_door',
        type: 'portal',
        position: [10, 10],
        radius: 1,
        targetScene: 'secret_room',
        requiresFlags: ['has_key', 'quest_active'],
      };

      system.registerInteraction(point);

      const clickEvent: ClickEvent = {
        worldPosition: [10, 0, 10],
        gridPosition: [10, 10],
        timestamp: Date.now(),
      };

      // With only one flag
      let handled = system.handleClick(clickEvent, { has_key: true });
      expect(handled).toBe(false);

      // With both flags
      handled = system.handleClick(clickEvent, { has_key: true, quest_active: true });
      expect(handled).toBe(true);
    });
  });

  describe('Handler Management', () => {
    test('should update handlers', () => {
      const newHandlers: InteractionHandler = {
        onDialogue: jest.fn(),
      };

      system.setHandlers(newHandlers);

      const point: InteractionPoint = {
        id: 'npc',
        type: 'dialogue',
        position: [5, 5],
        radius: 1,
        dialogueId: 'test',
      };

      system.registerInteraction(point);

      const clickEvent: ClickEvent = {
        worldPosition: [5, 0, 5],
        gridPosition: [5, 5],
        timestamp: Date.now(),
      };

      system.handleClick(clickEvent, {});

      expect(newHandlers.onDialogue).toHaveBeenCalled();
    });

    test('should create system with no handlers', () => {
      const emptySystem = new InteractionSystem();
      
      const point: InteractionPoint = {
        id: 'npc',
        type: 'dialogue',
        position: [5, 5],
        radius: 1,
        dialogueId: 'test',
      };

      emptySystem.registerInteraction(point);

      const clickEvent: ClickEvent = {
        worldPosition: [5, 0, 5],
        gridPosition: [5, 5],
        timestamp: Date.now(),
      };

      // Should not crash even without handlers
      expect(() => {
        emptySystem.handleClick(clickEvent, {});
      }).not.toThrow();
    });
  });

  describe('Distance Calculation', () => {
    test('should detect clicks within interaction radius', () => {
      const point: InteractionPoint = {
        id: 'item',
        type: 'examine',
        position: [10, 10],
        radius: 2,
        description: 'Test item',
      };

      system.registerInteraction(point);

      // Test various positions within radius 2 (Manhattan distance)
      const positions: [number, number][] = [
        [10, 10], // 0 distance
        [11, 10], // 1 distance
        [10, 11], // 1 distance
        [12, 10], // 2 distance
        [10, 12], // 2 distance
        [11, 11], // 2 distance
      ];

      positions.forEach(pos => {
        const clickEvent: ClickEvent = {
          worldPosition: [pos[0], 0, pos[1]],
          gridPosition: pos,
          timestamp: Date.now(),
        };

        const handled = system.handleClick(clickEvent, {});
        expect(handled).toBe(true);
      });

      // Test position outside radius
      const farClick: ClickEvent = {
        worldPosition: [13, 0, 10],
        gridPosition: [13, 10],
        timestamp: Date.now(),
      };

      const handled = system.handleClick(farClick, {});
      expect(handled).toBe(false);
    });
  });
});
