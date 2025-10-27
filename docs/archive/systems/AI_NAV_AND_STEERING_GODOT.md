# Yuka → RWMD 2.1 Complete Mapping

**Created**: 2025-10-19  
**Purpose**: Map EVERY Yuka concept to RWMD globals (self-contained AI system)

---

## THE REALIZATION

**Yuka's structure IS ALREADY Singular > Plural > Group!**

```
Yuka:
- Goal (singular) → CompositeGoal (plural) → Think (group)
- SteeringBehavior (singular) → SteeringManager (plural)
- Node (singular) → Graph (plural)
- Trigger (singular) → TriggerRegion (group)
```

**WE CAN MAP THIS 1:1 TO RWMD GLOBALS.**

---

## Yuka Directory Structure

```
/tmp/yuka/src/
├── core/              # Entity, EntityManager
├── goal/              # Goal system
├── steering/          # Movement behaviors
├── perception/        # Vision, Memory
├── trigger/           # Event triggers
├── fsm/               # State machines
├── fuzzy/             # Fuzzy logic
├── graph/             # Pathfinding
├── navigation/        # NavMesh
├── task/              # Task system
└── math/              # Vector math
```

**Each directory = RWMD global namespace subdirectory**

---

## COMPLETE MAPPING: Yuka → RWMD Globals

### Domain 1: GOAL SYSTEM

**Yuka Classes**:

- `Goal` (singular - one goal)
- `CompositeGoal` (plural - goal with subgoals)
- `GoalEvaluator` (evaluates utility)
- `Think` (group - manages all goals)

**RWMD Globals**:

```yaml
# === SINGULAR: One Goal ===
::global @global:yuka:goal
extends: @global:base:behavior
status: inactive  # inactive, active, completed, failed
owner: null

__typescript:
  class: Goal
  methods:
    activate: |
      function activate() {
        this.status = 'active';
      }

    execute: |
      function execute() {
        // Override in subclass
      }

    terminate: |
      function terminate() {
        this.status = 'completed';
      }
::end

# === PLURAL: Composite Goal ===
::global @global:yuka:composite_goal
extends: @global:yuka:goal
subgoals: []

__typescript:
  class: CompositeGoal
  extends: Goal
  methods:
    addSubgoal: |
      function addSubgoal(goal) {
        this.subgoals.unshift(goal);
      }

    executeSubgoals: |
      function executeSubgoals() {
        const current = this.currentSubgoal();
        if (current) {
          current.activateIfInactive();
          current.execute();
          if (current.completed()) {
            current.terminate();
            this.removeSubgoal(current);
          }
        }
      }
::end

# === GROUP: Think Brain ===
::global @global:yuka:think
extends: @global:yuka:composite_goal
evaluators: []
arbitration_type: highest_score

__typescript:
  class: Think
  extends: CompositeGoal
  methods:
    arbitrate: |
      function arbitrate() {
        let highestScore = 0;
        let bestGoal = null;

        for (const evaluator of this.evaluators) {
          const score = evaluator.calculateDesirability(this.owner);
          if (score > highestScore) {
            highestScore = score;
            bestGoal = evaluator.goal;
          }
        }

        if (bestGoal && bestGoal !== this.currentSubgoal()) {
          this.clearSubgoals();
          this.addSubgoal(bestGoal);
        }
      }
::end
```

**Usage in Content**:

```yaml
::character @character:soldier
extends: @global:yuka:agent

# Character gets Think brain automatically
brain: @global:yuka:think
goals:
  - anchor: @goal:survive
    priority: 10
  - anchor: @goal:attack_enemy
    priority: 8
::end

# Define specific goals
::goal @goal:survive
extends: @global:yuka:goal
name: "Survive"

__typescript:
  evaluate: |
    function evaluate(agent) {
      const healthPercent = agent.health / agent.maxHealth;
      return 1.0 - healthPercent; // Higher desire when low health
    }

  execute: |
    function execute(agent) {
      // Find cover, heal, retreat
      if (!this.subgoals.length) {
        this.addSubgoal(new SeekCover(agent));
      }
    }
::end
```

