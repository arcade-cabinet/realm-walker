# Dialogue System - RWMD-Based Conversations

**Version**: 1.0  
**Status**: Design Specification (RWMD PARSER EXISTS)  
**Last Updated**: 2025-10-15

---

## Status

✅ **RWMD Parser** exists (`client/src/lib/rwmd/parser.ts`)  
⚠️ **Dialogue Engine** needs building  
❌ **UI** doesn't exist (need to port from OLD or build)

**RWMD format is good, need runtime engine + UI.**

---

## RWMD Dialogue Format

### Basic Dialogue

```yaml
::scene @scene:elder_greeting
dialogue:
  - speaker: "Elder Ottermere"
    text: "Welcome to Riverwatch, Realm Walker."
    emotion: "welcoming"
    
  - speaker: "Elder Ottermere"
    text: "I'm afraid you've arrived at a troubled time."
    emotion: "concerned"
::end
```

**Features**:
- Speaker name
- Dialogue text (<200 chars per line)
- Emotion tag (for portrait expression)
- Sequential delivery (click to advance)

### Dialogue with Choices

```yaml
::scene @scene:help_decision
dialogue:
  - speaker: "Elder Ottermere"
    text: "The Veilbound are attacking. Will you help defend?"
    emotion: "hopeful"

choices:
  - text: "Of course. I'll defend the shrine."
    consequence: "help_dawnshield"
    reputation: { dawnshield_order: 10, veilbound_synod: -5 }
    flags: ["helpful", "light_path_started"]
    
  - text: "Why should I get involved?"
    consequence: "questioning"
    reputation: { }
    dialogue:
      - speaker: "Elder Ottermere"
        text: "Because if they win, everyone suffers."
        emotion: "urgent"
    follow_up_choices:
      - text: "Fine, I'll help."
        consequence: "reluctant_help"
        reputation: { dawnshield_order: 5 }
      - text: "Not my problem."
        consequence: "refuse"
        reputation: { dawnshield_order: -10 }
::end
```

**Features**:
- Multiple choice branches
- Nested follow-up choices
- Reputation consequences
- Flags for tracking
- Dialogue can continue after choice

---

## Dialogue Engine

### Runtime Processing

```typescript
// client/src/lib/dialogue/DialogueEngine.ts
interface DialogueState {
  currentScene: string;
  lineIndex: number;
  waitingForChoice: boolean;
  availableChoices: Choice[];
  conversationHistory: DialogueLine[];
}

class DialogueEngine {
  private state: DialogueState;
  
  constructor() {
    this.state = {
      currentScene: '',
      lineIndex: 0,
      waitingForChoice: false,
      availableChoices: [],
      conversationHistory: []
    };
  }
  
  // Load RWMD scene
  async loadScene(sceneId: string) {
    const rwmdContent = await loadRWMD(sceneId);
    const parsed = parseRWMD(rwmdContent);
    
    this.state.currentScene = sceneId;
    this.state.lineIndex = 0;
    this.state.waitingForChoice = false;
    
    return parsed;
  }
  
  // Advance dialogue
  advance(): DialogueResult {
    const scene = getCurrentScene();
    
    // Check if at choice point
    if (scene.dialogue[this.state.lineIndex].hasChoices) {
      this.state.waitingForChoice = true;
      this.state.availableChoices = scene.dialogue[this.state.lineIndex].choices;
      
      return {
        type: 'choice',
        choices: this.state.availableChoices
      };
    }
    
    // Advance to next line
    const line = scene.dialogue[this.state.lineIndex];
    this.state.conversationHistory.push(line);
    this.state.lineIndex++;
    
    // Check if end of scene
    if (this.state.lineIndex >= scene.dialogue.length) {
      return { type: 'end', sceneId: this.state.currentScene };
    }
    
    return { type: 'continue', line };
  }
  
  // Make choice
  makeChoice(choiceIndex: number): ChoiceResult {
    const choice = this.state.availableChoices[choiceIndex];
    
    // Apply reputation changes
    for (const [faction, change] of Object.entries(choice.reputation)) {
      applyReputationChange(faction, change);
    }
    
    // Set flags
    for (const flag of choice.flags) {
      setChoiceFlag(flag);
    }
    
    // If choice has follow-up dialogue, continue
    if (choice.dialogue) {
      // Insert dialogue lines
      insertDialogue(choice.dialogue);
    }
    
    // If choice has follow-up choices, show them
    if (choice.follow_up_choices) {
      this.state.waitingForChoice = true;
      this.state.availableChoices = choice.follow_up_choices;
      return { type: 'follow_up', choices: choice.follow_up_choices };
    }
    
    // Continue dialogue
    this.state.waitingForChoice = false;
    return { type: 'continue' };
  }
}
```

