/**
 * AmbientCG Texture Provider
 * Interfaces with ambientCG.com for PBR texture sets
 */

export interface TextureSet {
  id: string;
  name: string;
  category: string;
  tags: string[];
  downloadUrl: string;
  preview: string;
  resolution: string;
  maps: {
    color?: string;
    displacement?: string;
    normal?: string;
    roughness?: string;
    metallic?: string;
    ao?: string; // Ambient occlusion
  };
}

export interface TextureSearchOptions {
  category?: string;
  tags?: string[];
  resolution?: '1K' | '2K' | '4K' | '8K';
  limit?: number;
}

export class AmbientCGProvider {
  private baseUrl: string = 'https://ambientcg.com/api/v2';
  private cache: Map<string, TextureSet[]> = new Map();

  /**
   * Search for textures
   */
  async search(query: string, options: TextureSearchOptions = {}): Promise<TextureSet[]> {
    const {
      category,
      tags = [],
      resolution = '2K',
      limit = 10
    } = options;

    // Check cache first
    const cacheKey = `${query}_${category}_${tags.join(',')}_${resolution}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.slice(0, limit);
    }

    try {
      // Build query parameters
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        sort: 'Popular'
      });

      if (category) {
        params.append('type', category);
      }

      tags.forEach(tag => params.append('tag', tag));

      const response = await fetch(`${this.baseUrl}/full_json?${params}`);
      
      if (!response.ok) {
        throw new Error(`AmbientCG API error: ${response.status}`);
      }

      const data = await response.json();
      const textureSets: TextureSet[] = [];

      // Parse response
      if (data.foundAssets) {
        for (const asset of data.foundAssets) {
          const downloadInfo = asset.downloadFolders?.[resolution];
          
          if (downloadInfo) {
            textureSets.push({
              id: asset.assetId,
              name: asset.displayName,
              category: asset.category,
              tags: asset.tags || [],
              downloadUrl: downloadInfo.downloadLink,
              preview: asset.previewImage?.['512-PNG'] || '',
              resolution,
              maps: this.extractMaps(downloadInfo)
            });
          }
        }
      }

      // Cache results
      this.cache.set(cacheKey, textureSets);

      return textureSets;
    } catch (error) {
      console.error('AmbientCG search failed:', error);
      return [];
    }
  }

  /**
   * Extract texture maps from download info
   */
  private extractMaps(downloadInfo: any): TextureSet['maps'] {
    const maps: TextureSet['maps'] = {};

    // Map file types to our structure
    const typeMapping: Record<string, keyof TextureSet['maps']> = {
      'Color': 'color',
      'Displacement': 'displacement',
      'NormalGL': 'normal',
      'Roughness': 'roughness',
      'Metalness': 'metallic',
      'AmbientOcclusion': 'ao'
    };

    if (downloadInfo.downloadFiletypeCategories) {
      for (const [fileType, mapType] of Object.entries(typeMapping)) {
        if (downloadInfo.downloadFiletypeCategories[fileType]) {
          maps[mapType] = downloadInfo.downloadFiletypeCategories[fileType].downloadLink;
        }
      }
    }

    return maps;
  }

  /**
   * Get popular textures by category
   */
  async getPopularTextures(category: string, limit: number = 20): Promise<TextureSet[]> {
    return this.search('', { category, limit });
  }

  /**
   * Get textures by tags
   */
  async getTexturesByTags(tags: string[], limit: number = 20): Promise<TextureSet[]> {
    return this.search('', { tags, limit });
  }

  /**
   * Download texture set to local directory
   */
  async downloadTextureSet(textureSet: TextureSet, outputDir: string): Promise<string[]> {
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const downloadedFiles: string[] = [];

    for (const [mapType, url] of Object.entries(textureSet.maps)) {
      if (url) {
        const filename = `${textureSet.id}_${mapType}.png`;
        const filepath = path.join(outputDir, filename);

        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filepath, Buffer.from(buffer));

        downloadedFiles.push(filepath);
      }
    }

    console.log(`Downloaded texture set: ${textureSet.id} (${downloadedFiles.length} maps)`);
    return downloadedFiles;
  }

  /**
   * Get recommended texture for surface type
   */
  async getRecommendedTexture(surfaceType: string): Promise<TextureSet | null> {
    const categoryMap: Record<string, { category: string; tags: string[] }> = {
      'stone': { category: 'Stone', tags: ['rough', 'medieval'] },
      'wood': { category: 'Wood', tags: ['planks', 'weathered'] },
      'brick': { category: 'Bricks', tags: ['red', 'old'] },
      'marble': { category: 'Marble', tags: ['polished', 'white'] },
      'metal': { category: 'Metal', tags: ['iron', 'rusty'] },
      'grass': { category: 'Ground', tags: ['grass', 'green'] },
      'dirt': { category: 'Ground', tags: ['soil', 'brown'] },
      'cobblestone': { category: 'Stone', tags: ['cobblestone', 'medieval'] }
    };

    const mapping = categoryMap[surfaceType.toLowerCase()];
    if (!mapping) {
      return null;
    }

    const results = await this.search('', {
      category: mapping.category,
      tags: mapping.tags,
      limit: 1
    });

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