---

### Domain 2: STEERING SYSTEM

**Yuka Classes**:

- `SteeringBehavior` (singular - one behavior)
- `SteeringManager` (plural - combines behaviors)
- `Vehicle` (entity with steering)

**RWMD Globals**:

```yaml
# === SINGULAR: One Steering Behavior ===
::global @global:yuka:steering_behavior
extends: @global:base:behavior
active: true
weight: 1.0

__typescript:
  class: SteeringBehavior
  methods:
    calculate: |
      function calculate(vehicle, force, delta) {
        // Override in subclass
        return force;
      }
::end

# === BUILT-IN BEHAVIORS ===

::global @global:yuka:seek
extends: @global:yuka:steering_behavior
target: null

__typescript:
  class: SeekBehavior
  extends: SteeringBehavior
  calculate: |
    function calculate(vehicle, force, delta) {
      force.subVectors(this.target, vehicle.position);
      force.normalize();
      force.multiplyScalar(vehicle.maxSpeed);
      force.sub(vehicle.velocity);
      return force;
    }
::end

::global @global:yuka:flee
extends: @global:yuka:steering_behavior
target: null

__typescript:
  class: FleeBehavior
  extends: SteeringBehavior
  calculate: |
    function calculate(vehicle, force, delta) {
      force.subVectors(vehicle.position, this.target);
      force.normalize();
      force.multiplyScalar(vehicle.maxSpeed);
      force.sub(vehicle.velocity);
      return force;
    }
::end

::global @global:yuka:arrive
extends: @global:yuka:steering_behavior
target: null
deceleration: 3.0

__typescript:
  class: ArriveBehavior
  extends: SteeringBehavior
  # Full Yuka arrive logic here
::end

# === PLURAL: Steering Manager ===
::global @global:yuka:steering_manager
extends: @global:base:resource
behaviors: []

__typescript:
  class: SteeringManager
  methods:
    add: |
      function add(behavior) {
        this.behaviors.push(behavior);
      }

    calculate: |
      function calculate(vehicle, delta) {
        const totalForce = new Vector3();

        for (const behavior of this.behaviors) {
          if (behavior.active) {
            const force = new Vector3();
            behavior.calculate(vehicle, force, delta);
            force.multiplyScalar(behavior.weight);
            totalForce.add(force);
          }
        }

        return totalForce;
      }
::end
```

**Usage**:

```yaml
::character @character:soldier
extends: @global:yuka:agent

steering:
  behaviors:
    - type: @global:yuka:seek
      weight: 1.0
      target: @anchor:dynamic  # Resolved at runtime

    - type: @global:yuka:obstacle_avoidance
      weight: 2.0  # Higher weight = stronger influence
::end
```

---

### Domain 3: PERCEPTION SYSTEM

**Yuka Classes**:

- `Vision` (singular - one sense)
- `MemoryRecord` (singular - one memory)
- `MemorySystem` (plural - collection of memories)

**RWMD Globals**:

```yaml
# === SINGULAR: Vision ===
::global @global:yuka:vision
extends: @global:base:resource
range: 10
field_of_view: 180  # degrees

__typescript:
  class: Vision
  methods:
    visible: |
      function visible(entity, obstacles) {
        const distance = entity.position.distanceTo(this.owner.position);
        if (distance > this.range) return false;

        const toEntity = entity.position.clone().sub(this.owner.position);
        const angle = this.owner.forward.angleTo(toEntity);

        if (angle > (this.field_of_view / 2) * Math.PI / 180) {
          return false;
        }

        // Check LOS (raycasting)
        return !this.isObstructed(entity, obstacles);
      }
::end

# === SINGULAR: Memory Record ===
::global @global:yuka:memory_record
extends: @global:base:resource
entity: null
timestamp: 0
last_seen_position: {x: 0, y: 0, z: 0}

__typescript:
  class: MemoryRecord
::end

# === PLURAL: Memory System ===
::global @global:yuka:memory_system
extends: @global:base:resource
records: []
memory_span: 5.0  # seconds

__typescript:
  class: MemorySystem
  methods:
    update: |
      function update(currentTime) {
        // Remove old memories
        this.records = this.records.filter(record =>
          currentTime - record.timestamp < this.memory_span
        );
      }

    createRecord: |
      function createRecord(entity) {
        const record = new MemoryRecord();
        record.entity = entity;
        record.timestamp = Date.now();
        record.last_seen_position = entity.position.clone();
        this.records.push(record);
      }
::end
```

---

### Domain 4: GRAPH / PATHFINDING

**Yuka Classes**:

- `Node` (singular)
- `Edge` (singular)
- `Graph` (plural)
- `AStar` (algorithm)

**RWMD Globals**:

```yaml
# === SINGULAR: Node ===
::global @global:yuka:node
extends: @global:base:resource
index: 0
position: null

__typescript:
  class: Node
::end

# === SINGULAR: Edge ===
::global @global:yuka:edge
extends: @global:base:resource
from: 0
to: 0
cost: 1.0

__typescript:
  class: Edge
::end

# === PLURAL: Graph ===
::global @global:yuka:graph
extends: @global:base:resource
nodes: []
edges: []

__typescript:
  class: Graph
  methods:
    addNode: |
      function addNode(node) {
        node.index = this.nodes.length;
        this.nodes.push(node);
      }

    addEdge: |
      function addEdge(edge) {
        this.edges.push(edge);
      }

    getNeighbors: |
      function getNeighbors(nodeIndex) {
        return this.edges
          .filter(e => e.from === nodeIndex)
          .map(e => this.nodes[e.to]);
      }
::end

# === ALGORITHM: A* ===
::global @global:yuka:astar
extends: @global:base:behavior

__typescript:
  class: AStar
  methods:
    search: |
      function search(graph, source, target) {
        // Full A* implementation from Yuka
        // Returns path as array of node indices
      }
::end
```

**Usage (Hex Grid)**:

```yaml
::map @map:battlefield_19hex
graph: @global:yuka:graph
pathfinding: @global:yuka:astar

# Auto-generate graph from hex tiles
nodes:
  - position: {q: 0, r: 0}
  - position: {q: 1, r: 0}
  # ... all hexes

edges:
  - from: 0
    to: 1
    cost: 1.0  # movement cost
```

---

### Domain 5: TRIGGER SYSTEM

**Yuka Classes**:

- `TriggerRegion` (singular - one area)
- `Trigger` (plural - manages entities in region)

**RWMD Globals**:

```yaml
# === SINGULAR: Trigger Region ===
::global @global:yuka:trigger_region
extends: @global:base:resource
type: spherical  # or rectangular
center: {x: 0, y: 0, z: 0}
radius: 5.0

__typescript:
  class: SphericalTriggerRegion
  methods:
    inside: |
      function inside(position) {
        return position.distanceTo(this.center) <= this.radius;
      }
::end

# === PLURAL: Trigger ===
::global @global:yuka:trigger
extends: @global:base:event
region: null
on_enter: []
on_exit: []
on_stay: []

__typescript:
  class: Trigger
  methods:
    check: |
      function check(entity) {
        const inside = this.region.inside(entity.position);
        const wasInside = this.entities.has(entity);

        if (inside && !wasInside) {
          this.entities.add(entity);
          this.onEnter(entity);
        } else if (!inside && wasInside) {
          this.entities.delete(entity);
          this.onExit(entity);
        } else if (inside) {
          this.onStay(entity);
        }
      }
::end
```