---

## Dialogue UI

### Dialogue Box

```typescript
interface DialogueBoxProps {
  speaker: string;
  text: string;
  emotion?: string;
  portrait?: string;
  onAdvance: () => void;
  choices?: Choice[];
  onChoice?: (index: number) => void;
}

export function DialogueBox({
  speaker,
  text,
  emotion,
  portrait,
  onAdvance,
  choices,
  onChoice
}: DialogueBoxProps) {
  return (
    <div className="dialogue-box">
      {/* Portrait */}
      <div className="portrait-container">
        <img 
          src={portrait || '/portraits/default.png'}
          alt={speaker}
          className={cn("portrait", emotion && `emotion-${emotion}`)}
        />
      </div>
      
      {/* Dialogue Content */}
      <div className="dialogue-content">
        {/* Speaker Name */}
        <div className="speaker-name">{speaker}</div>
        
        {/* Dialogue Text */}
        <div className="dialogue-text">
          {text}
        </div>
        
        {/* Choices or Continue */}
        {choices ? (
          <div className="choices">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onChoice?.(index)}
                className="choice-button"
              >
                <span className="choice-number">{index + 1}.</span>
                <span className="choice-text">{choice.text}</span>
                
                {/* Show reputation changes */}
                {choice.reputation && (
                  <div className="choice-consequences">
                    {Object.entries(choice.reputation).map(([faction, change]) => (
                      <span key={faction} className={change > 0 ? 'positive' : 'negative'}>
                        {faction}: {change > 0 ? '+' : ''}{change}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Show flags */}
                {choice.flags && choice.flags.includes('light_path_started') && (
                  <span className="path-indicator">⚠️ Locks you into Light path</span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <button onClick={onAdvance} className="continue-button">
            [Space] Continue ▶
          </button>
        )}
      </div>
    </div>
  );
}
```

### Portrait Emotions

**Emotion states** (affect portrait display):

```typescript
const EMOTION_EXPRESSIONS = {
  neutral: { expression: 'default', animation: null },
  happy: { expression: 'smile', animation: 'slight_bounce' },
  sad: { expression: 'frown', animation: 'head_down' },
  angry: { expression: 'scowl', animation: 'shake' },
  surprised: { expression: 'wide_eyes', animation: 'step_back' },
  concerned: { expression: 'worried', animation: null },
  welcoming: { expression: 'warm_smile', animation: 'slight_bow' },
  threatening: { expression: 'glare', animation: 'lean_forward' }
};
```

**Implementation**:
- 2D portrait sprites (easier than 3D expressions)
- Multiple emotion variants per character
- Smooth transitions between emotions

---

## Conditional Dialogue

### Flag-Based Variations

**RWMD supports conditions**:

```yaml
dialogue:
  - speaker: "Captain Elena"
    text: "Your mercy to that cultist was... unusual."
    emotion: "contemplative"
    condition: { flag: "spare_cultist_scenario_01" }
    
  - speaker: "Captain Elena"
    text: "Your ruthlessness sends a message."
    emotion: "approving_coldly"
    condition: { flag: "execute_cultist_scenario_01" }
```

**Engine checks flags** before showing line:

```typescript
function filterDialogueByFlags(dialogue: DialogueLine[], flags: string[]): DialogueLine[] {
  return dialogue.filter(line => {
    if (!line.condition) return true;  // No condition = always show
    
    if (line.condition.flag) {
      return flags.includes(line.condition.flag);
    }
    
    if (line.condition.reputation) {
      return checkReputationCondition(line.condition.reputation);
    }
    
    return true;
  });
}
```

