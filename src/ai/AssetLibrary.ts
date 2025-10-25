/**
 * AssetLibrary - Embeddings-based asset reuse system
 * Uses SQLite with vector search to find similar assets
 */

import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';
import Database from 'better-sqlite3';
import * as path from 'path';

export interface AssetRecord {
  id: string;
  type: 'model' | 'texture' | 'audio';
  prompt: string;
  description: string;
  filePath: string;
  tags: string[];
  metadata: Record<string, any>;
  embedding: number[];
  created: number;
  usage_count: number;
}

export interface AssetSearchResult {
  asset: AssetRecord;
  similarity: number;
}

export class AssetLibrary {
  private db: Database.Database;
  private embeddingModel = openai.embedding('text-embedding-3-small');

  constructor(dbPath: string = './data/asset-library.db') {
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    const fs = require('fs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  /**
   * Initialize database with schema
   */
  private initializeDatabase(): void {
    // Create assets table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        prompt TEXT NOT NULL,
        description TEXT,
        file_path TEXT NOT NULL,
        tags TEXT,
        metadata TEXT,
        embedding BLOB NOT NULL,
        created INTEGER NOT NULL,
        usage_count INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_type ON assets(type);
      CREATE INDEX IF NOT EXISTS idx_usage ON assets(usage_count DESC);
    `);

    // Create narrative content tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS narrative_content (
        id TEXT PRIMARY KEY,
        content_type TEXT NOT NULL,
        thread TEXT,
        data TEXT NOT NULL,
        embedding BLOB NOT NULL,
        tags TEXT,
        created INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_content_type ON narrative_content(content_type);
      CREATE INDEX IF NOT EXISTS idx_thread ON narrative_content(thread);
    `);

    console.log('Asset library database initialized');
  }

  /**
   * Register a new asset
   */
  async registerAsset(asset: Omit<AssetRecord, 'embedding' | 'created' | 'usage_count'>): Promise<AssetRecord> {
    // Generate embedding for the prompt + description
    const textToEmbed = `${asset.prompt}\n${asset.description}\n${asset.tags.join(' ')}`;
    
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: textToEmbed
    });

    const record: AssetRecord = {
      ...asset,
      embedding,
      created: Date.now(),
      usage_count: 0
    };

    // Store in database
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO assets (id, type, prompt, description, file_path, tags, metadata, embedding, created, usage_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      record.id,
      record.type,
      record.prompt,
      record.description,
      record.filePath,
      JSON.stringify(record.tags),
      JSON.stringify(record.metadata),
      Buffer.from(new Float32Array(embedding).buffer),
      record.created,
      record.usage_count
    );