**Usage**:

```yaml
::trigger @trigger:shrine_activation
region:
  type: spherical
  center: {q: 5, r: 5}  # hex coords converted to world
  radius: 2.0

on_enter:
  - __typescript: |
      function onEnter(entity) {
        if (entity.faction === 'player') {
          showDialogue('@scene:shrine_discovered');
        }
      }

on_stay:
  - __typescript: |
      function onStay(entity) {
        entity.health += 1; // Healing shrine
      }
::end
```

---

### Domain 6: FSM (Finite State Machine)

**Yuka Classes**:

- `State` (singular)
- `StateMachine` (plural)

**RWMD Globals**:

```yaml
# === SINGULAR: State ===
::global @global:yuka:state
extends: @global:base:behavior
name: "idle"

__typescript:
  class: State
  methods:
    enter: |
      function enter(entity) {
        // Called when entering state
      }

    execute: |
      function execute(entity, delta) {
        // Called every tick
      }

    exit: |
      function exit(entity) {
        // Called when leaving state
      }
::end

# === PLURAL: State Machine ===
::global @global:yuka:state_machine
extends: @global:base:behavior
states: []
current_state: null
global_state: null

__typescript:
  class: StateMachine
  methods:
    changeTo: |
      function changeTo(stateName) {
        if (this.currentState) {
          this.currentState.exit(this.owner);
        }

        this.currentState = this.states.find(s => s.name === stateName);

        if (this.currentState) {
          this.currentState.enter(this.owner);
        }
      }

    update: |
      function update(delta) {
        if (this.globalState) {
          this.globalState.execute(this.owner, delta);
        }

        if (this.currentState) {
          this.currentState.execute(this.owner, delta);
        }
      }
::end
```

---

## DIRECTORY STRUCTURE FOR GLOBALS

```
client/src/lib/world/globals/
├── base/                           # Layer 1: Base types
│   ├── entity.rwmd
│   ├── resource.rwmd
│   ├── event.rwmd
│   └── behavior.rwmd
│
├── yuka/                           # Layer 2: Yuka integration
│   ├── core/
│   │   ├── entity.rwmd             # GameEntity
│   │   ├── entity_manager.rwmd    # EntityManager
│   │   └── message.rwmd            # Telegram
│   │
│   ├── goal/                       # Goal system
│   │   ├── goal.rwmd               # Goal (singular)
│   │   ├── composite_goal.rwmd     # CompositeGoal (plural)
│   │   ├── evaluator.rwmd          # GoalEvaluator
│   │   └── think.rwmd              # Think (group)
│   │
│   ├── steering/                   # Steering system
│   │   ├── behavior.rwmd           # SteeringBehavior (singular)
│   │   ├── manager.rwmd            # SteeringManager (plural)
│   │   ├── vehicle.rwmd            # Vehicle
│   │   └── behaviors/
│   │       ├── seek.rwmd
│   │       ├── flee.rwmd
│   │       ├── arrive.rwmd
│   │       ├── wander.rwmd
│   │       ├── pursuit.rwmd
│   │       ├── evade.rwmd
│   │       ├── obstacle_avoidance.rwmd
│   │       ├── separation.rwmd
│   │       ├── alignment.rwmd
│   │       └── cohesion.rwmd
│   │
│   ├── perception/                 # Perception system
│   │   ├── vision.rwmd             # Vision (singular)
│   │   ├── memory_record.rwmd      # MemoryRecord (singular)
│   │   └── memory_system.rwmd      # MemorySystem (plural)
│   │
│   ├── graph/                      # Pathfinding
│   │   ├── node.rwmd               # Node (singular)
│   │   ├── edge.rwmd               # Edge (singular)
│   │   ├── graph.rwmd              # Graph (plural)
│   │   ├── astar.rwmd              # A* algorithm
│   │   └── dijkstra.rwmd           # Dijkstra
│   │
│   ├── navigation/                 # NavMesh
│   │   ├── navmesh.rwmd
│   │   └── corridor.rwmd
│   │
│   ├── trigger/                    # Trigger system
│   │   ├── region.rwmd             # TriggerRegion (singular)
│   │   ├── trigger.rwmd            # Trigger (plural)
│   │   └── regions/
│   │       ├── spherical.rwmd
│   │       └── rectangular.rwmd
│   │
│   ├── fsm/                        # State machines
│   │   ├── state.rwmd              # State (singular)
│   │   └── state_machine.rwmd      # StateMachine (plural)
│   │
│   └── task/                       # Task system
│       ├── task.rwmd
│       └── task_queue.rwmd
│
└── integrations/                   # Layer 3: Custom
    ├── reputation.rwmd
    ├── mythology_echoes.rwmd
    └── ...
```