### Reputation-Based Variations

**Different dialogue at different reputation levels**:

```yaml
dialogue:
  - speaker: "Carmilla Sanguis"
    text: "Ah, an honored guest. Welcome to the Crimson Courts."
    emotion: "welcoming"
    condition: { reputation: { crimson_pact: 50 } }  # High rep
    
  - speaker: "Carmilla Sanguis"
    text: "You. State your business quickly."
    emotion: "cold"
    condition: { reputation: { crimson_pact: -50 } }  # Low rep
    
  - speaker: "Carmilla Sanguis"
    text: "A stranger. How... interesting."
    emotion: "calculating"
    # Default (no condition) if neither above matches
```

---

## Voice Acting Integration

### Audio Files

**If we add voice acting**:

```typescript
interface VoicedDialogueLine {
  speaker: string;
  text: string;
  audioPath: string;  // /audio/dialogue/ottermere_greeting_01.mp3
  duration: number;   // Length in seconds
}

// Play audio when line shown
function showDialogueLine(line: VoicedDialogueLine) {
  const audio = new Audio(line.audioPath);
  audio.play();
  
  // Auto-advance after duration (or manual skip)
  setTimeout(() => {
    if (!manuallyAdvanced) {
      advanceDialogue();
    }
  }, line.duration * 1000);
}
```

**Audio Requirements**:
- 12 faction leaders (unique voices)
- ~1000-2000 dialogue lines
- Professional voice acting

**Cost**: $10,000-30,000 for full voice

**Recommendation for v1.0**: **Text only**, add voice in v2.0

---

## Dialogue Skipping

### Skip Options

**Players should be able to**:
- **Skip line**: Space/Click to next line immediately
- **Skip scene**: Esc to skip entire dialogue
- **Auto-advance**: Toggle auto-advance (for voiced dialogue)
- **Dialogue log**: Review previous lines

**Settings**:
```typescript
interface DialogueSettings {
  autoAdvance: boolean;
  autoAdvanceDelay: number;  // Seconds
  skipSeenDialogue: boolean;  // Auto-skip on replay
  textSpeed: 'instant' | 'fast' | 'normal' | 'slow';  // Typewriter
}
```

---

## Branching Dialogue Trees

### Complex Branches

**RWMD supports deep branching**:

```yaml
dialogue:
  - speaker: "Carmilla"
    text: "You've heard of the Crimson Pact, yes?"
    
choices:
  - text: "Yes, vampire slavers."
    consequence: "accusatory_response"
    dialogue:
      - speaker: "Carmilla"
        text: "Slavers? How crude. We are pragmatists."
        emotion: "offended"
    follow_up_choices:
      - text: "Pragmatic slavery is still slavery."
        consequence: "moral_stance"
        reputation: { crimson_pact: -15 }
      - text: "Fair point. Tell me more."
        consequence: "open_minded"
        reputation: { crimson_pact: 5 }
        
  - text: "Tell me about your faction."
    consequence: "neutral_inquiry"
    dialogue:
      - speaker: "Carmilla"
        text: "We ensure survival through order..."
        emotion: "explaining"
    # Continues...
```

**Max Depth**: 5 levels deep (prevent dialogue maze)

---

## Dialogue Memory

### Remembering Past Conversations

**Flag System** tracks conversation history:

```typescript
// Set flags during dialogue
if (playerChose("spare_cultist")) {
  setFlag("showed_mercy_scenario_01");
}

// Later dialogue references it
if (hasFlag("showed_mercy_scenario_01")) {
  showDialogue("@dialogue:carmilla_notes_your_mercy");
}
```

**NPCs remember**:
- Previous conversation topics
- Player's choices
- Reputation changes
- Promises made/broken

**Example**:
```
Scenario 1:
Player: "I promise to help the Order."
[Flag: promised_to_help_order]

Scenario 5:
Captain Elena: "You promised to help us. Will you honor that?"
  - [If helped in 2-4]: "You've kept your word so far."
  - [If didn't help]: "You broke your promise. Why should I trust you now?"
```

