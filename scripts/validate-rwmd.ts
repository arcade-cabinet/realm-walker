#!/usr/bin/env node
/**
 * RWMD Validator - CLI tool for validating RWMD scene files
 * Usage: node scripts/validate-rwmd.js <file-or-directory>
 */

import * as fs from 'fs';
import * as path from 'path';
import { RWMDParser } from '../src/runtime/parsers/RWMDParser';

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  sceneId?: string;
  nodeCount?: number;
  slotCount?: number;
}

class RWMDValidator {
  private results: ValidationResult[] = [];

  /**
   * Validate a single RWMD file
   */
  validateFile(filepath: string): ValidationResult {
    const result: ValidationResult = {
      file: filepath,
      valid: true,
      errors: [],
      warnings: []
    };

    // Check file exists
    if (!fs.existsSync(filepath)) {
      result.valid = false;
      result.errors.push('File not found');
      return result;
    }

    // Check file extension
    if (!filepath.endsWith('.rwmd')) {
      result.warnings.push('File does not have .rwmd extension');
    }

    try {
      // Read file
      const content = fs.readFileSync(filepath, 'utf-8');

      // Parse RWMD
      const parsed = RWMDParser.parseString(content);

      // Validate scene structure
      if (!parsed.scene.id) {
        result.errors.push('Scene ID is missing');
        result.valid = false;
      } else {
        result.sceneId = parsed.scene.id;
      }

      if (!parsed.scene.name) {
        result.warnings.push('Scene name is missing');
      }

      // Count elements
      result.nodeCount = parsed.scene.geometry.length;
      result.slotCount = parsed.scene.slots.length;

      // Validate geometry
      for (let i = 0; i < parsed.scene.geometry.length; i++) {
        const geo = parsed.scene.geometry[i];

        if (!geo.type) {
          result.errors.push(`Geometry ${i}: Missing type`);
          result.valid = false;
        }

        if (!geo.dimensions || geo.dimensions.length === 0) {
          result.errors.push(`Geometry ${i}: Missing dimensions`);
          result.valid = false;
        }

        if (geo.dimensions.some(d => isNaN(d))) {
          result.errors.push(`Geometry ${i}: Invalid dimension values`);
          result.valid = false;
        }

        if (!geo.position || geo.position.length !== 3) {
          result.errors.push(`Geometry ${i}: Invalid position`);
          result.valid = false;
        }
      }

      // Validate slots
      for (let i = 0; i < parsed.scene.slots.length; i++) {
        const slot = parsed.scene.slots[i];

        if (!slot.id) {
          result.errors.push(`Slot ${i}: Missing ID`);
          result.valid = false;
        }

        if (!slot.position || slot.position.length !== 3) {
          result.errors.push(`Slot ${i}: Invalid position`);
          result.valid = false;
        }

        if (slot.position.some(p => isNaN(p))) {
          result.errors.push(`Slot ${i}: Invalid position values`);
          result.valid = false;
        }

        if (slot.rotation && slot.rotation.some(r => isNaN(r))) {
          result.errors.push(`Slot ${i}: Invalid rotation values`);
          result.valid = false;
        }

        if (slot.scale && slot.scale.some(s => isNaN(s))) {
          result.errors.push(`Slot ${i}: Invalid scale values`);
          result.valid = false;
        }
      }

      // Validate metadata if present
      if (parsed.metadata) {
        if (parsed.metadata.grid) {
          const grid = parsed.metadata.grid;
          if (typeof grid.width !== 'number' || typeof grid.height !== 'number') {
            result.warnings.push('Grid dimensions are not numbers');
          }
          if (grid.width <= 0 || grid.height <= 0) {
            result.errors.push('Grid dimensions must be positive');
            result.valid = false;
          }
        }
      }

    } catch (error) {
      result.valid = false;
      result.errors.push(`Parse error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Validate all RWMD files in a directory
   */
  validateDirectory(dirpath: string): ValidationResult[] {
    const results: ValidationResult[] = [];

    if (!fs.existsSync(dirpath)) {
      console.error(`Directory not found: ${dirpath}`);
      return results;
    }

    const files = this.findRWMDFiles(dirpath);

    for (const file of files) {
      const result = this.validateFile(file);
      results.push(result);
    }

    return results;
  }

  /**
   * Recursively find all RWMD files
   */
  private findRWMDFiles(dirpath: string): string[] {
    const files: string[] = [];

    const items = fs.readdirSync(dirpath);

    for (const item of items) {
      const fullPath = path.join(dirpath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.findRWMDFiles(fullPath));
      } else if (item.endsWith('.rwmd')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Print validation results
   */
  printResults(results: ValidationResult[]): void {
    console.log('\n=== RWMD Validation Results ===\n');

    let totalValid = 0;
    let totalInvalid = 0;

    for (const result of results) {
      const status = result.valid ? '✓ VALID' : '✗ INVALID';
      const color = result.valid ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';

      console.log(`${color}${status}${reset} ${result.file}`);

      if (result.sceneId) {
        console.log(`  Scene ID: ${result.sceneId}`);
      }

      if (result.nodeCount !== undefined) {
        console.log(`  Geometry: ${result.nodeCount} nodes`);
      }

      if (result.slotCount !== undefined) {
        console.log(`  Slots: ${result.slotCount} slots`);
      }

      if (result.errors.length > 0) {
        console.log('  Errors:');
        result.errors.forEach(err => console.log(`    - ${err}`));
      }

      if (result.warnings.length > 0) {
        console.log('  Warnings:');
        result.warnings.forEach(warn => console.log(`    - ${warn}`));
      }

      console.log('');

      if (result.valid) {
        totalValid++;
      } else {
        totalInvalid++;
      }
    }

    console.log('=== Summary ===');
    console.log(`Valid:   ${totalValid}`);
    console.log(`Invalid: ${totalInvalid}`);
    console.log(`Total:   ${results.length}\n`);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/validate-rwmd.js <file-or-directory>');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/validate-rwmd.js scenes/rwmd/village_square.rwmd');
    console.log('  node scripts/validate-rwmd.js scenes/rwmd/');
    process.exit(1);
  }

  const target = args[0];
  const validator = new RWMDValidator();

  const stat = fs.statSync(target);
  let results: ValidationResult[];

  if (stat.isDirectory()) {
    console.log(`Validating RWMD files in directory: ${target}`);
    results = validator.validateDirectory(target);
  } else {
    console.log(`Validating RWMD file: ${target}`);
    results = [validator.validateFile(target)];
  }

  validator.printResults(results);

  // Exit with error code if any files are invalid
  const hasInvalid = results.some(r => !r.valid);
  process.exit(hasInvalid ? 1 : 0);
}

export { RWMDValidator, ValidationResult };
