import { LoomSettings } from '@realm-walker/shared';
import { describe, expect, it } from 'vitest';
import {
    ApocalypseLoomDef,
    AtbLoomDef,
    DualTechLoomDef,
    ElementalWheelLoomDef,
    EsperLoomDef,
    MateriaLoomDef,
    PsiLoomDef,
    RingMenuLoomDef,
    StatusAilmentLoomDef,
    TimeTravelLoomDef
} from '../src/archetypal-definitions.js';
import { ArchetypalTapestry } from '../src/ArchetypalTapestry.js';

/**
 * ARCHETYPAL LOOM TESTS
 * 
 * Tests for mid-1990s RPG archetypal systems based on:
 * - Final Fantasy VI (Esper/Magicite, ATB, World of Ruin)
 * - Chrono Trigger (Time Travel, Dual/Triple Techs)
 * - Secret of Mana (Ring Menu, Real-time Combat)
 * - Earthbound (PSI System, Status Effects)
 */

describe('Archetypal Loom DDLs', () => {
    const mockSettings: LoomSettings = {
        seed: 'archetypal-test-seed',
        age: 'The Golden Age of RPGs',
        controls: {
            worldScale: 6,
            minNodes: 5,
            dangerLevel: 7,
            magicLevel: 8,
            technologyLevel: 3
        },
        preferences: {
            factions: true,
            items: true,
            bestiary: true,
            hero: true,
            quests: true,
            biases: {
                questFocus: 'balanced',
                combatDifficulty: 'balanced'
            }
        }
    };

    describe('Magic System Archetypal Looms', () => {
        it('EsperLoom should define FF6-style Esper/Magicite system', () => {
            expect(EsperLoomDef.name).toBe('EsperLoom');
            expect(EsperLoomDef.tags).toContain('ff6');
            expect(EsperLoomDef.tags).toContain('archetypal');
            expect(EsperLoomDef.produces).toEqual(['magicSystem']);
            expect(EsperLoomDef.consumes).toEqual(['world', 'classes']);
            
            // Verify pattern includes FF6 archetypal elements
            const mockTapestry = { get: (key: string) => null };
            const pattern = EsperLoomDef.pattern(mockSettings, mockTapestry as any);
            expect(pattern).toContain('ARCHETYPAL PATTERN - FF6 ESPER SYSTEM');
            expect(pattern).toContain('Ifrit');
            expect(pattern).toContain('Shiva');
            expect(pattern).toContain('Ramuh');
            expect(pattern).toContain('Bahamut');
            expect(pattern).toContain('learning rates');
            expect(pattern).toContain('stat bonuses');
        });

        it('PsiLoom should define Earthbound-style PSI system', () => {
            expect(PsiLoomDef.name).toBe('PsiLoom');
            expect(PsiLoomDef.tags).toContain('earthbound');
            expect(PsiLoomDef.tags).toContain('archetypal');
            expect(PsiLoomDef.produces).toEqual(['psiSystem']);
            
            const mockTapestry = { get: (key: string) => null };
            const pattern = PsiLoomDef.pattern(mockSettings, mockTapestry as any);
            expect(pattern).toContain('ARCHETYPAL PATTERN - EARTHBOUND PSI SYSTEM');
            expect(pattern).toContain('α (Alpha)');
            expect(pattern).toContain('β (Beta)');
            expect(pattern).toContain('γ (Gamma)');
            expect(pattern).toContain('Ω (Omega)');
            expect(pattern).toContain('PK Fire');
            expect(pattern).toContain('PK Thunder');
            expect(pattern).toContain('Lifeup');
            expect(pattern).toContain('PP (Psychic Points)');
        });

        it('ElementalWheelLoom should define classic elemental system', () => {
            expect(ElementalWheelLoomDef.name).toBe('ElementalWheelLoom');
            expect(ElementalWheelLoomDef.tags).toContain('classic-rpg');
            expect(ElementalWheelLoomDef.produces).toEqual(['elementalSystem']);
            
            const pattern = ElementalWheelLoomDef.pattern(mockSettings);
            expect(pattern).toContain('Fire, Ice, Lightning, Earth, Water, Wind');
            expect(pattern).toContain('Holy/Light, Dark/Shadow');
            expect(pattern).toContain('Weakness chains');
            expect(pattern).toContain('absorption');
        });
    });

    describe('Character Progression Archetypal Looms', () => {
        it('MateriaLoom should define FF7-style socketed system', () => {
            expect(MateriaLoomDef.name).toBe('MateriaLoom');
            expect(MateriaLoomDef.tags).toContain('ff7');
            expect(MateriaLoomDef.produces).toEqual(['materiaProgression']);
            expect(MateriaLoomDef.consumes).toEqual(['classes', 'magicSystem']);
            
            const mockTapestry = { get: (key: string) => null };
            const pattern = MateriaLoomDef.pattern(mockSettings, mockTapestry as any);
            expect(pattern).toContain('ARCHETYPAL PATTERN - FF7 MATERIA SYSTEM');
            expect(pattern).toContain('Socketed equipment');
            expect(pattern).toContain('Magic, Summon, Command, Support, Independent');
            expect(pattern).toContain('AP growth system');
            expect(pattern).toContain('Linked Materia');
        });

        it('DualTechLoom should define Chrono Trigger combination attacks', () => {
            expect(DualTechLoomDef.name).toBe('DualTechLoom');
            expect(DualTechLoomDef.tags).toContain('chrono-trigger');
            expect(DualTechLoomDef.produces).toEqual(['dualTechs']);
            expect(DualTechLoomDef.consumes).toEqual(['classes', 'abilities']);
            
            const mockTapestry = { get: (key: string) => null };
            const pattern = DualTechLoomDef.pattern(mockSettings, mockTapestry as any);
            expect(pattern).toContain('ARCHETYPAL PATTERN - CHRONO TRIGGER TECHS');
            expect(pattern).toContain('X-Strike');
            expect(pattern).toContain('Ice Sword');
            expect(pattern).toContain('Delta Force');
            expect(pattern).toContain('Grand Dream');
            expect(pattern).toContain('Fire + Sword = Flame Sword');
        });
    });

    describe('Combat System Archetypal Looms', () => {
        it('AtbLoom should define Active Time Battle system', () => {
            expect(AtbLoomDef.name).toBe('AtbLoom');
            expect(AtbLoomDef.tags).toContain('ff4-ff6');
            expect(AtbLoomDef.produces).toEqual(['atbCombat']);
            
            const pattern = AtbLoomDef.pattern(mockSettings);
            expect(pattern).toContain('ARCHETYPAL PATTERN - FF4/FF6 ATB SYSTEM');
            expect(pattern).toContain('Real-time charging ATB bars');
            expect(pattern).toContain('Speed/Agility');
            expect(pattern).toContain('casting times');
            expect(pattern).toContain('Haste/Slow');
            expect(pattern).toContain('Wait (paused during menus)');
        });

        it('RingMenuLoom should define Secret of Mana interface', () => {
            expect(RingMenuLoomDef.name).toBe('RingMenuLoom');
            expect(RingMenuLoomDef.tags).toContain('secret-of-mana');
            expect(RingMenuLoomDef.produces).toEqual(['ringMenuCombat']);
            expect(RingMenuLoomDef.consumes).toEqual(['abilities', 'items']);
            
            const mockTapestry = { get: (key: string) => null };
            const pattern = RingMenuLoomDef.pattern(mockSettings, mockTapestry as any);
            expect(pattern).toContain('ARCHETYPAL PATTERN - SECRET OF MANA RING SYSTEM');
            expect(pattern).toContain('Radial ring menus');
            expect(pattern).toContain('Weapon charge meters');
            expect(pattern).toContain('Cooperative multiplayer');
            expect(pattern).toContain('3 players');
        });

        it('StatusAilmentLoom should define classic RPG status effects', () => {
            expect(StatusAilmentLoomDef.name).toBe('StatusAilmentLoom');
            expect(StatusAilmentLoomDef.tags).toContain('classic-rpg');
            expect(StatusAilmentLoomDef.produces).toEqual(['statusEffects']);
            
            const pattern = StatusAilmentLoomDef.pattern(mockSettings);
            expect(pattern).toContain('ARCHETYPAL PATTERN - CLASSIC STATUS EFFECTS');
            expect(pattern).toContain('Poison, Sleep, Paralysis, Confusion');
            expect(pattern).toContain('Haste, Protect, Shell, Regen');
            expect(pattern).toContain('Diamondize, Mushroomization');
            expect(pattern).toContain('15-20 status effects');
        });
    });

    describe('World Event Archetypal Looms', () => {
        it('TimeTravelLoom should define Chrono Trigger timeline system', () => {
            expect(TimeTravelLoomDef.name).toBe('TimeTravelLoom');
            expect(TimeTravelLoomDef.tags).toContain('chrono-trigger');
            expect(TimeTravelLoomDef.produces).toEqual(['timelineEvents']);
            expect(TimeTravelLoomDef.consumes).toEqual(['world', 'history']);
            
            const mockTapestry = { get: (key: string) => null };
            const pattern = TimeTravelLoomDef.pattern(mockSettings, mockTapestry as any);
            expect(pattern).toContain('ARCHETYPAL PATTERN - CHRONO TRIGGER TIME PERIODS');
            expect(pattern).toContain('Prehistoric (65M BC)');
            expect(pattern).toContain('Ancient (12K BC)');
            expect(pattern).toContain('Present (1000 AD)');
            expect(pattern).toContain('Future (1999 AD, 2300 AD)');
            expect(pattern).toContain('Causal relationships');
            expect(pattern).toContain('Butterfly effect');
        });

        it('ApocalypseLoom should define FF6 World of Ruin system', () => {
            expect(ApocalypseLoomDef.name).toBe('ApocalypseLoom');
            expect(ApocalypseLoomDef.tags).toContain('ff6');
            expect(ApocalypseLoomDef.produces).toEqual(['apocalypseEvents']);
            expect(ApocalypseLoomDef.consumes).toEqual(['world', 'factions', 'npcs']);
            
            const mockTapestry = { get: (key: string) => null };
            const pattern = ApocalypseLoomDef.pattern(mockSettings, mockTapestry as any);
            expect(pattern).toContain('ARCHETYPAL PATTERN - FF6 WORLD OF RUIN');
            expect(pattern).toContain('World of Balance');
            expect(pattern).toContain('World of Ruin');
            expect(pattern).toContain('Continents shattered into islands');
            expect(pattern).toContain('Party members scattered');
            expect(pattern).toContain('Non-linear exploration');
        });
    });

    describe('Loom Verification Functions', () => {
        it('EsperLoom verification should enforce FF6 patterns', () => {
            // Test insufficient Espers
            expect(() => {
                EsperLoomDef.verify!({ espers: [] }, mockSettings, {} as any);
            }).toThrow('Insufficient Espers generated');

            // Test missing classic summons
            expect(() => {
                EsperLoomDef.verify!({ 
                    espers: [
                        { name: 'CustomEsper1' },
                        { name: 'CustomEsper2' },
                        { name: 'CustomEsper3' },
                        { name: 'CustomEsper4' },
                        { name: 'CustomEsper5' },
                        { name: 'CustomEsper6' }
                    ] 
                }, mockSettings, {} as any);
            }).toThrow('Missing classic FF6-style summons');

            // Test valid Esper system
            expect(() => {
                EsperLoomDef.verify!({ 
                    espers: [
                        { name: 'Ifrit' },
                        { name: 'Shiva' },
                        { name: 'Ramuh' },
                        { name: 'Bahamut' },
                        { name: 'Carbuncle' },
                        { name: 'Phoenix' }
                    ] 
                }, mockSettings, {} as any);
            }).not.toThrow();
        });

        it('PsiLoom verification should enforce Earthbound patterns', () => {
            // Test insufficient abilities
            expect(() => {
                PsiLoomDef.verify!({ abilities: [] }, mockSettings, {} as any);
            }).toThrow('Insufficient PSI abilities generated');

            // Test missing Greek tiers
            expect(() => {
                PsiLoomDef.verify!({ 
                    abilities: [
                        { name: 'Fire' },
                        { name: 'Ice' },
                        { name: 'Lightning' },
                        { name: 'Heal' },
                        { name: 'Shield' },
                        { name: 'Boost' },
                        { name: 'Drain' },
                        { name: 'Teleport' }
                    ] 
                }, mockSettings, {} as any);
            }).toThrow('Missing Greek letter tier progression');

            // Test valid PSI system
            expect(() => {
                PsiLoomDef.verify!({ 
                    abilities: [
                        { name: 'PK Fire α' },
                        { name: 'PK Fire β' },
                        { name: 'PK Thunder γ' },
                        { name: 'Lifeup Ω' },
                        { name: 'PSI Shield α' },
                        { name: 'Brain Shock β' },
                        { name: 'Teleport γ' },
                        { name: 'PSI Magnet Ω' }
                    ] 
                }, mockSettings, {} as any);
            }).not.toThrow();
        });

        it('DualTechLoom verification should enforce Chrono Trigger patterns', () => {
            // Test insufficient techniques
            expect(() => {
                DualTechLoomDef.verify!([], mockSettings, {} as any);
            }).toThrow('Insufficient combination techniques generated');

            // Test missing dual/triple variety
            expect(() => {
                DualTechLoomDef.verify!([
                    { participantCount: 2 },
                    { participantCount: 2 },
                    { participantCount: 2 },
                    { participantCount: 2 },
                    { participantCount: 2 },
                    { participantCount: 2 },
                    { participantCount: 2 },
                    { participantCount: 2 },
                    { participantCount: 2 },
                    { participantCount: 2 }
                ], mockSettings, {} as any);
            }).toThrow('Missing both Dual and Triple Tech varieties');

            // Test valid technique system
            expect(() => {
                DualTechLoomDef.verify!([
                    { participantCount: 2 }, { participantCount: 2 }, { participantCount: 2 },
                    { participantCount: 2 }, { participantCount: 2 }, { participantCount: 2 },
                    { participantCount: 2 }, { participantCount: 2 }, { participantCount: 2 },
                    { participantCount: 3 }, { participantCount: 3 }
                ], mockSettings, {} as any);
            }).not.toThrow();
        });

        it('AtbLoom verification should enforce ATB system requirements', () => {
            // Test wrong system type
            expect(() => {
                AtbLoomDef.verify!({ systemType: 'turn_based' }, mockSettings, {} as any);
            }).toThrow('Must be ATB system type');

            // Test missing speed-based timing
            expect(() => {
                AtbLoomDef.verify!({ 
                    systemType: 'active_time_battle',
                    speedBasedTiming: false 
                }, mockSettings, {} as any);
            }).toThrow('Missing speed-based timing mechanics');

            // Test valid ATB system
            expect(() => {
                AtbLoomDef.verify!({ 
                    systemType: 'active_time_battle',
                    speedBasedTiming: true 
                }, mockSettings, {} as any);
            }).not.toThrow();
        });

        it('TimeTravelLoom verification should enforce time period requirements', () => {
            // Test insufficient time periods
            expect(() => {
                TimeTravelLoomDef.verify!([
                    { year: 1000 },
                    { year: 2000 }
                ], mockSettings, {} as any);
            }).toThrow('Need at least 4 time periods');

            // Test insufficient time span
            expect(() => {
                TimeTravelLoomDef.verify!([
                    { year: 1000 },
                    { year: 1100 },
                    { year: 1200 },
                    { year: 1300 }
                ], mockSettings, {} as any);
            }).toThrow('Timeline must span from ancient past to far future');

            // Test valid timeline
            expect(() => {
                TimeTravelLoomDef.verify!([
                    { year: -65000000 }, // Prehistoric
                    { year: -12000 },    // Ancient
                    { year: 1000 },      // Medieval
                    { year: 1999 },      // Present
                    { year: 2300 }       // Future
                ], mockSettings, {} as any);
            }).not.toThrow();
        });
    });
});

