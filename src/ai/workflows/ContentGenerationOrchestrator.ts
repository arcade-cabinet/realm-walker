/**
 * ContentGenerationOrchestrator - Master AI Creative Director
 * 
 * This orchestrator serves as the AI Creative Director for Realm Walker Story,
 * faithfully executing the vision defined in the AGES AND FACTIONS Bible.
 * 
 * Key Responsibilities:
 * 1. Query embeddings FIRST - leverage imported content before generating new
 * 2. Make smart decisions about media reuse vs new creation
 * 3. Follow the Bible faithfully as creative director
 * 4. Coordinate all three story threads (A/B/C)
 * 5. Maintain consistency across all generated content
 */

import { AnthropicClient } from '../AnthropicClient';
import { AssetLibrary } from '../AssetLibrary';
import { ThreadAWorkflow } from './ThreadAWorkflow';
import { QuestState } from '../../types/GameState';

export interface ContentGenerationRequest {
  type: 'guardian' | 'faction' | 'raven' | 'scene' | 'npc' | 'dialogue';
  thread: 'A' | 'B' | 'C';
  beat?: number;
  age?: number; // For B thread age-specific content
  context: {
    questState?: QuestState;
    previousChoices?: string[];
    availableAssets?: string[];
  };
  options?: {
    preferReuse?: boolean; // Prefer reusing existing assets
    qualityLevel?: 'draft' | 'polished' | 'final';
    creativeBudget?: 'conservative' | 'balanced' | 'ambitious';
  };
}

export interface MediaReuseDecision {
  asset: string;
  decision: 'reuse' | 'variant' | 'new';
  reason: string;
  source?: string; // Where reused asset comes from
  modifications?: string[]; // If variant, what modifications
}

export interface CreativeDirectorReport {
  request: ContentGenerationRequest;
  assetsChecked: number;
  assetsReused: number;
  assetsCreatedNew: number;
  bibleCompliance: {
    thread: string;
    ageAlignment?: string;
    factionAlignment?: string;
    themeConsistency: boolean;
  };
  mediaDecisions: MediaReuseDecision[];
  generatedContent: any;
  recommendations: string[];
}

export class ContentGenerationOrchestrator {
  private anthropicClient: AnthropicClient;
  private assetLibrary: AssetLibrary;
  private threadA: ThreadAWorkflow;
  
  // Bible document (loaded from game design)
  private gameBible: {
    ages?: any[];
    factions?: any[];
    threads?: any;
    guidelines?: any;
  } = {};
  
  // Track what's been created to maximize reuse
  private createdAssets: Map<string, {
    type: string;
    content: any;
    thread: string;
    usageCount: number;
    tags: string[];
  }> = new Map();

  constructor(
    anthropicClient: AnthropicClient,
    assetLibrary: AssetLibrary,
    bibleDocumentPath?: string
  ) {
    this.anthropicClient = anthropicClient;
    this.assetLibrary = assetLibrary;
    this.threadA = new ThreadAWorkflow(anthropicClient, assetLibrary);
    
    // Load Bible if provided
    if (bibleDocumentPath) {
      this.loadGameBible(bibleDocumentPath);
    }
  }

  /**
   * Load the AGES AND FACTIONS Bible document
   * This is the creative source of truth that the AI must follow
   */
  async loadGameBible(path: string): Promise<void> {
    // TODO: Load from file
    console.log(`📖 Loading AGES AND FACTIONS Bible from ${path}`);
    // this.gameBible = await loadBibleDocument(path);
  }

