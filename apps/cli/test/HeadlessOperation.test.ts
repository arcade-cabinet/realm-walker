import { fc } from '@fast-check/vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Headless Operation', () => {
  const cliPath = path.resolve(__dirname, '../src/index.ts');
  const testOutputDir = path.resolve(__dirname, '../test-output');

  // Ensure test output directory exists
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
  }

  it('should run headless simulation without graphics dependencies', async () => {
    // Test that CLI can run simulation in pure headless mode
    const result = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 3 --report-interval 1`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    expect(result).toContain('Starting RealmWalker Headless Simulation');
    expect(result).toContain('Using mock realm data');
    expect(result).toContain('Core ECS World initialized');
    expect(result).toContain('Headless simulation completed successfully');
    
    // Verify no graphics-related errors or dependencies
    expect(result).not.toContain('WebGL');
    expect(result).not.toContain('Canvas');
    expect(result).not.toContain('DOM');
    expect(result).not.toContain('window');
    expect(result).not.toContain('document');
  });

  it('should support configurable simulation parameters', async () => {
    // Test different tick counts
    const result5Ticks = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 5 --report-interval 2`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    const result10Ticks = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 10 --report-interval 3`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    // Verify different configurations produce different outputs
    expect(result5Ticks).toContain('5 ticks');
    expect(result10Ticks).toContain('10 ticks');
    
    // Both should complete successfully
    expect(result5Ticks).toContain('Headless simulation completed successfully');
    expect(result10Ticks).toContain('Headless simulation completed successfully');
  });

  it('should provide detailed state verification reports', async () => {
    const result = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 4 --verbose`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    // Verify detailed reporting
    expect(result).toContain('Tick 1/4');
    expect(result).toContain('Tick 2/4');
    expect(result).toContain('Tick 3/4');
    expect(result).toContain('Tick 4/4');
    expect(result).toContain('Entities:');
    expect(result).toContain('Entity');
    expect(result).toContain('pos(');
    expect(result).toContain('AI: active');
  });

  it('should verify deterministic behavior across multiple runs', async () => {
    const result = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 5 --verify-determinism`,
      { encoding: 'utf-8', timeout: 60000 }
    );

    expect(result).toContain('Running determinism verification');
    expect(result).toContain('Determinism Run 1');
    expect(result).toContain('Determinism Run 2');
    expect(result).toContain('Determinism Run 3');
    expect(result).toContain('DETERMINISM VERIFIED: All simulation runs produced identical results');
  });

  // Property-based test for headless operation consistency
  fc.it('property: headless simulation produces consistent results for same parameters', 
    fc.record({
      ticks: fc.integer({ min: 1, max: 10 }),
      reportInterval: fc.integer({ min: 1, max: 5 })
    }),
    async ({ ticks, reportInterval }) => {
      // Run simulation twice with same parameters
      const command = `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks ${ticks} --report-interval ${reportInterval}`;
      
      const result1 = execSync(command, { encoding: 'utf-8', timeout: 30000 });
      const result2 = execSync(command, { encoding: 'utf-8', timeout: 30000 });

      // Both should complete successfully
      expect(result1).toContain('Headless simulation completed successfully');
      expect(result2).toContain('Headless simulation completed successfully');

      // Both should process the same number of ticks
      expect(result1).toContain(`${ticks} ticks`);
      expect(result2).toContain(`${ticks} ticks`);

      // Extract entity counts from both runs
      const entityCountRegex = /Entities: (\d+)/g;
      const counts1 = [...result1.matchAll(entityCountRegex)].map(m => parseInt(m[1]));
      const counts2 = [...result2.matchAll(entityCountRegex)].map(m => parseInt(m[1]));

      // Entity counts should be consistent across runs
      expect(counts1).toEqual(counts2);
    },
    { numRuns: 20 }
  );

  // Property-based test for simulation configuration validation
  fc.it('property: simulation configuration parameters are respected',
    fc.record({
      ticks: fc.integer({ min: 1, max: 15 }),
      reportInterval: fc.integer({ min: 1, max: 8 })
    }),
    async ({ ticks, reportInterval }) => {
      const result = execSync(
        `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks ${ticks} --report-interval ${reportInterval}`,
        { encoding: 'utf-8', timeout: 30000 }
      );

      // Should complete successfully
      expect(result).toContain('Headless simulation completed successfully');

      // Should report the correct configuration
      expect(result).toContain(`${ticks} ticks`);
      expect(result).toContain(`report every ${reportInterval} ticks`);

      // Count actual tick reports
      const tickReports = result.match(/📊 Tick \d+\/\d+:/g) || [];
      const expectedReports = Math.ceil(ticks / reportInterval);
      
      // Should have approximately the expected number of reports (allowing for final tick)
      expect(tickReports.length).toBeGreaterThanOrEqual(expectedReports);
      expect(tickReports.length).toBeLessThanOrEqual(ticks);
    },
    { numRuns: 25 }
  );

  it('should handle error conditions gracefully', async () => {
    // Test missing realm file without mock flag
    try {
      execSync(
        `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --ticks 1`,
        { encoding: 'utf-8', timeout: 10000 }
      );
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.stdout || error.stderr).toContain('realm.json not found');
    }
  });

  it('should validate complete headless operation without external dependencies', async () => {
    // Test that simulation runs without any graphics, DOM, or browser dependencies
    const result = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 3`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    // Should complete successfully
    expect(result).toContain('Headless simulation completed successfully');

    // Should not reference any graphics-related concepts
    const graphicsTerms = [
      'WebGL', 'Canvas', 'DOM', 'window', 'document', 'browser',
      'render', 'draw', 'pixel', 'screen', 'display', 'visual'
    ];

    graphicsTerms.forEach(term => {
      expect(result.toLowerCase()).not.toContain(term.toLowerCase());
    });

    // Should focus on logic and state
    expect(result).toContain('ECS World');
    expect(result).toContain('Entity');
    expect(result).toContain('position');
    expect(result).toContain('AI');
  });
});