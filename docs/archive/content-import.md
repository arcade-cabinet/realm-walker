# Content Import Workflows

**Version**: 1.0

## Overview

The Content Import Workflows enable AI-powered import of both 3D assets and narrative content into Realm Walker Story. The system uses Claude Sonnet 4.5 for intelligent content analysis and correlation.

## Architecture

### Components

#### 1. AnthropicClient
- **Purpose**: Interface to Claude Sonnet 4.5 with 1M token context
- **Key Features**:
  - Large context narrative analysis
  - Asset correlation using context clues
  - Structured content extraction
- **File**: `src/ai/AnthropicClient.ts`

#### 2. AssetImportWorkflow
- **Purpose**: Import GLB files with automatic metadata correlation
- **Process**:
  1. Scan directory for GLB and text files
  2. Read metadata files (JSON, TXT, MD)
  3. Use AI to correlate GLBs with metadata
  4. Import into asset library with embeddings
  5. Organize in asset directory structure
- **File**: `src/ai/workflows/AssetImportWorkflow.ts`

#### 3. NarrativeImportWorkflow
- **Purpose**: Extract game content from narrative documents
- **Process**:
  1. Load entire directory into context
  2. Combine with story bible
  3. Use Sonnet 4.5 to extract structured content
  4. Create embeddings for all content
  5. Save extracted content as JSON
- **Extracts**:
  - Quests (with boolean flags)
  - Dialogue trees
  - NPC definitions
  - Lore entries
  - Location descriptions
  - Story beats
- **File**: `src/ai/workflows/NarrativeImportWorkflow.ts`

#### 4. ImportOrchestrator
- **Purpose**: Coordinate import workflows
- **Features**:
  - Execute single or batch imports
  - Query imported content for scene generation
  - Track embeddings statistics
  - Manage asset library integration
- **File**: `src/ai/workflows/ImportOrchestrator.ts`

#### 5. EnhancedSceneOrchestrator
- **Purpose**: Extend scene generation with imported content
- **Features**:
  - Query embeddings for relevant content
  - Enrich creative direction with imported elements
  - Integrate NPCs, quests, lore into scenes
  - Maintain thread continuity (A/B/C)
- **File**: `src/ai/EnhancedSceneOrchestrator.ts`

## Data Flow

### Asset Import Flow
```
Source Directory
  ↓
Scan for GLB + metadata files
  ↓
AI correlates assets with metadata
  ↓
Import into asset library
  ↓
Create embeddings
  ↓
Organize in asset directory
  ↓
Available for scene generation
```

### Narrative Import Flow
```
Source Directory (markdown, RWMD, JSON, etc.)
  ↓
Load all files into context
  ↓
Combine with story bible
  ↓
Claude Sonnet 4.5 analysis (1M tokens)
  ↓
Extract structured content:
  - Quests
  - Dialogues
  - NPCs
  - Lore
  - Locations
  - Story beats
  ↓
Create embeddings for all items
  ↓
Save to embeddings database
  ↓
Available for scene generation
```

### Enhanced Scene Generation Flow
```
Scene generation request
  ↓
Query embeddings for relevant content
  - Filter by thread (A/B/C)
  - Filter by required flags
  - Semantic similarity search
  ↓
Enrich creative direction with:
  - Available NPCs
  - Relevant quests
  - Lore context
  - Location ideas
  ↓
Generate scene with imported content
  ↓
Scene includes imported elements
```

## Embeddings Database

### Schema Extensions

The asset library database has been extended to support narrative content:

```sql
-- Original assets table (unchanged)
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  tags TEXT,
  metadata TEXT,  -- Extended to include contentType
  embedding BLOB NOT NULL,
  created INTEGER NOT NULL,
  usage_count INTEGER DEFAULT 0
);

-- Indices for querying
CREATE INDEX idx_type ON assets(type);
CREATE INDEX idx_usage ON assets(usage_count DESC);
```

### Content Types

The `metadata` field now supports these content types:
- `contentType: 'quest'` - Quest definitions
- `contentType: 'dialogue'` - Dialogue trees
- `contentType: 'npc'` - NPC definitions
- `contentType: 'lore'` - Lore entries
- `contentType: 'location'` - Location descriptions

### Querying

New methods in `AssetLibrary`:
- `getAssetsByContentType(type, options)` - Get by content type
- `getAssetsByTag(tag, limit)` - Get by tag
- `searchSimilar(query, options)` - Semantic search with filtering

## Usage

### Basic Asset Import

```typescript
import { ImportOrchestrator } from './ai/workflows';
import { AssetLibrary } from './ai/AssetLibrary';
import { AnthropicClient } from './ai/AnthropicClient';

const orchestrator = new ImportOrchestrator({
  assetLibrary: new AssetLibrary('./data/asset-library.db'),
  anthropicClient: new AnthropicClient({ apiKey: process.env.ANTHROPIC_API_KEY }),
  assetDirectory: './assets',
  storyBiblePath: './docs/design/world-lore.md'
});

const result = await orchestrator.executeImport({
  type: 'assets',
  sourceDirectory: './imports/chapter1'
}, (stage, message, progress) => {
  console.log(`${stage}: ${message} (${progress}%)`);
});
```

### Basic Narrative Import