---

## Emotion System

### Portrait Expressions

**8 Base Emotions**:
1. Neutral - Default expression
2. Happy - Smile, pleased
3. Sad - Frown, disappointed
4. Angry - Scowl, aggressive
5. Surprised - Wide eyes, shocked
6. Concerned - Worried, anxious
7. Welcoming - Warm, inviting
8. Threatening - Glare, hostile

**Per Character**: 8 portrait variants

**Total Assets**: 12 leaders x 8 emotions = 96 portraits

### Expression Blending

**Smooth transitions**:
```typescript
function transitionEmotion(from: Emotion, to: Emotion, duration: number) {
  // Cross-fade between portrait sprites
  fadeOut(portraitImages[from], duration / 2);
  fadeIn(portraitImages[to], duration / 2);
  
  // Optional: Subtle animation
  if (EMOTION_ANIMATIONS[to]) {
    playAnimation(EMOTION_ANIMATIONS[to]);
  }
}
```

---

## Dialogue UI Components

### DialogueBox Component

```typescript
export function DialogueBox({
  dialogue,
  onAdvance,
  onChoice
}: DialogueBoxProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  
  // Typewriter effect (optional)
  useEffect(() => {
    if (settings.textSpeed === 'instant') {
      setTypewriterText(dialogue[currentLine].text);
    } else {
      // Animate text appearance
      typewriterEffect(dialogue[currentLine].text, settings.textSpeed);
    }
  }, [currentLine]);
  
  return (
    <div className="dialogue-box">
      <PortraitDisplay 
        character={dialogue[currentLine].speaker}
        emotion={dialogue[currentLine].emotion}
      />
      
      <div className="dialogue-content">
        <div className="speaker-name">
          {dialogue[currentLine].speaker}
        </div>
        
        <div className="dialogue-text">
          {typewriterText}
        </div>
        
        {/* Choices or Continue */}
        {dialogue[currentLine].choices ? (
          <ChoiceButtons 
            choices={dialogue[currentLine].choices}
            onSelect={onChoice}
          />
        ) : (
          <ContinuePrompt onAdvance={onAdvance} />
        )}
      </div>
    </div>
  );
}
```

---

## Reputation Display in Dialogue

### Show Consequences

**When hovering over choice**:

```
┌────────────────────────────────────┐
│  Choice Preview                     │
├────────────────────────────────────┤
│  "I'll help defend the shrine."     │
│                                     │
│  Consequences:                      │
│  ✅ Dawnshield Order: +10           │
│  ❌ Veilbound Synod: -5             │
│                                     │
│  Flags:                             │
│  • Helpful                          │
│  • Light Path Started ⚠️           │
│                                     │
│  [Click to select]                  │
└────────────────────────────────────┘
```

**Real-time feedback** - player sees impact before committing

---

## Dialogue Pacing

### Text Speed Options

```typescript
const TEXT_SPEEDS = {
  instant: 0,        // All text appears immediately
  fast: 10,          // 10ms per character
  normal: 30,        // 30ms per character
  slow: 50,          // 50ms per character
};

function typewriterEffect(text: string, speed: number) {
  let index = 0;
  const interval = setInterval(() => {
    if (index < text.length) {
      setDisplayText(text.substring(0, index + 1));
      index++;
    } else {
      clearInterval(interval);
    }
  }, speed);
}
```

### Auto-Advance

**For cutscenes/intros**:
```typescript
interface AutoAdvanceSettings {
  enabled: boolean;
  delay: number;  // Seconds after text fully displayed
  skipOnInput: boolean;  // Any key press skips
}

// Auto-advance after delay
useEffect(() => {
  if (settings.autoAdvance && !waitingForChoice) {
    const timer = setTimeout(() => {
      advanceDialogue();
    }, settings.delay * 1000);
    
    return () => clearTimeout(timer);
  }
}, [currentLine]);
```

---

## Special Dialogue Types

### Narrator Dialogue

**No portrait, different styling**:

```yaml
dialogue:
  - speaker: "NARRATOR"
    text: "Eighty years ago, the sun shattered..."
    emotion: null
    style: "narrator"  # Different UI treatment
```

