# Realm Walker Story - Justfile
# Usage: just <command>

# Default recipe shows available commands
default:
    @just --list

# ============================================================================
# Setup & Installation
# ============================================================================

# Install all Node.js dependencies
install:
    @echo "📦 Installing Node.js dependencies..."
    npm install

# Install all dependencies including dev tools
install-all: install
    @echo "✅ All dependencies installed"

# Setup development environment
setup: install-all
    @echo "🔧 Setting up development environment..."
    @mkdir -p data generated/scenes generated/images generated/models saves
    @echo "✅ Development environment ready"

# ============================================================================
# LM Studio Integration
# ============================================================================

# Bootstrap LM Studio CLI (lms) - Run LM Studio once first
lms-bootstrap:
    @lms bootstrap

# List downloaded models
lms-list:
    @lms ls

# Search for models by keyword
lms-search keyword:
    @echo "🔍 Searching for models matching: {{keyword}}"
    @lms get {{keyword}} --limit 10

# Get recommended coding model (deepseek-r1-qwen3-8b - most popular)
lms-get-coding:
    @echo "📥 Downloading most popular coding model: deepseek-r1-qwen3-8b"
    @lms get deepseek-r1-qwen3-8b --yes

# Get recommended creative model for content generation
lms-get-creative:
    @echo "📥 Downloading creative model: llama-3.3-70b"
    @lms get llama-3.3-70b --yes

# Load a model (default: qwen3-8b)
lms-load model="qwen/qwen3-8b":
    @lms load {{model}} --gpu=max

# Start LM Studio server
lms-server-start:
    @lms server start

# Stop LM Studio server
lms-server-stop:
    @lms server stop

# Check if LM Studio is running
lms-check:
    @echo "🔍 Checking LM Studio connection..."
    @curl -s http://localhost:1234/v1/models || echo "❌ LM Studio not running"

# Complete LM Studio setup
setup-ai: lms-bootstrap
    @echo ""
    @echo "✅ LM Studio CLI ready!"
    @echo ""
    @echo "Next steps:"
    @echo "  just lms-get-coding         # Download coding model"
    @echo "  just lms-get-creative       # Download creative model"
    @echo "  just lms-load               # Load model"
    @echo "  just lms-server-start       # Start server"
    @echo "  just ai-generate-scene      # Generate test scene"

# ============================================================================
# Build & Development
# ============================================================================

# Build TypeScript
build:
    @echo "🔨 Building TypeScript..."
    npm run build

# Clean build artifacts
clean:
    @echo "🧹 Cleaning build artifacts..."
    rm -rf dist
    rm -rf generated/scenes/*
    rm -rf generated/images/*
    rm -rf generated/models/*

# Run demo
demo:
    npm run demo

# Development mode with watch
dev:
    npm run dev

# ============================================================================
# Testing
# ============================================================================

# Run all tests
test:
    @echo "🧪 Running unit tests..."
    npm test

# Run tests in watch mode
test-watch:
    npm run test:watch

# Run tests with coverage
test-coverage:
    npm run test:coverage

# ============================================================================
# RWMD & Scene Management
# ============================================================================

# Validate a single RWMD file
validate-rwmd file:
    @echo "✅ Validating RWMD file: {{file}}"
    npm run validate:rwmd {{file}}

# Validate all RWMD files
validate-all-rwmd:
    @echo "✅ Validating all RWMD files..."
    npm run validate:rwmd scenes/rwmd/

# Parse RWMD to JSON (for testing)
parse-rwmd file:
    @echo "📝 Parsing RWMD: {{file}}"
    @ts-node -e "import { RWMDParser } from './src/runtime/parsers/RWMDParser'; import * as fs from 'fs'; const content = fs.readFileSync('{{file}}', 'utf-8'); const parsed = RWMDParser.parseString(content); console.log(JSON.stringify(parsed, null, 2));"

# ============================================================================
# AI Asset Generation
# ============================================================================

# Generate a scene with AI (requires LM Studio running)
ai-generate-scene thread chapter prompt:
    @echo "🎨 Generating scene for {{thread}} story, chapter {{chapter}}..."
    @tsx scripts/ai/generate-scene.ts --thread={{thread}} --chapter={{chapter}} --prompt="{{prompt}}"

# Generate 3D model with Meshy
ai-generate-model prompt:
    @echo "🎨 Generating 3D model: {{prompt}}"
    @tsx scripts/ai/generate-model.ts --prompt="{{prompt}}"

# Generate texture with GPT-4.5
ai-generate-texture prompt:
    @echo "🎨 Generating texture: {{prompt}}"
    @tsx scripts/ai/generate-texture.ts --prompt="{{prompt}}"

# Search asset library for reusable assets
ai-search-assets query:
    @echo "🔍 Searching asset library: {{query}}"
    @tsx scripts/ai/search-assets.ts --query="{{query}}"

# Generate complete A story (all chapters)
ai-generate-a-story:
    @echo "🎨 Generating complete A story (Guardian Quest)..."
    @tsx scripts/ai/generate-story-thread.ts --thread=A

# Generate complete B story for specific age range
ai-generate-b-story age="all":
    @echo "🎨 Generating B story (Faction Politics) for {{age}}..."
    @tsx scripts/ai/generate-story-thread.ts --thread=B --age={{age}}

# Generate complete C story (Ravens Mystery)
ai-generate-c-story:
    @echo "🎨 Generating C story (Ravens Mystery)..."
    @tsx scripts/ai/generate-story-thread.ts --thread=C

# Generate all stories (FULL GAME)
ai-generate-all-stories:
    @echo "🎨 GENERATING COMPLETE GAME - This will take a while..."
    just ai-generate-a-story
    just ai-generate-b-story child
    just ai-generate-b-story teen
    just ai-generate-b-story adult
    just ai-generate-c-story

# Show asset library statistics
ai-stats:
    @tsx scripts/ai/asset-stats.ts

# ============================================================================
# Asset Management
# ============================================================================

# Generate asset manifest
manifest-generate:
    @echo "📋 Generating asset manifest..."
    @tsx scripts/generate-manifest.ts

# Validate all assets exist
manifest-validate:
    @echo "✅ Validating asset manifest..."
    @tsx scripts/validate-manifest.ts

# ============================================================================
# Database Management
# ============================================================================

# Initialize asset library database
db-init:
    @echo "🗄️ Initializing asset library database..."
    @tsx scripts/db/init-asset-library.ts

# Show database statistics
db-stats:
    @tsx scripts/db/show-stats.ts

# Backup asset library
db-backup:
    @echo "💾 Backing up asset library..."
    @mkdir -p backups
    @cp data/asset-library.db backups/asset-library_$(date +%Y%m%d_%H%M%S).db
    @echo "✅ Backup complete"

# ============================================================================
# Development Utilities
# ============================================================================

# Format code with prettier
format:
    @echo "✨ Formatting code..."
    @npx prettier --write "src/**/*.ts" "tests/**/*.ts"