    console.log(`Registered asset: ${record.id}`);
    return record;
  }

  /**
   * Search for similar assets using embeddings
   */
  async searchSimilar(
    query: string,
    options: {
      type?: string;
      threshold?: number;
      limit?: number;
      tags?: string[];
    } = {}
  ): Promise<AssetSearchResult[]> {
    const {
      type,
      threshold = 0.85,
      limit = 10,
      tags = []
    } = options;

    // Generate query embedding
    const { embedding: queryEmbedding } = await embed({
      model: this.embeddingModel,
      value: query
    });

    // Get all assets of the specified type
    let sql = 'SELECT * FROM assets';
    const params: any[] = [];

    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    const stmt = this.db.prepare(sql);
    const assets = stmt.all(...params) as any[];

    // Calculate cosine similarity
    const results: AssetSearchResult[] = [];

    for (const row of assets) {
      const assetEmbedding = Array.from(new Float32Array(row.embedding.buffer));
      const similarity = this.cosineSimilarity(queryEmbedding, assetEmbedding);

      if (similarity >= threshold) {
        // Filter by tags if specified
        const assetTags = JSON.parse(row.tags);
        if (tags.length > 0 && !tags.some(t => assetTags.includes(t))) {
          continue;
        }

        results.push({
          asset: {
            id: row.id,
            type: row.type,
            prompt: row.prompt,
            description: row.description,
            filePath: row.file_path,
            tags: JSON.parse(row.tags),
            metadata: JSON.parse(row.metadata),
            embedding: assetEmbedding,
            created: row.created,
            usage_count: row.usage_count
          },
          similarity
        });
      }
    }

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, limit);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Increment usage count for an asset
   */
  incrementUsage(assetId: string): void {
    this.db.prepare('UPDATE assets SET usage_count = usage_count + 1 WHERE id = ?').run(assetId);
  }

  /**
   * Get asset by ID
   */
  getAsset(id: string): AssetRecord | null {
    const row = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      type: row.type,
      prompt: row.prompt,
      description: row.description,
      filePath: row.file_path,
      tags: JSON.parse(row.tags),
      metadata: JSON.parse(row.metadata),
      embedding: Array.from(new Float32Array(row.embedding.buffer)),
      created: row.created,
      usage_count: row.usage_count
    };
  }

  /**
   * Get most used assets
   */
  getMostUsed(limit: number = 10): AssetRecord[] {
    const rows = this.db.prepare('SELECT * FROM assets ORDER BY usage_count DESC LIMIT ?').all(limit) as any[];

    return rows.map(row => ({
      id: row.id,
      type: row.type,
      prompt: row.prompt,
      description: row.description,
      filePath: row.file_path,
      tags: JSON.parse(row.tags),
      metadata: JSON.parse(row.metadata),
      embedding: Array.from(new Float32Array(row.embedding.buffer)),
      created: row.created,
      usage_count: row.usage_count
    }));
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalAssets: number;
    byType: Record<string, number>;
    totalUsage: number;
    averageUsage: number;
  } {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM assets').get() as any;
    const byType = this.db.prepare('SELECT type, COUNT(*) as count FROM assets GROUP BY type').all() as any[];
    const usage = this.db.prepare('SELECT SUM(usage_count) as total, AVG(usage_count) as avg FROM assets').get() as any;

    return {
      totalAssets: total.count,
      byType: Object.fromEntries(byType.map(row => [row.type, row.count])),
      totalUsage: usage.total || 0,
      averageUsage: usage.avg || 0
    };
  }

  /**
   * Get assets by content type (for imported narrative content)
   */
  getAssetsByContentType(contentType: string, options: {
    thread?: string;
    limit?: number;
  } = {}): AssetRecord[] {
    const { thread, limit = 10 } = options;

    let sql = "SELECT * FROM assets WHERE json_extract(metadata, '$.contentType') = ?";
    const params: any[] = [contentType];

    if (thread) {
      sql += ' AND tags LIKE ?';
      params.push(`%thread_${thread}%`);
    }

    sql += ' ORDER BY created DESC LIMIT ?';
    params.push(limit);

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      type: row.type,
      prompt: row.prompt,
      description: row.description,
      filePath: row.file_path,
      tags: JSON.parse(row.tags),
      metadata: JSON.parse(row.metadata),
      embedding: Array.from(new Float32Array(row.embedding.buffer)),
      created: row.created,
      usage_count: row.usage_count
    }));
  }

  /**
   * Get assets by tag
   */
  getAssetsByTag(tag: string, limit: number = 10): AssetRecord[] {
    const rows = this.db.prepare(`
      SELECT * FROM assets 
      WHERE tags LIKE ? 
      ORDER BY usage_count DESC 
      LIMIT ?
    `).all(`%"${tag}"%`, limit) as any[];

    return rows.map(row => ({
      id: row.id,
      type: row.type,
      prompt: row.prompt,
      description: row.description,
      filePath: row.file_path,
      tags: JSON.parse(row.tags),
      metadata: JSON.parse(row.metadata),
      embedding: Array.from(new Float32Array(row.embedding.buffer)),
      created: row.created,
      usage_count: row.usage_count
    }));
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}