**UI**:
- No portrait
- Centered text
- Different font (serif, larger)
- Fade in/out transitions

### Internal Monologue

**Player character thinking**:

```yaml
dialogue:
  - speaker: "SELF"
    text: "(Should I trust her? The Crimson Pact has a dark history...)"
    emotion: null
    style: "internal"
```

**UI**:
- Italicized text
- Smaller, bottom-corner position
- Slightly transparent
- Quick fade

### Group Conversations

**Multiple speakers in sequence**:

```yaml
dialogue:
  - speaker: "Captain Elena"
    text: "We need to attack now!"
    
  - speaker: "Elder Ottermere"
    text: "Patience. Let them come to us."
    
  - speaker: "Player"  # Player's dialogue
    text: "I agree with the Elder."
    consequence: "side_with_ottermere"
```

**Portrait switching** - smooth transitions between speakers

---

## Dialogue Hooks

### onDialogueStart

```typescript
function onDialogueStart(sceneId: string) {
  // Pause combat
  pauseCombat();
  
  // Dim background
  dimWorld();
  
  // Load scene
  dialogueEngine.loadScene(sceneId);
  
  // Show dialogue UI
  showDialogueBox();
}
```

### onDialogueEnd

```typescript
function onDialogueEnd(sceneId: string) {
  // Resume combat
  resumeCombat();
  
  // Restore background
  restoreWorld();
  
  // Hide dialogue UI
  hideDialogueBox();
  
  // Save conversation to history
  saveConversation(sceneId);
}
```

### onChoiceMade

```typescript
function onChoiceMade(choice: Choice) {
  // Apply reputation
  for (const [faction, change] of Object.entries(choice.reputation)) {
    updateReputation(faction, change);
    
    // Visual feedback
    showReputationChange(faction, change);
  }
  
  // Set flags
  for (const flag of choice.flags) {
    setFlag(flag);
    
    // Notify if important
    if (IMPORTANT_FLAGS.includes(flag)) {
      showNotification(`Path locked: ${flag}`);
    }
  }
  
  // Log choice
  logChoice(choice);
}
```

---

## Dialogue Log

### Conversation History

**Players can review past dialogue**:

```
┌─────────────────────────────────────────┐
│  DIALOGUE LOG                      [X]  │
├─────────────────────────────────────────┤
│  Scenario 1: Oath of Dawn               │
│                                         │
│  Elder Ottermere:                       │
│  "Welcome to Riverwatch, Realm Walker." │
│                                         │
│  Player:                                │
│  "Thank you for the welcome."           │
│                                         │
│  Captain Elena:                         │
│  "We need your help defending..."       │
│                                         │
│  [Choice Made]: Help defend shrine      │
│  ✅ Dawnshield Order: +10               │
│                                         │
│  ... (scrollable history)                │
│                                         │
│  [Export] [Clear] [Close]                │
└─────────────────────────────────────────┘
```

**Features**:
- Full conversation history
- Shows choices made
- Shows reputation changes
- Exportable (for sharing/debugging)

---

## Implementation Plan

### Phase 1: Engine (3-5 hours)

1. DialogueEngine class
2. RWMD parsing integration
3. Flag system
4. Reputation application
5. State management

### Phase 2: UI (8-12 hours)

1. DialogueBox component
2. ChoiceButtons component
3. Portrait display
4. Emotion system
5. Typewriter effect
6. Skip/auto-advance

### Phase 3: Integration (5-8 hours)

1. Hook into scenarios
2. Trigger dialogue at events
3. Storyboard interludes
4. NPC conversations
5. Testing/polish

**Total**: 16-25 hours

**OR**: AI-generate dialogue content (much faster)

---

## See Also

- `rwmd.md` - RWMD format specification
- `storyboard.md` - Interlude system uses dialogue
- `scenarios.md` - When dialogue triggers
- `SYSTEMS_OVERVIEW.md` - Where dialogue fits overall
- `ui-components.md` - UI component library

---

**Remember**: Dialogue is how players experience the story. Make it smooth, skippable, and meaningful.