describe('ArchetypalTapestry Integration', () => {
    const testSettings: LoomSettings = {
        seed: 'integration-test',
        age: 'Test Era',
        controls: {
            worldScale: 5,
            minNodes: 4,
            dangerLevel: 6,
            magicLevel: 7,
            technologyLevel: 4
        }
    };

    it('should create mock archetypal realm with all systems', () => {
        const mockRealm = ArchetypalTapestry.createMockArchetypalRealm(testSettings);
        
        // Verify core world structure
        expect(mockRealm.settings).toEqual(testSettings);
        expect(mockRealm.world).toBeDefined();
        expect(mockRealm.world.nodes).toHaveLength(3);
        expect(mockRealm.world.edges).toHaveLength(2);
        
        // Verify factions
        expect(mockRealm.factions).toHaveLength(2);
        expect(mockRealm.factions[0].archetype).toBe('empire');
        expect(mockRealm.factions[1].archetype).toBe('rebellion');
        
        // Verify classes
        expect(mockRealm.classes).toHaveLength(2);
        expect(mockRealm.classes[0].name).toBe('Warrior');
        expect(mockRealm.classes[1].name).toBe('Mage');
        
        // Verify magic system (Esper)
        expect(mockRealm.magicSystem).toBeDefined();
        expect(mockRealm.magicSystem.systemType).toBe('esper_magicite');
        expect(mockRealm.magicSystem.espers).toHaveLength(1);
        expect(mockRealm.magicSystem.espers[0].name).toBe('Ifrit');
        expect(mockRealm.magicSystem.espers[0].element).toBe('fire');
        
        // Verify combat system (ATB)
        expect(mockRealm.atbCombat).toBeDefined();
        expect(mockRealm.atbCombat.systemType).toBe('active_time_battle');
        expect(mockRealm.atbCombat.speedBasedTiming).toBe(true);
        
        // Verify dual techs
        expect(mockRealm.dualTechs).toHaveLength(1);
        expect(mockRealm.dualTechs[0].name).toBe('X-Strike');
        expect(mockRealm.dualTechs[0].participantCount).toBe(2);
        
        // Verify status effects
        expect(mockRealm.statusEffects).toHaveLength(1);
        expect(mockRealm.statusEffects[0].name).toBe('Poison');
        expect(mockRealm.statusEffects[0].category).toBe('negative');
        
        // Verify elemental system
        expect(mockRealm.elementalSystem).toBeDefined();
        expect(mockRealm.elementalSystem.elements).toHaveLength(3);
        expect(mockRealm.elementalSystem.coreElements).toEqual(['fire', 'ice', 'lightning']);
    });

    it('should have proper archetypal system relationships', () => {
        const mockRealm = ArchetypalTapestry.createMockArchetypalRealm(testSettings);
        
        // Magic system should reference elemental system
        const fireEsper = mockRealm.magicSystem.espers.find((e: any) => e.element === 'fire');
        expect(fireEsper).toBeDefined();
        
        const fireElement = mockRealm.elementalSystem.elements.find((e: any) => e.id === 'fire');
        expect(fireElement).toBeDefined();
        
        // Combat system should reference status effects
        expect(mockRealm.atbCombat.actionModes).toContain('active');
        expect(mockRealm.atbCombat.actionModes).toContain('wait');
        
        // Status effects should have proper cure conditions
        const poisonEffect = mockRealm.statusEffects.find((s: any) => s.name === 'Poison');
        expect(poisonEffect.cureConditions).toContain('antidote');
        expect(poisonEffect.cureConditions).toContain('esuna');
    });

    it('should validate all archetypal schemas', async () => {
        const mockRealm = ArchetypalTapestry.createMockArchetypalRealm(testSettings);
        
        // Basic validation - ensure all expected properties exist
        expect(mockRealm.magicSystem).toBeDefined();
        expect(mockRealm.atbCombat).toBeDefined();
        expect(mockRealm.dualTechs).toBeDefined();
        expect(mockRealm.statusEffects).toBeDefined();
        expect(mockRealm.elementalSystem).toBeDefined();
        
        // Validate structure
        expect(mockRealm.magicSystem.systemType).toBe('esper_magicite');
        expect(mockRealm.atbCombat.systemType).toBe('active_time_battle');
        expect(Array.isArray(mockRealm.dualTechs)).toBe(true);
        expect(Array.isArray(mockRealm.statusEffects)).toBe(true);
        expect(mockRealm.elementalSystem.elements).toBeDefined();
    });
});