# Lint code
lint:
    @echo "🔍 Linting code..."
    @npx eslint "src/**/*.ts"

# Type check
typecheck:
    @echo "🔍 Type checking..."
    @npx tsc --noEmit

# Run all checks (lint + typecheck + test)
check: lint typecheck test
    @echo "✅ All checks passed!"

# ============================================================================
# Game Development
# ============================================================================

# Start game in development mode
game-dev:
    @echo "🎮 Starting game in development mode..."
    npm run dev

# Create new scene template
scene-new id name:
    @echo "📝 Creating new scene: {{id}}"
    @mkdir -p scenes/rwmd scenes/definitions scenes/bindings
    @echo "@scene {{id}}\nname: {{name}}\ngrid: 24x16\n\n# Add your scene content here" > scenes/rwmd/{{id}}.rwmd
    @echo '{"scene_id": "{{id}}", "npc_placements": {}, "prop_placements": {}, "door_states": {}}' > scenes/bindings/{{id}}.json
    @echo "✅ Scene template created"

# Create new dialogue tree
dialogue-new id title:
    @echo "📝 Creating new dialogue: {{id}}"
    @mkdir -p scenes/dialogues
    @echo '{"id": "{{id}}", "title": "{{title}}", "nodes": [{"id": "start", "speaker": "NPC", "text": "Hello!", "choices": []}]}' > scenes/dialogues/{{id}}.json
    @echo "✅ Dialogue template created"

# ============================================================================
# Documentation
# ============================================================================

# Generate API documentation
docs-generate:
    @echo "📚 Generating API documentation..."
    @npx typedoc

# Serve documentation locally
docs-serve:
    @echo "📚 Serving documentation at http://localhost:8080"
    @npx http-server docs -p 8080

# ============================================================================
# Quick Commands
# ============================================================================

# Quick build + test
quick: build test
    @echo "✅ Quick check complete"

# Full rebuild
rebuild: clean install build test
    @echo "✅ Full rebuild complete"

# Show project status
status:
    @echo "📊 Realm Walker Story - Project Status"
    @echo ""
    @echo "TypeScript files: $(find src -name '*.ts' | wc -l)"
    @echo "Test files: $(find tests -name '*.ts' | wc -l)"
    @echo "Scene files: $(find scenes -name '*.rwmd' | wc -l)"
    @echo "Dialogue files: $(find scenes/dialogues -name '*.json' 2>/dev/null | wc -l || echo 0)"
    @echo ""
    @echo "Build status:"
    @npm run build 2>&1 >/dev/null && echo "  ✅ Build successful" || echo "  ❌ Build failed"
    @echo ""
    @echo "LM Studio:"
    @curl -s http://localhost:1234/v1/models >/dev/null 2>&1 && echo "  ✅ Connected" || echo "  ❌ Not running"
