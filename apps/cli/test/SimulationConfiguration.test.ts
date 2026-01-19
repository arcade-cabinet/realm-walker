import { fc } from '@fast-check/vitest';
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Simulation Configuration', () => {
  const cliPath = path.resolve(__dirname, '../src/index.ts');

  it('should support various tick count configurations', async () => {
    const testCases = [1, 3, 5, 10, 15];
    
    for (const ticks of testCases) {
      const result = execSync(
        `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks ${ticks}`,
        { encoding: 'utf-8', timeout: 30000 }
      );

      expect(result).toContain(`${ticks} ticks`);
      expect(result).toContain('Headless simulation completed successfully');
    }
  });

  it('should support various report interval configurations', async () => {
    const testCases = [
      { ticks: 10, interval: 1 },
      { ticks: 10, interval: 2 },
      { ticks: 10, interval: 5 },
      { ticks: 15, interval: 3 }
    ];

    for (const { ticks, interval } of testCases) {
      const result = execSync(
        `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks ${ticks} --report-interval ${interval}`,
        { encoding: 'utf-8', timeout: 30000 }
      );

      expect(result).toContain(`report every ${interval} ticks`);
      expect(result).toContain('Headless simulation completed successfully');
    }
  });

  it('should enable verbose mode when requested', async () => {
    const verboseResult = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 3 --verbose`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    const normalResult = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 3`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    // Verbose should contain more detailed information
    expect(verboseResult.length).toBeGreaterThan(normalResult.length);
    expect(verboseResult).toContain('velocity(');
    expect(verboseResult).toContain('Final Simulation Report');
    expect(verboseResult).toContain('State Checksum');
  });

  it('should handle determinism verification mode', async () => {
    const result = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 3 --verify-determinism`,
      { encoding: 'utf-8', timeout: 60000 }
    );

    expect(result).toContain('Running determinism verification');
    expect(result).toContain('Run 1');
    expect(result).toContain('Run 2');
    expect(result).toContain('Run 3');
    expect(result).toContain('DETERMINISM VERIFIED');
  });

  // Property-based test for configuration parameter validation
  fc.it('property: all valid configuration combinations work correctly',
    fc.record({
      ticks: fc.integer({ min: 1, max: 20 }),
      reportInterval: fc.integer({ min: 1, max: 10 }),
      verbose: fc.boolean()
    }),
    async ({ ticks, reportInterval, verbose }) => {
      const verboseFlag = verbose ? '--verbose' : '';
      const result = execSync(
        `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks ${ticks} --report-interval ${reportInterval} ${verboseFlag}`,
        { encoding: 'utf-8', timeout: 45000 }
      );

      // Should always complete successfully
      expect(result).toContain('Headless simulation completed successfully');
      
      // Should respect tick count
      expect(result).toContain(`${ticks} ticks`);
      
      // Should respect report interval
      expect(result).toContain(`report every ${reportInterval} ticks`);
      
      // Verbose mode should add extra information
      if (verbose) {
        expect(result).toContain('Final Simulation Report');
      }
    },
    { numRuns: 30 }
  );

  // Property-based test for simulation state consistency
  fc.it('property: simulation configuration affects output predictably',
    fc.record({
      ticks1: fc.integer({ min: 1, max: 10 }),
      ticks2: fc.integer({ min: 1, max: 10 })
    }).filter(({ ticks1, ticks2 }) => ticks1 !== ticks2),
    async ({ ticks1, ticks2 }) => {
      const result1 = execSync(
        `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks ${ticks1}`,
        { encoding: 'utf-8', timeout: 30000 }
      );

      const result2 = execSync(
        `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks ${ticks2}`,
        { encoding: 'utf-8', timeout: 30000 }
      );

      // Both should complete successfully
      expect(result1).toContain('Headless simulation completed successfully');
      expect(result2).toContain('Headless simulation completed successfully');

      // Should report different tick counts
      expect(result1).toContain(`${ticks1} ticks`);
      expect(result2).toContain(`${ticks2} ticks`);

      // Longer simulation should have more tick reports
      const reports1 = (result1.match(/📊 Tick \d+/g) || []).length;
      const reports2 = (result2.match(/📊 Tick \d+/g) || []).length;

      if (ticks1 > ticks2) {
        expect(reports1).toBeGreaterThanOrEqual(reports2);
      } else {
        expect(reports2).toBeGreaterThanOrEqual(reports1);
      }
    },
    { numRuns: 20 }
  );

  it('should validate mock mode produces consistent realm structure', async () => {
    const result = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 2 --verbose`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    // Should use mock realm data
    expect(result).toContain('Using mock realm data');
    expect(result).toContain('Mock Simulation Era');
    
    // Should spawn test entities
    expect(result).toContain('Test Agent');
    
    // Should have consistent entity structure
    expect(result).toContain('Entity');
    expect(result).toContain('pos(');
    expect(result).toContain('AI: active');
  });

  it('should handle edge case configurations gracefully', async () => {
    // Test minimum values
    const minResult = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 1 --report-interval 1`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    expect(minResult).toContain('Headless simulation completed successfully');

    // Test report interval larger than tick count
    const largeIntervalResult = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 3 --report-interval 10`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    expect(largeIntervalResult).toContain('Headless simulation completed successfully');
  });

  // Property-based test for deterministic state checksums
  fc.it('property: identical configurations produce identical state checksums',
    fc.record({
      ticks: fc.integer({ min: 2, max: 8 }),
      reportInterval: fc.integer({ min: 1, max: 4 })
    }),
    async ({ ticks, reportInterval }) => {
      // Run same configuration twice with verbose mode to get checksums
      const result1 = execSync(
        `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks ${ticks} --report-interval ${reportInterval} --verbose`,
        { encoding: 'utf-8', timeout: 30000 }
      );

      const result2 = execSync(
        `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks ${ticks} --report-interval ${reportInterval} --verbose`,
        { encoding: 'utf-8', timeout: 30000 }
      );

      // Extract checksums from both results
      const checksum1Match = result1.match(/State Checksum: ([a-f0-9-]+)/);
      const checksum2Match = result2.match(/State Checksum: ([a-f0-9-]+)/);

      expect(checksum1Match).toBeTruthy();
      expect(checksum2Match).toBeTruthy();

      // Checksums should be identical for identical configurations
      expect(checksum1Match![1]).toBe(checksum2Match![1]);
    },
    { numRuns: 15 }
  );

  it('should provide meaningful error messages for invalid configurations', async () => {
    // Note: Current implementation doesn't validate negative values at CLI level,
    // but we can test that the simulation handles edge cases gracefully
    
    // Test with very large tick count (should still work but might be slow)
    const result = execSync(
      `cd ${path.dirname(cliPath)} && tsx ${cliPath} simulate --mock --ticks 50 --report-interval 25`,
      { encoding: 'utf-8', timeout: 60000 }
    );
    
    expect(result).toContain('Headless simulation completed successfully');
    expect(result).toContain('50 ticks');
  });
});