**EVERY Yuka class maps to ONE RWMD global.**

---

## BENEFITS OF THIS APPROACH

### 1. Self-Contained AI System

- ALL AI code in RWMD globals
- NO separate `client/src/lib/ai/` package
- Just reference `@global:yuka:think` in characters

### 2. Inline TypeScript = Direct Execution

```yaml
::character @character:smart_enemy
extends: @global:yuka:agent

# Brain is inline, no imports needed
brain:
  type: @global:yuka:think
  evaluators:
    - __typescript: |
        function evaluate(agent) {
          return agent.health < 50 ? 1.0 : 0.0;
        }
::end
```

### 3. Hot Reload Works Perfectly

- Change RWMD goal → Langium regenerates → Instant update
- No separate TypeScript file to reload
- Single module = single HMR update

### 4. Tree-Shaking Works

```typescript
// Vite can see what's actually used
import { SeekBehavior } from "@/lib/world/globals/yuka/steering/seek";
// Only bundles what's referenced in RWMD
```

### 5. No Package Separation Needed

**Before** (separate packages):

```
client/src/lib/ai/          (Yuka wrapper code)
client/src/lib/pathfinding/ (Graph utilities)
client/src/lib/perception/  (Vision systems)
```

**After** (all in globals):

```
client/src/lib/world/globals/yuka/
# Everything in ONE place, organized by Yuka's own structure
```

---

## MIGRATION PLAN

### Phase 1: Create Global Structure

1. Create `globals/yuka/` directory
2. For each Yuka class, create corresponding `.rwmd` global
3. Include inline TypeScript from Yuka source

### Phase 2: Update Character Definitions

1. All `::character` extend `@global:yuka:agent`
2. Add `brain: @global:yuka:think`
3. Define `goals:` array with evaluators

### Phase 3: Delete Separate AI Package

1. Remove `client/src/lib/ai/`
2. Remove `client/src/systems/ai/`
3. Everything now in globals

### Phase 4: Test & Validate

1. Run existing AI tests
2. Verify hot reload works
3. Check bundle size (should be smaller)

**Timeline**: 1-2 weeks

---

## ACCEPTANCE CRITERIA

**System is complete when**:

1. ✅ All Yuka classes have RWMD global equivalents
2. ✅ Inline TypeScript works
3. ✅ Characters use `@global:yuka:agent`
4. ✅ No separate AI package exists
5. ✅ Hot reload faster
6. ✅ Bundle size smaller (tree-shaking works)
7. ✅ All AI tests pass

---

## IMMEDIATE NEXT STEP

**Create ONE example to prove concept**:

```yaml
# globals/yuka/goal/goal.rwmd
::global @global:yuka:goal
extends: @global:base:behavior
status: inactive

__typescript:
  import: |
    import type { GameEntity } from '@/lib/world/types';

  class: Goal

  activate: |
    function activate(): void {
      this.status = 'active';
    }

  execute: |
    function execute(): void {
      // Override in subclass
    }
::end
```

**Then use it**:

```yaml
::character @character:test_soldier
extends: @global:yuka:agent

brain:
  type: @global:yuka:think
  goals:
    - extends: @global:yuka:goal
      name: "attack"

      __typescript:
        evaluate: |
          function evaluate(agent: GameEntity): number {
            const enemies = findNearbyEnemies(agent);
            return enemies.length > 0 ? 1.0 : 0.0;
          }
::end
```

**If this works, we've proven the entire architecture.** 🎯

---

**Ready to implement?**

# Navigation & Steering in Godot — LimboAI Edition (RWMD 2.2+)

**Updated:** 2025-10-20  
**Goal:** Replace legacy Yuka mapping with a Godot‑native stack using **NavigationServer(2D/3D)** + **LimboAI** behavior trees/tasks, with optional steering add‑ons. No TypeScript. Deterministic, data‑driven, ECS‑friendly.

---

## Why this change?

We’re retiring the Yuka bridge. Everything lives natively in Godot now:

- **Pathfinding:** Godot `NavigationServer3D` / `NavigationServer2D`, NavMesh/regions/obstacles.
- **Decision‑making:** **LimboAI** behavior trees & blackboards.
- **Steering (optional):** Lightweight GDScript layer (Seek/Flee/Arrive/Wander, separation, obstacle avoidance) that blends with server paths.
- **Data:** RWMD sources compiled to `.tres` (content), but AI logic runs in GDScript/limbo tasks.

This gives us deterministic server paths, built‑in avoidance, editor tooling, and first‑class debugging.

---

## Architecture Overview

```
Agent (Node3D)
├── LimboBlackboard      # key-value state shared by BT + gameplay
├── LimboBehaviorTree    # behavior graph, running tasks
├── SteeringAgent        # optional per-frame steering blend
├── NavigationAgent3D    # local avoidance + path following
└── DebugDraw (optional) # gizmos for paths/forces
```

**Flow:** BT chooses a high‑level action → sets blackboard targets → `NavigationAgent3D` requests a path → optional `SteeringAgent` applies micro‑adjustments (seek/arrive/separation) → motion written to ECS/character controller.

---

## Core Building Blocks

### Navigation (Godot 4.x)

- **NavigationServer3D / 2D** + `NavigationRegion*` baked from NavMesh.
- **NavigationAgent3D** for local avoidance, path query, velocity proposals.
- **Dynamic obstacles:** `NavigationObstacle3D` for doors/units; update on open/close.

**Recommended defaults:**

- `path_max_distance = 64`, `path_desired_distance = 0.5`
- `target_desired_distance = 0.6` (melee: smaller; ranged: larger)
- `avoidance_enabled = true`, tune `radius`, `neighbor_dist`, `max_neighbors` per unit size.

### LimboAI

- **Blackboard contract** (see below).
- Tasks: `MoveTo`, `FollowTarget`, `FleeFrom`, `WanderArea`, `Wait`, `ParallelAvoidance` (custom).
- **Decorators** for reachability checks, timeout, replanning.

### Steering (optional)

A tiny GDScript layer that computes forces and blends with agent velocity. Used for polish: arrive easing, separation in tight spaces, flocking, strafing arcs.

---

## Blackboard Contract (minimal, stable)

| Key               | Type       | Description                              |
| ----------------- | ---------- | ---------------------------------------- |
| `target_position` | Vector3    | World goal pos set by BT/tasks.          |
| `target_node`     | NodePath   | Optional tracked target (follow/attack). |
| `move_speed`      | float      | Max linear speed.                        |
| `arrive_radius`   | float      | Slowdown radius for arrive.              |
| `avoid_weight`    | float      | Blend weight for local avoidance.        |
| `steer_weights`   | Dictionary | e.g. `{seek:1.0, separation:0.6}`        |
| `path_status`     | String     | `ok`, `unreachable`, `stale`.            |

Keep this stable; tasks & agents depend on it.

