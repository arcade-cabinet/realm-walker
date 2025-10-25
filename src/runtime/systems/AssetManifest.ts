/**
 * AssetManifest - Asset management and validation system
 * Tracks all game assets and validates their existence
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AssetEntry {
  id: string;
  type: 'model' | 'texture' | 'audio' | 'scene' | 'dialogue';
  path: string;
  size?: number;
  lastModified?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface AssetManifest {
  version: string;
  generated: number;
  assets: AssetEntry[];
  stats: {
    totalAssets: number;
    byType: Record<string, number>;
    totalSize: number;
  };
}

export class AssetManifestManager {
  private manifest: AssetManifest | null = null;
  private assetMap: Map<string, AssetEntry> = new Map();
  private assetsDirectory: string;

  constructor(assetsDirectory: string = './assets') {
    this.assetsDirectory = assetsDirectory;
  }

  /**
   * Generate asset manifest by scanning directories
   */
  generate(options: {
    includeSize?: boolean;
    includeTags?: boolean;
    extensions?: Record<string, string>;
  } = {}): AssetManifest {
    const {
      includeSize = true,
      extensions = {
        '.glb': 'model',
        '.gltf': 'model',
        '.png': 'texture',
        '.jpg': 'texture',
        '.jpeg': 'texture',
        '.mp3': 'audio',
        '.ogg': 'audio',
        '.rwmd': 'scene',
        '.json': 'dialogue'
      }
    } = options;

    const assets: AssetEntry[] = [];
    const stats = {
      totalAssets: 0,
      byType: {} as Record<string, number>,
      totalSize: 0
    };

    // Scan directory recursively
    this.scanDirectory(this.assetsDirectory, '', assets, extensions, includeSize, stats);

    this.manifest = {
      version: '1.0.0',
      generated: Date.now(),
      assets,
      stats: {
        ...stats,
        totalAssets: assets.length
      }
    };

    // Build asset map for fast lookup
    this.assetMap.clear();
    for (const asset of assets) {
      this.assetMap.set(asset.id, asset);
    }

    return this.manifest;
  }

  /**
   * Recursively scan directory for assets
   */
  private scanDirectory(
    basePath: string,
    relativePath: string,
    assets: AssetEntry[],
    extensions: Record<string, string>,
    includeSize: boolean,
    stats: { byType: Record<string, number>; totalSize: number }
  ): void {
    const fullPath = path.join(basePath, relativePath);

    if (!fs.existsSync(fullPath)) {
      return;
    }

    const items = fs.readdirSync(fullPath);

    for (const item of items) {
      const itemPath = path.join(relativePath, item);
      const itemFullPath = path.join(basePath, itemPath);
      const stat = fs.statSync(itemFullPath);

      if (stat.isDirectory()) {
        // Recurse into subdirectories
        this.scanDirectory(basePath, itemPath, assets, extensions, includeSize, stats);
      } else {
        const ext = path.extname(item).toLowerCase();
        const type = extensions[ext];

        if (type) {
          const id = itemPath.replace(/\\/g, '/'); // Normalize path separators
          const entry: AssetEntry = {
            id,
            type: type as any,
            path: itemFullPath
          };

          if (includeSize) {
            entry.size = stat.size;
            entry.lastModified = stat.mtimeMs;
            stats.totalSize += stat.size;
          }

          assets.push(entry);

          // Update stats
          stats.byType[type] = (stats.byType[type] || 0) + 1;
        }
      }
    }
  }

  /**
   * Load manifest from JSON file
   */
  load(filepath: string): AssetManifest {
    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      this.manifest = JSON.parse(content);

      // Rebuild asset map
      this.assetMap.clear();
      for (const asset of this.manifest!.assets) {
        this.assetMap.set(asset.id, asset);
      }

      console.log(`Loaded asset manifest: ${this.manifest!.assets.length} assets`);
      return this.manifest!;
    } catch (error) {
      throw new Error(`Failed to load manifest: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Save manifest to JSON file
   */
  save(filepath: string): void {
    if (!this.manifest) {
      throw new Error('No manifest to save. Call generate() first.');
    }

    try {
      fs.writeFileSync(filepath, JSON.stringify(this.manifest, null, 2), 'utf-8');
      console.log(`Saved asset manifest to ${filepath}`);
    } catch (error) {
      throw new Error(`Failed to save manifest: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if an asset exists in the manifest
   */
  hasAsset(id: string): boolean {
    return this.assetMap.has(id);
  }

  /**
   * Get asset entry by ID
   */
  getAsset(id: string): AssetEntry | undefined {
    return this.assetMap.get(id);
  }

  /**
   * Get all assets of a specific type
   */
  getAssetsByType(type: string): AssetEntry[] {
    if (!this.manifest) {
      return [];
    }

    return this.manifest.assets.filter(asset => asset.type === type);
  }

  /**
   * Validate that all assets in manifest exist on disk
   */
  validate(): { valid: boolean; missing: string[]; errors: string[] } {
    if (!this.manifest) {
      return { valid: false, missing: [], errors: ['No manifest loaded'] };
    }

    const missing: string[] = [];
    const errors: string[] = [];

    for (const asset of this.manifest.assets) {
      if (!fs.existsSync(asset.path)) {
        missing.push(asset.id);
      }
    }

    const valid = missing.length === 0 && errors.length === 0;

    return { valid, missing, errors };
  }

  /**
   * Get assets with specific tags
   */
  getAssetsByTags(tags: string[]): AssetEntry[] {
    if (!this.manifest) {
      return [];
    }

    return this.manifest.assets.filter(asset => {
      if (!asset.tags) return false;
      return tags.every(tag => asset.tags!.includes(tag));
    });
  }

  /**
   * Add tags to an asset
   */
  tagAsset(id: string, tags: string[]): void {
    const asset = this.assetMap.get(id);
    if (asset) {
      asset.tags = [...new Set([...(asset.tags || []), ...tags])];
    }
  }

  /**
   * Get manifest statistics
   */
  getStats(): AssetManifest['stats'] | null {
    return this.manifest?.stats || null;
  }

  /**
   * Generate a summary report
   */
  generateReport(): string {
    if (!this.manifest) {
      return 'No manifest loaded';
    }

    const lines: string[] = [];
    lines.push('=== Asset Manifest Report ===');
    lines.push(`Generated: ${new Date(this.manifest.generated).toLocaleString()}`);
    lines.push(`Version: ${this.manifest.version}`);
    lines.push('');
    lines.push('Statistics:');
    lines.push(`  Total Assets: ${this.manifest.stats.totalAssets}`);
    lines.push(`  Total Size: ${this.formatBytes(this.manifest.stats.totalSize)}`);
    lines.push('');
    lines.push('By Type:');

    for (const [type, count] of Object.entries(this.manifest.stats.byType)) {
      const percentage = ((count / this.manifest.stats.totalAssets) * 100).toFixed(1);
      lines.push(`  ${type}: ${count} (${percentage}%)`);
    }

    return lines.join('\n');
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get current manifest
   */
  getManifest(): AssetManifest | null {
    return this.manifest;
  }
}
