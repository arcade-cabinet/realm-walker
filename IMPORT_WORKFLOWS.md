# Content Import Workflows - Quick Start

## Overview

Import 3D assets and narrative content into Realm Walker Story using AI-powered workflows.

## Features

✅ **Asset Import**: Scan directories for GLB files and correlate with metadata  
✅ **Narrative Import**: Extract quests, NPCs, dialogue, lore from any text format  
✅ **AI Correlation**: Claude Sonnet 4.5 intelligently matches assets and extracts content  
✅ **Embeddings Database**: All content searchable via semantic similarity  
✅ **Enhanced Generation**: Scene generation uses imported content pools  

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set API Keys

```bash
export ANTHROPIC_API_KEY="your-anthropic-key"
export OPENAI_API_KEY="your-openai-key"
export MESHY_API_KEY="your-meshy-key"  # Optional
```

### 3. Prepare Import Directory

```
./imports/
├── chapter1/
│   ├── models/
│   │   ├── ancient_guardian.glb
│   │   └── stone_pillar.glb
│   ├── metadata/
│   │   ├── ancient_guardian.txt    # "Stone guardian statue with..."
│   │   └── prompts.json            # {"models": [...]}
│   └── narrative/
│       ├── chapter1_story.md
│       └── npc_dialogues.json
```

### 4. Run Import

```bash
# Import assets only
npm run demo:import assets

# Import narrative only
npm run demo:import narrative

# Import both
npm run demo:import batch

# Generate scene with imported content
npm run demo:import enhanced
```

## Import Formats

### Supported Asset Metadata
- **JSON**: `{"name": "Guardian", "prompt": "Stone statue..."}`
- **TXT**: Plain text descriptions
- **Markdown**: Rich formatted descriptions

### Supported Narrative Formats
- Markdown (`.md`)
- RWMD (`.rwmd`)
- JSON (`.json`)
- YAML (`.yml`)
- Plain text (`.txt`)

## How It Works

### Asset Import
1. Scans directory for `.glb` files
2. Finds nearby text files with metadata
3. AI correlates GLBs with metadata using context clues
4. Imports into asset library with embeddings
5. Organizes in `/assets/imported/` structure

### Narrative Import
1. Loads entire directory into 1M token context
2. Combines with story bible (world lore)
3. Claude Sonnet 4.5 extracts structured content:
   - Quests (boolean flag system)
   - Dialogue trees
   - NPC definitions (with 3D model prompts)
   - Lore entries
   - Location descriptions
4. Creates embeddings for all content
5. Saves to embeddings database + JSON files

### Enhanced Scene Generation
1. Query embeddings for relevant content
2. Filter by story thread (A/B/C)
3. Filter by required flags
4. Enrich scene generation with imported content
5. Scene includes imported NPCs, quests, lore

## Configuration

Edit `src/demo-import.ts`:

```typescript
const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  assetDirectory: './assets',
  storyBiblePath: './docs/design/world-lore.md',
  importSourceDirectory: './imports',
  assetLibraryPath: './data/asset-library.db'
};
```

## Programmatic Usage

```typescript
import { ImportOrchestrator, AnthropicClient, AssetLibrary } from './src/ai';

const orchestrator = new ImportOrchestrator({
  assetLibrary: new AssetLibrary('./data/asset-library.db'),
  anthropicClient: new AnthropicClient({ apiKey: 'your-key' }),
  assetDirectory: './assets',
  storyBiblePath: './docs/design/world-lore.md'
});

// Import assets
const result = await orchestrator.executeImport({
  type: 'assets',
  sourceDirectory: './imports/chapter1'
});

// Import narrative
const result = await orchestrator.executeImport({
  type: 'narrative',
  sourceDirectory: './imports/chapter1',
  options: {
    outputDirectory: './extracted-content/chapter1'
  }
});

// Query imported content
const content = await orchestrator.queryForScene({
  thread: 'A',
  description: 'Ancient temple entrance',
  tags: ['chapter1']
}, {
  contentTypes: ['npc', 'quest', 'lore'],
  limit: 5
});
```

## Output Structure

### Asset Import
```
./assets/imported/
├── character/
│   ├── imported_123_ancient_guardian.glb
│   └── imported_124_village_elder.glb
├── prop/
│   ├── imported_125_stone_pillar.glb
│   └── imported_126_fountain.glb
└── manifest_timestamp.json
```

### Narrative Import
```
./extracted-content/chapter1/
├── quests.json
├── dialogues.json
├── npcs.json
├── lore.json
├── locations.json
├── story_beats.json
└── manifest.json
```

## Embeddings Database

All content stored in SQLite with embeddings:

```
./data/asset-library.db
├── assets table
│   ├── type: 'model' | 'texture' | 'audio'
│   ├── metadata: {contentType: 'quest' | 'npc' | ...}
│   └── embedding: BLOB (vector)
```

Query with semantic search:
```typescript
const results = await assetLibrary.searchSimilar(
  "ancient guardian statue",
  { threshold: 0.85, limit: 10 }
);
```

## Story Bible Integration

The import process uses `docs/design/world-lore.md` to ensure:
- Gothic fantasy atmosphere maintained
- Three story threads (A/B/C) respected
- Boolean flag system for quests
- Victorian Gothic aesthetic preserved

## Examples

### Example 1: Import Meshy Export

```
./imports/meshy_export/
├── model_001.glb
├── model_002.glb
├── prompts.json          # All prompts in one file
```

Run: `npm run demo:import assets`

Result: AI correlates each GLB with its prompt

### Example 2: Import Story Document

```
./imports/chapter2/
└── narrative.md          # 50-page story document
```

Run: `npm run demo:import narrative`

Result:
- 12 quests extracted
- 8 NPCs identified
- 15 dialogue trees created
- 20 lore entries catalogued

### Example 3: Mixed Import

```
./imports/full_chapter/
├── models/
│   └── *.glb
├── descriptions.txt
└── story.md
```

Run: `npm run demo:import batch`

Result: Both assets and narrative imported

## Troubleshooting

**"No GLB files found"**
- Check directory path
- Ensure `.glb` extension (case-insensitive)

**"AI correlation failed"**
- Verify ANTHROPIC_API_KEY is set
- Check metadata file format
- Ensure files are readable

**"No content extracted"**
- Check narrative file format
- Verify story content is game-relevant
- Review story bible for context alignment

**"Low similarity scores"**
- Adjust threshold (default 0.85)
- Improve search query specificity
- Check embedding model compatibility

## Performance

- **Asset import**: ~10 seconds per 10 GLBs
- **Narrative import**: ~30 seconds per 100KB text (depends on complexity)
- **Embeddings**: ~1 second per 100 items
- **Scene query**: ~0.5 seconds per query

## Limitations

- Maximum 1M tokens per narrative import (Claude limit)
- GLB files only (no FBX, OBJ, etc.)
- Requires API keys for full functionality
- English language only (for now)

## Next Steps

1. Run demo: `npm run demo:import all`
2. Read docs: `docs/architecture/content-import.md`
3. Integrate with your workflow
4. Customize for your content

## Support

- Documentation: `/docs/architecture/content-import.md`
- Issues: Create GitHub issue
- Examples: `/src/demo-import.ts`

## License

ISC