---

## GDScript: SteeringAgent (optional)

_File: `addons/realmwalker/ai/steering/SteeringAgent.gd`_

```gdscript
extends Node
class_name SteeringAgent

@export var weight_seek := 1.0
@export var weight_arrive := 1.0
@export var weight_separation := 0.0
@export var arrive_radius := 1.2

var velocity: Vector3 = Vector3.ZERO
var max_speed: float = 4.0
var neighbors: Array[Node3D] = []

func compute_desired(owner: Node3D, target: Vector3) -> Vector3:
	var to_target := target - owner.global_position
	var dist := to_target.length()
	if dist < 0.001:
		return Vector3.ZERO
	var desired := to_target.normalized() * max_speed
	# Arrive easing
	if dist < arrive_radius:
		desired *= clamp(dist / arrive_radius, 0.1, 1.0)
	return desired

func separation(owner: Node3D) -> Vector3:
	var f := Vector3.ZERO
	for n in neighbors:
		var d := owner.global_position - n.global_position
		var l := d.length()
		if l > 0.001 and l < 1.0:
			f += d.normalized() * ((1.0 - l) * max_speed)
	return f

func blend(owner: Node3D, target: Vector3, dt: float) -> Vector3:
	var desired := compute_desired(owner, target)
	var sep := separation(owner) * weight_separation
	var steer := (desired + sep) - velocity
	velocity += steer * dt * 5.0
	velocity = velocity.clamped(max_speed)
	return velocity
```

Attach this to agents that need polish beyond `NavigationAgent3D`.

---

## GDScript: LimboAI Tasks (movement set)

### MoveToPosition

_File: `addons/realmwalker/ai/tasks/MoveToPosition.gd`_

```gdscript
extends LimboTask

@export var bb_key_target := "target_position"
@export var bb_key_status := "path_status"

var nav: NavigationAgent3D

func _enter() -> void:
	nav = LimboUtils.get_child_or_owner(self, NavigationAgent3D)
	if nav == null:
		return _fail("No NavigationAgent3D")
	var pos := blackboard.get_vector3(bb_key_target)
	nav.set_target_position(pos)
	blackboard.set_string(bb_key_status, "planning")

func _tick(delta: float) -> int:
	if nav.is_navigation_finished():
		blackboard.set_string(bb_key_status, "ok")
		return LimboTask.Status.SUCCESS
	var next_vel := nav.get_next_path_position() - nav.get_owner().global_position
	if next_vel.length() > 0.001:
		next_vel = next_vel.normalized() * nav.max_speed
		nav.set_velocity(next_vel)
	return LimboTask.Status.RUNNING
```

### FollowTarget

_File: `addons/realmwalker/ai/tasks/FollowTarget.gd`_

```gdscript
extends LimboTask

@export var bb_key_target_node := "target_node"
@export var leash := 8.0

var nav: NavigationAgent3D
var target: Node3D

func _enter() -> void:
	nav = LimboUtils.get_child_or_owner(self, NavigationAgent3D)
	target = get_node_or_null(blackboard.get_node_path(bb_key_target_node))
	if nav == null or target == null:
		return _fail("Missing nav/target")
	nav.set_target_position(target.global_position)

func _tick(delta: float) -> int:
	if target == null:
		return LimboTask.Status.FAILURE
	var dist := nav.get_owner().global_position.distance_to(target.global_position)
	if dist > leash:
		nav.set_target_position(target.global_position)
	return LimboTask.Status.RUNNING
```

### FleeFrom

_File: `addons/realmwalker/ai/tasks/FleeFrom.gd`_