```typescript
const result = await orchestrator.executeImport({
  type: 'narrative',
  sourceDirectory: './imports/chapter1',
  options: {
    outputDirectory: './extracted-content/chapter1'
  }
}, (stage, message, progress) => {
  console.log(`${stage}: ${message} (${progress}%)`);
});
```

### Enhanced Scene Generation

```typescript
import { EnhancedSceneOrchestrator } from './ai/EnhancedSceneOrchestrator';

const sceneOrchestrator = new EnhancedSceneOrchestrator({
  meshyApiKey: process.env.MESHY_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  assetLibraryPath: './data/asset-library.db'
});

sceneOrchestrator.setImportOrchestrator(orchestrator);

const result = await sceneOrchestrator.generateEnhancedScene({
  thread: { type: 'A', description: 'Guardian Quest', chapters: [1] },
  chapterIndex: 1,
  previousScenes: [],
  creativeDirection: 'Ancient temple entrance',
  existingAssets: [],
  useImportedContent: true,
  contentPreferences: {
    preferNPCs: true,
    preferLore: true
  }
});
```

### Querying Imported Content

```typescript
const content = await orchestrator.queryForScene({
  thread: 'A',
  description: 'Ancient temple with guardian',
  tags: ['chapter1', 'guardian']
}, {
  contentTypes: ['quest', 'npc', 'lore'],
  limit: 5
});

console.log(`Found ${content.npcs.length} NPCs`);
console.log(`Found ${content.quests.length} quests`);
console.log(`Found ${content.lore.length} lore entries`);
```

## File Formats Supported

### Asset Metadata
- **JSON**: Structured Meshy prompt data
- **TXT**: Plain text descriptions
- **Markdown**: Rich text with formatting

### Narrative Content
- **Markdown** (`.md`)
- **RWMD** (`.rwmd`) - Our custom format
- **JSON** (`.json`)
- **YAML** (`.yml`, `.yaml`)
- **TXT** (`.txt`)

## AI Correlation

The system uses Claude Sonnet 4.5 to intelligently correlate assets:

### Correlation Strategy
1. **Filename matching**: Similar names, patterns
2. **Path context**: Directory structure clues
3. **Content analysis**: Keywords, descriptions
4. **Confidence scoring**: 0-1 confidence per match

### Example Correlation

```
Input:
- GLB: ancient_guardian_statue.glb
- Metadata: ancient_guardian.txt containing "Stone statue of ancient guardian"

Output:
{
  glbPath: "ancient_guardian_statue.glb",
  metadata: {
    prompt: "Stone statue of ancient guardian",
    name: "Ancient Guardian Statue",
    tags: ["statue", "guardian", "ancient"],
    description: "Stone statue of ancient guardian"
  },
  confidence: 0.95
}
```

## Integration with Existing Systems

### Three-Tier Compositor
- Imported content enriches Layer 2 (StoryCompositor)
- NPCs and quests fill scene slots
- Maintains boolean flag system

### Quest System
- Imported quests use boolean flags
- No numerical stats or inventory
- Thread-specific quest progression

### Asset Management
- Imported assets added to asset library
- Available for reuse across scenes
- Tracked usage statistics

## Performance Considerations

### Token Usage
- Narrative import uses large context (up to 1M tokens)
- Batching recommended for multiple directories
- Consider chunking for very large datasets

### Embeddings
- All imported content embedded for search
- Uses OpenAI text-embedding-3-small
- Cosine similarity for matching

### Caching
- Asset library caches embeddings
- Reuse existing content when possible
- LRU cache for frequently accessed items

## Demo Scripts

Run demos with:

```bash
# Asset import demo
npm run demo:import assets

# Narrative import demo
npm run demo:import narrative

# Enhanced scene generation demo
npm run demo:import enhanced

# Batch import demo
npm run demo:import batch

# Run all demos
npm run demo:import all
```

## Environment Variables

Required:
- `ANTHROPIC_API_KEY` - Claude Sonnet 4.5 access
- `OPENAI_API_KEY` - GPT-4 and embeddings
- `MESHY_API_KEY` - 3D model generation

Optional:
- `IMPORT_SOURCE_DIR` - Source directory (default: `./imports`)

## Future Enhancements

### Planned Features
1. **Multi-format export**: Export to various game engines
2. **Validation pipeline**: Verify imported content quality
3. **Conflict resolution**: Handle duplicate content
4. **Version tracking**: Track content evolution
5. **A/B testing**: Compare imported vs generated content

### Optimization Opportunities
1. **Parallel processing**: Import multiple directories simultaneously
2. **Incremental updates**: Import only changed files
3. **Smart chunking**: Better handling of massive datasets
4. **Cache warming**: Pre-compute embeddings for common queries

## Troubleshooting

### Common Issues

**Import fails with "No JSON found"**
- AI response may need better parsing
- Check that content is in supported format
- Verify API key and rate limits

**Low confidence correlations**
- Improve metadata quality
- Use more descriptive filenames
- Add context clues in directory structure

**Missing imported content in scenes**
- Verify embeddings were created
- Check thread/flag filters
- Adjust similarity threshold

## Related Documentation

- [Data Flow Architecture](./data-flow.md)
- [Quest System](./quest-system.md)
- [Compositor Pattern](./compositor-pattern.md)
- [World Lore](../design/world-lore.md)