describe('Archetypal Pattern Fidelity', () => {
    /**
     * These tests verify that the archetypal patterns maintain fidelity
     * to their source games' core mechanics and design principles.
     */
    
    it('should maintain FF6 Esper system fidelity', () => {
        const mockTapestry = { get: (key: string) => null };
        const pattern = EsperLoomDef.pattern({
            seed: 'ff6-test',
            age: 'World of Balance',
            controls: { magicLevel: 9, technologyLevel: 2, dangerLevel: 7, worldScale: 6, minNodes: 4 }
        }, mockTapestry as any);
        
        // Core FF6 elements must be present
        expect(pattern).toContain('8-12 Espers');
        expect(pattern).toContain('learning rates');
        expect(pattern).toContain('x1 to x10 multiplier');
        expect(pattern).toContain('stat bonuses when equipped during level up');
        expect(pattern).toContain('Ifrit (Fire), Shiva (Ice), Ramuh (Lightning), Bahamut (Non-elemental)');
    });
    
    it('should maintain Chrono Trigger time travel fidelity', () => {
        const mockTapestry = { get: (key: string) => null };
        const pattern = TimeTravelLoomDef.pattern({
            seed: 'chrono-test',
            age: 'Temporal Nexus',
            controls: { magicLevel: 6, technologyLevel: 5, dangerLevel: 8, worldScale: 7, minNodes: 5 }
        }, mockTapestry as any);
        
        // Core Chrono Trigger elements must be present
        expect(pattern).toContain('65M BC'); // Prehistoric
        expect(pattern).toContain('12K BC'); // Ancient
        expect(pattern).toContain('600 AD'); // Middle Ages
        expect(pattern).toContain('1000 AD'); // Present
        expect(pattern).toContain('1999 AD, 2300 AD'); // Future
        expect(pattern).toContain('Actions in past affect future');
        expect(pattern).toContain('Multiple endings');
    });
    
    it('should maintain Secret of Mana ring menu fidelity', () => {
        const mockTapestry = { get: (key: string) => null };
        const pattern = RingMenuLoomDef.pattern({
            seed: 'mana-test',
            age: 'Age of Mana',
            controls: { magicLevel: 7, technologyLevel: 3, dangerLevel: 6, worldScale: 5, minNodes: 4 }
        }, mockTapestry as any);
        
        // Core Secret of Mana elements must be present
        expect(pattern).toContain('Radial ring menus');
        expect(pattern).toContain('pause-for-menu mechanics');
        expect(pattern).toContain('Weapon charge meters');
        expect(pattern).toContain('up to 3 players');
        expect(pattern).toContain('timing and patience rewarded');
        expect(pattern).toContain('Weapon skill levels');
    });
    
    it('should maintain Earthbound PSI system fidelity', () => {
        const mockTapestry = { get: (key: string) => null };
        const pattern = PsiLoomDef.pattern({
            seed: 'earthbound-test',
            age: 'Modern Psychic Era',
            controls: { magicLevel: 6, technologyLevel: 8, dangerLevel: 5, worldScale: 4, minNodes: 3 }
        }, mockTapestry as any);
        
        // Core Earthbound elements must be present
        expect(pattern).toContain('α (Alpha), β (Beta), γ (Gamma), Ω (Omega)');
        expect(pattern).toContain('PK Fire, PK Thunder');
        expect(pattern).toContain('Lifeup');
        expect(pattern).toContain('PSI Shield');
        expect(pattern).toContain('PP (Psychic Points)');
        expect(pattern).toContain('Modern/sci-fi flavor');
        expect(pattern).toContain('Teleport, PSI Magnet');
    });
});