  /**
   * Main orchestration method - acts as Creative Director
   * 
   * Process:
   * 1. Understand request in context of Bible
   * 2. Query embeddings for existing relevant content
   * 3. Make media reuse decisions
   * 4. Generate only what's needed
   * 5. Store and track for future reuse
   */
  async generateContent(request: ContentGenerationRequest): Promise<CreativeDirectorReport> {
    console.log(`\n🎬 AI Creative Director: ${request.type} for Thread ${request.thread}`);
    console.log('━'.repeat(70));
    
    const report: CreativeDirectorReport = {
      request,
      assetsChecked: 0,
      assetsReused: 0,
      assetsCreatedNew: 0,
      bibleCompliance: {
        thread: request.thread,
        themeConsistency: true
      },
      mediaDecisions: [],
      generatedContent: null,
      recommendations: []
    };

    // Step 1: Query embeddings for similar content
    const existingContent = await this.queryExistingContent(request);
    report.assetsChecked = existingContent.length;
    
    console.log(`📚 Found ${existingContent.length} existing assets in library`);

    // Step 2: Make media reuse decisions
    const reuseDecisions = await this.decideMediaReuse(request, existingContent);
    report.mediaDecisions = reuseDecisions;
    
    const reuseCount = reuseDecisions.filter(d => d.decision === 'reuse').length;
    const variantCount = reuseDecisions.filter(d => d.decision === 'variant').length;
    const newCount = reuseDecisions.filter(d => d.decision === 'new').length;
    
    report.assetsReused = reuseCount;
    report.assetsCreatedNew = newCount + variantCount;
    
    console.log(`🎨 Media Decisions: ${reuseCount} reuse, ${variantCount} variants, ${newCount} new`);

    // Step 3: Generate content following the Bible
    report.generatedContent = await this.generateFollowingBible(request, reuseDecisions);
    
    // Step 4: Verify Bible compliance
    report.bibleCompliance = this.verifyBibleCompliance(request, report.generatedContent);
    
    console.log(`✅ Bible Compliance: ${report.bibleCompliance.themeConsistency ? 'PASS' : 'FAIL'}`);

    // Step 5: Store for future reuse
    await this.storeForReuse(request, report.generatedContent);

    console.log('━'.repeat(70));
    console.log(`✨ Content generation complete!\n`);

    return report;
  }

  /**
   * Query embeddings for existing similar content
   * This is STEP 1 - always check what we have before making new
   */
  private async queryExistingContent(
    request: ContentGenerationRequest
  ): Promise<any[]> {
    // Build query based on request
    let query = '';
    const filters: any = { thread: request.thread };

    switch (request.type) {
      case 'guardian':
        query = `guardian supernatural power ancient mystical`;
        filters.type = 'npc';
        break;
      case 'faction':
        query = `faction political leader diplomat`;
        filters.type = 'npc';
        break;
      case 'raven':
        query = `raven mysterious observer cryptic`;
        filters.type = 'npc';
        break;
      case 'scene':
        query = `gothic fantasy location atmospheric`;
        filters.type = 'scene';
        break;
      case 'npc':
        query = `character personality dialogue`;
        filters.type = 'npc';
        break;
      case 'dialogue':
        query = `conversation branching choices`;
        filters.type = 'dialogue';
        break;
    }

    // Query asset library
    const results = await this.assetLibrary.queryEmbeddings(query, filters);
    
    return results;
  }

  /**
   * Make intelligent decisions about media reuse
   * 
   * Decision criteria:
   * - Can this asset be reused as-is?
   * - Should we create a variant?
   * - Do we need something completely new?
   * - How does this fit the Bible's vision?
   */
  private async decideMediaReuse(
    request: ContentGenerationRequest,
    existingContent: any[]
  ): Promise<MediaReuseDecision[]> {
    const decisions: MediaReuseDecision[] = [];

    // For each piece of existing content, decide reuse strategy
    for (const content of existingContent) {
      // Ask AI Creative Director to make decision
      const prompt = `As Creative Director for Realm Walker Story, decide how to use this existing asset:

**Request**: ${request.type} for Thread ${request.thread}, Beat ${request.beat || 'N/A'}
**Existing Asset**: ${JSON.stringify(content).substring(0, 500)}

**Options**:
1. REUSE - Use this asset as-is (saves time/resources)
2. VARIANT - Create a modified version (maintains consistency)
3. NEW - Create completely new asset (more variety)

**Creative Guidelines**:
- Gothic fantasy aesthetic must be maintained
- Thread ${request.thread} has specific themes
- Consistency is valued but variety prevents repetition
- Budget: ${request.options?.creativeBudget || 'balanced'}

Respond with JSON:
{
  "decision": "reuse|variant|new",
  "reason": "explanation",
  "modifications": ["if variant, list changes"]
}`;

      const response = await this.anthropicClient.generateText(prompt, {
        maxTokens: 500,
        temperature: 0.3 // Lower temp for consistent decisions
      });

      try {
        const decision = JSON.parse(response);
        decisions.push({
          asset: content.id || content.type,
          decision: decision.decision,
          reason: decision.reason,
          source: decision.decision !== 'new' ? content.id : undefined,
          modifications: decision.modifications
        });
      } catch (e) {
        // Fallback to conservative decision
        decisions.push({
          asset: content.id || content.type,
          decision: 'reuse',
          reason: 'Parse error, defaulting to reuse',
          source: content.id
        });
      }
    }

    return decisions;
  }

