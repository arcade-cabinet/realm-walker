/**
 * Asset Import Workflow
 * Scans directories for GLB files and Meshy prompts, correlates them,
 * and imports into the asset library with proper organization
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AnthropicClient } from '../AnthropicClient';
import { AssetLibrary } from '../AssetLibrary';

export interface AssetImportConfig {
  sourceDirectory: string;
  targetAssetDirectory: string;
  assetLibrary: AssetLibrary;
  anthropicClient: AnthropicClient;
  filePatterns?: {
    glb?: RegExp;
    metadata?: RegExp;
  };
}

export interface ImportedAsset {
  originalPath: string;
  newPath: string;
  assetId: string;
  metadata: {
    prompt?: string;
    name: string;
    tags: string[];
    description?: string;
  };
}

export interface ImportProgress {
  stage: 'scanning' | 'correlating' | 'importing' | 'organizing' | 'complete';
  processed: number;
  total: number;
  message: string;
}

export class AssetImportWorkflow {
  private config: AssetImportConfig;
  private glbPattern: RegExp;
  private metadataPattern: RegExp;

  constructor(config: AssetImportConfig) {
    this.config = config;
    this.glbPattern = config.filePatterns?.glb || /\.glb$/i;
    this.metadataPattern = config.filePatterns?.metadata || /\.(txt|json|md)$/i;
  }

  /**
   * Execute complete import workflow
   */
  async execute(
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportedAsset[]> {
    onProgress?.({
      stage: 'scanning',
      processed: 0,
      total: 0,
      message: 'Scanning directory for assets...'
    });

    // Step 1: Scan directory recursively
    const { glbFiles, metadataFiles } = await this.scanDirectory(
      this.config.sourceDirectory
    );

    console.log(`Found ${glbFiles.length} GLB files and ${metadataFiles.length} metadata files`);

    onProgress?.({
      stage: 'correlating',
      processed: 0,
      total: glbFiles.length,
      message: 'Correlating GLBs with metadata using AI...'
    });

    // Step 2: Read metadata files
    const assetMetadata = await this.readMetadataFiles(metadataFiles);

    // Step 3: Use AI to correlate GLBs with metadata
    const correlations = await this.config.anthropicClient.correlateAssets(
      assetMetadata,
      glbFiles
    );

    console.log(`AI correlated ${correlations.length} assets`);

    onProgress?.({
      stage: 'importing',
      processed: 0,
      total: correlations.length,
      message: 'Importing assets into library...'
    });

    // Step 4: Import each correlated asset
    const imported: ImportedAsset[] = [];

    for (let i = 0; i < correlations.length; i++) {
      const correlation = correlations[i];

      onProgress?.({
        stage: 'importing',
        processed: i,
        total: correlations.length,
        message: `Importing: ${correlation.metadata.name || path.basename(correlation.glbPath)}`
      });

      try {
        const importedAsset = await this.importAsset(correlation);
        imported.push(importedAsset);
      } catch (error) {
        console.error(`Failed to import ${correlation.glbPath}:`, error);
      }
    }

    onProgress?.({
      stage: 'organizing',
      processed: imported.length,
      total: imported.length,
      message: 'Organizing imported assets...'
    });

    // Step 5: Organize in shared structure
    await this.organizeAssets(imported);

    onProgress?.({
      stage: 'complete',
      processed: imported.length,
      total: imported.length,
      message: `Import complete! ${imported.length} assets imported.`
    });

    return imported;
  }

  /**
   * Scan directory recursively for GLB and metadata files
   */
  private async scanDirectory(
    dir: string,
    result: {
      glbFiles: Array<{ fileName: string; path: string }>;
      metadataFiles: Array<{ fileName: string; path: string }>;
    } = { glbFiles: [], metadataFiles: [] }
  ): Promise<{
    glbFiles: Array<{ fileName: string; path: string }>;
    metadataFiles: Array<{ fileName: string; path: string }>;
  }> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recurse into subdirectories
        await this.scanDirectory(fullPath, result);
      } else if (entry.isFile()) {
        if (this.glbPattern.test(entry.name)) {
          result.glbFiles.push({
            fileName: entry.name,
            path: fullPath
          });
        } else if (this.metadataPattern.test(entry.name)) {
          result.metadataFiles.push({
            fileName: entry.name,
            path: fullPath
          });
        }
      }
    }

    return result;
  }

  /**
   * Read metadata files and extract content
   */
  private async readMetadataFiles(
    files: Array<{ fileName: string; path: string }>
  ): Promise<Array<{ fileName: string; path: string; content: string }>> {
    const results: Array<{ fileName: string; path: string; content: string }> = [];

    for (const file of files) {
      try {
        const content = await fs.promises.readFile(file.path, 'utf-8');
        results.push({
          fileName: file.fileName,
          path: file.path,
          content: content.substring(0, 10000) // Limit to 10k chars per file
        });
      } catch (error) {
        console.error(`Failed to read ${file.path}:`, error);
      }
    }

    return results;
  }

  /**
   * Import a single asset
   */
  private async importAsset(correlation: {
    glbPath: string;
    metadata: {
      prompt?: string;
      name?: string;
      tags?: string[];
      description?: string;
    };
    confidence: number;
  }): Promise<ImportedAsset> {
    const assetId = `imported_${Date.now()}_${crypto.randomUUID().split('-')[0]}`;
    
    // Generate organized path in target directory
    const category = this.categorizeAsset(correlation.metadata.tags || []);
    const fileName = this.sanitizeFileName(
      correlation.metadata.name || path.basename(correlation.glbPath)
    );
    
    const newPath = path.join(
      this.config.targetAssetDirectory,
      'imported',
      category,
      `${assetId}_${fileName}`
    );

    // Ensure directory exists
    fs.mkdirSync(path.dirname(newPath), { recursive: true });

    // Copy file to new location
    fs.copyFileSync(correlation.glbPath, newPath);

    // Register in asset library
    await this.config.assetLibrary.registerAsset({
      id: assetId,
      type: 'model',
      prompt: correlation.metadata.prompt || correlation.metadata.description || '',
      description: correlation.metadata.description || `Imported from ${correlation.glbPath}`,
      filePath: newPath,
      tags: [
        ...(correlation.metadata.tags || []),
        'imported',
        category,
        `confidence_${Math.round(correlation.confidence * 100)}`
      ],
      metadata: {
        originalPath: correlation.glbPath,
        confidence: correlation.confidence,
        importedAt: Date.now()
      }
    });

    console.log(`Imported asset: ${assetId} (confidence: ${correlation.confidence.toFixed(2)})`);

    return {
      originalPath: correlation.glbPath,
      newPath,
      assetId,
      metadata: {
        prompt: correlation.metadata.prompt,
        name: correlation.metadata.name || fileName,
        tags: correlation.metadata.tags || [],
        description: correlation.metadata.description
      }
    };
  }

  /**
   * Categorize asset based on tags
   */
  private categorizeAsset(tags: string[]): string {
    const categories = {
      character: ['npc', 'character', 'person', 'creature', 'enemy', 'boss'],
      prop: ['prop', 'furniture', 'object', 'item', 'tool', 'weapon'],
      architecture: ['building', 'structure', 'wall', 'door', 'window', 'arch'],
      environment: ['tree', 'rock', 'plant', 'terrain', 'landscape', 'nature'],
      decoration: ['decoration', 'ornament', 'detail', 'embellishment']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (tags.some((tag: string) => keywords.some((kw: string) => tag.toLowerCase().includes(kw)))) {
        return category;
      }
    }

    return 'misc';
  }

  /**
   * Sanitize filename for filesystem
   */
  private sanitizeFileName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
      .substring(0, 100); // Max 100 chars
  }

  /**
   * Organize imported assets (create index, etc.)
   */
  private async organizeAssets(imported: ImportedAsset[]): Promise<void> {
    // Create an import manifest
    const manifest = {
      importedAt: new Date().toISOString(),
      sourceDirectory: this.config.sourceDirectory,
      assetsImported: imported.length,
      assets: imported.map(asset => ({
        id: asset.assetId,
        name: asset.metadata.name,
        originalPath: asset.originalPath,
        newPath: asset.newPath,
        tags: asset.metadata.tags
      }))
    };

    const manifestPath = path.join(
      this.config.targetAssetDirectory,
      'imported',
      `manifest_${Date.now()}.json`
    );

    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`Import manifest saved: ${manifestPath}`);
  }

  /**
   * Get import statistics
   */
  async getImportStats(): Promise<{
    totalImported: number;
    byCategory: Record<string, number>;
    averageConfidence: number;
  }> {
    const stats = this.config.assetLibrary.getStats();
    const importedAssets = await this.getImportedAssets();

    const byCategory: Record<string, number> = {};
    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const asset of importedAssets) {
      // Extract category from tags
      const categoryTag = asset.tags.find((t: string) => 
        ['character', 'prop', 'architecture', 'environment', 'decoration', 'misc'].includes(t)
      );
      
      if (categoryTag) {
        byCategory[categoryTag] = (byCategory[categoryTag] || 0) + 1;
      }

      // Extract confidence
      const confidenceTag = asset.tags.find((t: string) => t.startsWith('confidence_'));
      if (confidenceTag) {
        const confidence = parseInt(confidenceTag.split('_')[1]) / 100;
        totalConfidence += confidence;
        confidenceCount++;
      }
    }

    return {
      totalImported: importedAssets.length,
      byCategory,
      averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0
    };
  }

  /**
   * Get all imported assets from library
   */
  private async getImportedAssets(): Promise<any[]> {
    // This would need to be implemented in AssetLibrary
    // For now, return empty array
    return [];
  }
}