```gdscript
extends LimboTask

@export var bb_key_threat := "target_node"
@export var flee_distance := 12.0

var nav: NavigationAgent3D
var steering: SteeringAgent

func _enter() -> void:
	nav = LimboUtils.get_child_or_owner(self, NavigationAgent3D)
	steering = LimboUtils.get_child_or_owner(self, SteeringAgent)
	if nav == null or steering == null:
		return _fail("Missing nav/steering")

func _tick(delta: float) -> int:
	var threat: Node3D = get_node_or_null(blackboard.get_node_path(bb_key_threat))
	if threat == null:
		return LimboTask.Status.FAILURE
	var owner := nav.get_owner() as Node3D
	var away := (owner.global_position - threat.global_position).normalized()
	var target := owner.global_position + away * flee_distance
	nav.set_target_position(target)
	var v := steering.blend(owner, nav.get_next_path_position(), delta)
	nav.set_velocity(v)
	return LimboTask.Status.RUNNING
```

---

## Behavior Tree Snippet (LimboAI)

```gdscript
# Example pseudo-graph (LimboAI editor or JSON import)
Selector
├─ Sequence(HasThreat)
│  ├─ Task: FleeFrom
│  └─ Decorator: Until(distance_to_threat > 15)
└─ Sequence(HasTarget)
   ├─ Task: MoveToPosition
   └─ Task: Wait(0.25)
```

---

## ECS Bridge

- **Read:** `NavigationAgent3D` and `SteeringAgent` compute world velocity.
- **Write:** A `KinematicMotionSystem` (or CharacterBody3D) consumes velocity and updates the ECS transform.
- Sync blackboard keys from ECS when state changes (e.g., target acquired/lost).

---

## Path Smoothing & Replanning

- Enable `NavigationAgent3D.path_postprocessing = NavigationPathQueryParameters3D.PATH_POSTPROCESSING_EDGECENTERED`.
- Replan cadence via `MoveToPosition` (on distance error, stuck timer, or topology change signal `navigation_finished` + `path_changed`).

---

## Dynamic Obstacles

- Convert doors/shields/units to `NavigationObstacle3D`.
- Toggle `carve_navigation_mesh` on open/close.
- For big movers (bosses), use temporary obstacle hulls following the actor.

---

## Debugging

- **LimboAI panel**: watch tick, status, and BB keys.
- **Navigation debug**: `NavigationServer3D` debug draw, `NavigationAgent3D.get_current_navigation_path()` gizmos.
- Add `DebugDraw.gd` to visualize desired vs. actual velocity & steering forces.

---

## Directory Layout

```
addons/realmwalker/ai/
├── tasks/
│   ├── MoveToPosition.gd
│   ├── FollowTarget.gd
│   └── FleeFrom.gd
├── steering/
│   └── SteeringAgent.gd
└── debug/
    └── DebugDraw.gd (optional)
```

---

## Migration from Yuka (ONE‑OFF)

1. **Delete Yuka wrappers** and any TS bindings.
2. **Replace goals/state logic** with LimboAI behavior trees.
3. **Swap steering**: Use `SteeringAgent.gd` for arrive/separation polish only.
4. **NavMesh bake** for all levels; place `NavigationRegion3D` and agent nodes.
5. **Wire blackboard keys** from gameplay code; remove TS evals.

**Acceptance:** Agents navigate via `MoveToPosition`, follow/avoid via tasks, and show stable local avoidance. No Yuka code remains.

---

## Checklist

- [ ] Navigation regions present and baked.
- [ ] Agents have `NavigationAgent3D` configured.
- [ ] LimboAI tree runs and updates blackboard.
- [ ] Tasks compile and succeed.
- [ ] Optional steering blends do not fight `NavigationAgent3D`.
- [ ] Debug overlays show sane velocities and paths.

---

## Next Steps

- Add `WanderArea.gd`, `StrafeAround.gd`, `PredictivePursuit.gd`.
- Implement **cover selection** task using a `CoverNavTag` map query.
- Author **group movement** with formation anchors + separation weight.

---

**This document supersedes the old “Yuka → RWMD Mapping”.** All new work should target the LimboAI + Godot navigation stack.