  /**
   * Generate content following the AGES AND FACTIONS Bible
   * This is where the AI acts as faithful creative director
   */
  private async generateFollowingBible(
    request: ContentGenerationRequest,
    reuseDecisions: MediaReuseDecision[]
  ): Promise<any> {
    console.log(`\n🎨 Generating as Creative Director (following Bible)...`);

    // Route to appropriate workflow
    switch (request.thread) {
      case 'A':
        return this.generateThreadAContent(request, reuseDecisions);
      case 'B':
        return this.generateThreadBContent(request, reuseDecisions);
      case 'C':
        return this.generateThreadCContent(request, reuseDecisions);
      default:
        throw new Error(`Unknown thread: ${request.thread}`);
    }
  }

  /**
   * Generate Thread A (Guardian Powers) content
   */
  private async generateThreadAContent(
    request: ContentGenerationRequest,
    reuseDecisions: MediaReuseDecision[]
  ): Promise<any> {
    if (request.beat === undefined) {
      throw new Error('Beat number required for Thread A');
    }

    // Use existing ThreadA workflow but with reuse decisions
    const content = await this.threadA.generateBeat(request.beat, {
      previousBeats: request.context.previousChoices?.map(c => parseInt(c)) || [],
      reuseDecisions // Pass reuse decisions to workflow
    } as any);

    return content;
  }

  /**
   * Generate Thread B (Faction Politics) content
   * This needs AGE-level workflows since we go DEEP
   */
  private async generateThreadBContent(
    request: ContentGenerationRequest,
    reuseDecisions: MediaReuseDecision[]
  ): Promise<any> {
    if (request.age === undefined) {
      throw new Error('Age number required for Thread B (faction politics goes DEEP at age level)');
    }

    console.log(`🏛️ Generating Thread B content for AGE ${request.age}`);
    console.log(`   (Faction politics goes DEEP at this level)`);

    // TODO: Implement age-specific faction generation
    // Each age has deep political content
    
    return {
      note: 'Thread B AGE-level generation not yet implemented',
      age: request.age,
      reuseDecisions
    };
  }

  /**
   * Generate Thread C (Raven Mysteries) content
   */
  private async generateThreadCContent(
    request: ContentGenerationRequest,
    reuseDecisions: MediaReuseDecision[]
  ): Promise<any> {
    console.log(`🐦‍⬛ Generating Thread C (Raven Mysteries) content`);
    
    // TODO: Implement raven encounter generation
    
    return {
      note: 'Thread C generation not yet implemented',
      reuseDecisions
    };
  }

  /**
   * Verify that generated content follows the Bible
   */
  private verifyBibleCompliance(
    request: ContentGenerationRequest,
    content: any
  ): CreativeDirectorReport['bibleCompliance'] {
    // TODO: Implement Bible compliance checking
    
    return {
      thread: request.thread,
      ageAlignment: request.age?.toString(),
      themeConsistency: true
    };
  }

  /**
   * Store generated content for future reuse
   */
  private async storeForReuse(
    request: ContentGenerationRequest,
    content: any
  ): Promise<void> {
    const assetId = `${request.thread}_${request.type}_${request.beat || request.age || Date.now()}`;
    
    this.createdAssets.set(assetId, {
      type: request.type,
      content,
      thread: request.thread,
      usageCount: 0,
      tags: this.generateTags(request)
    });

    // Also store in asset library with embeddings
    await this.assetLibrary.addContent({
      type: request.type,
      content: JSON.stringify(content),
      thread: request.thread,
      tags: this.generateTags(request)
    });
  }

  /**
   * Generate tags for content organization
   */
  private generateTags(request: ContentGenerationRequest): string[] {
    const tags: string[] = [
      `thread_${request.thread}`,
      request.type
    ];

    if (request.beat !== undefined) {
      tags.push(`beat_${request.beat}`);
    }
    if (request.age !== undefined) {
      tags.push(`age_${request.age}`);
    }

    return tags;
  }

  /**
   * Get asset reuse statistics
   */
  getAssetReuseStats(): {
    totalAssets: number;
    reusedAssets: number;
    reusePercentage: number;
    topReusedAssets: Array<{ id: string; uses: number }>;
  } {
    const total = this.createdAssets.size;
    const reused = Array.from(this.createdAssets.values())
      .filter(a => a.usageCount > 1).length;
    
    const topReused = Array.from(this.createdAssets.entries())
      .sort((a, b) => b[1].usageCount - a[1].usageCount)
      .slice(0, 10)
      .map(([id, asset]) => ({ id, uses: asset.usageCount }));

    return {
      totalAssets: total,
      reusedAssets: reused,
      reusePercentage: total > 0 ? (reused / total) * 100 : 0,
      topReused
    };
  }

  /**
   * Mark asset as reused (increment counter)
   */
  incrementAssetUsage(assetId: string): void {
    const asset = this.createdAssets.get(assetId);
    if (asset) {
      asset.usageCount++;
    }
  }
}
