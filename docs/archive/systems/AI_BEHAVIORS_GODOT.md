---
# AI Behaviors in Realm Walker: Design and Integration with LimboAI

## Introduction

The AI system in **Realm Walker** is designed to be modular, deterministic, and tightly integrated with the engine's Entity-Component-System (ECS) architecture. Our goals are to build an AI framework that is:

- **Modular**: Easily extensible with reusable behavior components and tasks.
- **Deterministic**: Ensuring consistent and reproducible AI decision-making for debugging and gameplay balance.
- **ECS-driven**: Leveraging the ECS pattern to cleanly separate data (components) from logic (systems).
- **Extendable**: Allowing future AI improvements, including faction-specific behaviors, difficulty scaling, and emergent tactics.

To meet these goals, we have integrated **LimboAI**, a lightweight and flexible behavior tree library for Godot. LimboAI offers a clean separation between behavior logic and data, a composable task system, and straightforward debugging tools. Its design aligns well with Realm Walker’s ECS model and supports our vision of layered, maintainable AI behaviors.

---

## Realm Walker ECS and AI Interaction

In Realm Walker, AI is implemented as a set of systems operating on entities composed of components. Key components relevant to AI include:

- **UnitComponent**: Holds unit stats and state.
- **PositionComponent**: Tracks spatial location on the hex grid.
- **FactionComponent**: Defines allegiance and faction-specific traits.
- **AbilityComponent**: Contains abilities and cooldowns.

AI behavior is realized by **AI Systems** that process entities with these components each game tick or turn. However, complex decision-making is encapsulated within behavior trees managed by LimboAI, which act as a decision layer on top of ECS data.

### Behavior Trees as AI Systems

Each enemy entity is associated with a behavior tree instance. The tree’s tasks read from and write to a **blackboard**, a shared data structure that acts as an interface between the ECS data and behavior logic. This approach enables:

- **Data Abstraction**: The blackboard exposes relevant ECS component data (e.g., unit stats, visible enemies, terrain info) in a task-friendly way.
- **Decoupling**: Behavior tasks do not directly access ECS but instead operate on blackboard keys, improving modularity.
- **Dynamic Behavior**: The behavior tree can react to changing blackboard state each turn, enabling adaptive AI decisions.

### Blackboard as a Bridge

The blackboard serves as a contract between ECS and the behavior tree:

- ECS systems populate blackboard keys with current game state before AI ticks.
- Behavior tree tasks query blackboard keys to evaluate conditions, select targets, plan paths, and execute actions.
- Tasks update blackboard keys to communicate decisions (e.g., chosen ability, movement path).
- After the tree tick, ECS systems apply the decisions (e.g., move units, trigger attacks).

This design cleanly separates data management (ECS) from decision logic (behavior tree), improving maintainability and testability.

---

## LimboAI Integration

We integrate **LimboAI**, a lightweight behavior tree library for Godot, to provide a flexible and modular AI system for enemy units. LimboAI enables clear separation of concerns, reusable tasks, and easy extension for complex behaviors.

---

## Blackboard Contract

LimboAI uses a **Blackboard** object to share data between tasks. Our blackboard contract includes:

- `enemy` (Node): The AI-controlled unit.
- `visibles` (Array[Node]): Currently visible enemy units.
- `terrain` (Dictionary): Terrain data for pathfinding.
- `target` (Node): Selected target to attack or interact with.
- `ability` (Dictionary): Selected ability to use.
- `path` (Array[Vector2i]): Computed path for movement.
- `move_pos` (Vector2i): Next hex to move to.
- `state` (String): Current state string for debugging.

Tasks read from and write to these keys to coordinate behavior.

---

## Behavior Tree Architecture

Our enemy AI behavior tree typically follows this structure:

```
Selector (Root)
├── Sequence (Retreat Sequence)
│   ├── BTRetreatCheck
│   └── BTPlanRetreatPath
├── Sequence (Attack Sequence)
│   ├── BTFindTarget
│   ├── BTPickBestAbility
│   ├── BTUseAbility (Decorator: ShouldUseAbility)
│   └── BTBasicAttack
├── Sequence (Move Sequence)
│   ├── BTFindTarget
│   ├── BTPlanPathToRange
│   └── BTMoveStep
└── BTIdle
```

- **Selector**: Chooses the first succeeding child.
- **Sequence**: Runs children in order, fails if any child fails.
- **Decorator**: Conditions or modifiers on child nodes.
- **Leaf Tasks**: Concrete actions (finding targets, moving, attacking).

This structure prioritizes retreat when low health, then attacking if possible, then moving toward targets, and finally idling.

---

## Custom Task Implementations

Below are concise examples of key BT tasks:

### BTFindTarget.gd

```gdscript
extends BehaviorTreeTask

func run(blackboard):
    var enemy = blackboard.get("enemy")
    var visibles = blackboard.get("visibles")
    var target = ThreatModel.pick_target(enemy, visibles)
    if target:
        blackboard.set("target", target)
        return SUCCESS
    return FAILURE
```

### BTPickBestAbility.gd

```gdscript
extends BehaviorTreeTask

func run(blackboard):
    var enemy = blackboard.get("enemy")
    var target = blackboard.get("target")
    var ability = enemy.pick_best_ability(target)
    if ability and AbilityPolicy.should_use(enemy, ability, target):
        blackboard.set("ability", ability)
        return SUCCESS
    return FAILURE
```

### BTPlanPathToRange.gd

```gdscript
extends BehaviorTreeTask

func run(blackboard):
    var enemy = blackboard.get("enemy")
    var target = blackboard.get("target")
    var terrain = blackboard.get("terrain")
    var path = HexPathfinder.find_path(enemy.hex, target.hex,
        func(qr): return HexPathfinder.is_walkable(qr, terrain),
        func(a, b): return tile_cost(a, b, terrain, enemy))
    if path.size() > 1:
        blackboard.set("path", path)
        blackboard.set("move_pos", path[1])
        return SUCCESS
    return FAILURE
```

### BTMoveStep.gd

```gdscript
extends BehaviorTreeTask

func run(blackboard):
    var enemy = blackboard.get("enemy")
    var move_pos = blackboard.get("move_pos")
    if move_pos:
        enemy.move_to(move_pos)
        return SUCCESS
    return FAILURE
```

### BTBasicAttack.gd

```gdscript
extends BehaviorTreeTask

func run(blackboard):
    var enemy = blackboard.get("enemy")
    var target = blackboard.get("target")
    if target:
        enemy.basic_attack(target)
        return SUCCESS
    return FAILURE
```

### BTUseAbility.gd

```gdscript
extends BehaviorTreeTask

func run(blackboard):
    var enemy = blackboard.get("enemy")
    var ability = blackboard.get("ability")
    var target = blackboard.get("target")
    if ability and target:
        enemy.use_ability(ability, target)
        return SUCCESS
    return FAILURE
```

### BTRetreatCheck.gd

```gdscript
extends BehaviorTreeTask

func run(blackboard):
    var enemy = blackboard.get("enemy")
    if enemy.hp < enemy.max_hp * 0.3 and enemy.behavior == "cowardly":
        return SUCCESS
    return FAILURE
```

---

## Tree Integration with Turn System

The behavior tree is ticked manually during each enemy’s turn:

```gdscript
func process_enemy_turn(enemy: Node, visibles: Array, terrain: Dictionary, tree: BehaviorTree):
    var blackboard = tree.blackboard
    blackboard.set("enemy", enemy)
    blackboard.set("visibles", visibles)
    blackboard.set("terrain", terrain)
    tree.tick()
```

- The ECS or controller logic injects current data into the blackboard before ticking.
- The tree runs one tick per turn, executing the highest priority behavior.
- Results (movement, attacks) are triggered by tasks during tick.

---

## Faction and Formation Behavior Overlays

Faction modifiers and formation goals influence threat and positioning by injecting blackboard variables or using decorator tasks:

- **Faction Decorators**: Adjust threat scores or target selection by reading faction flags from `enemy` and modifying behavior accordingly.
- **Formation Tasks**: Assign formation targets to units and bias pathfinding or movement tasks to respect formation positions.
- **Blackboard Injection**: Additional keys like `faction_weights` or `formation_targets` can be set externally and read by tasks.

This modular approach allows faction-specific logic without cluttering core tasks.

---

## Difficulty Scaling and Randomization

Difficulty levels adjust AI parameters via blackboard variables or task decorators:

- **Threat Weighting**: Multipliers applied to threat scores in `ThreatModel.calc_threat`.
- **Reaction Delay**: Tasks can include wait decorators or skip ticks based on difficulty.
- **Formation Coherence**: Higher difficulty enforces stricter formation adherence.
- **Randomization**: Introduce noise in target selection or ability choice for easier levels.

These parameters can be set on the blackboard before ticking the tree, enabling dynamic difficulty tuning.

---

## Debugging and Visualization

- Use LimboAI’s **BehaviorTreeView** node to visualize the tree structure and running nodes in the Godot editor.
- Expose blackboard state via a debug panel or console commands to inspect current AI decisions.
- Enable verbose logging for tree ticks to trace execution paths for test reproducibility.
- Overlay paths and target markers using existing debug drawing utilities to correlate BT decisions with game state.

Example debug tick trace:

```
Tick start: enemy=Goblin_1
BTFindTarget: SUCCESS (target=Hero_3)
BTPickBestAbility: SUCCESS (ability=Fireball)
BTUseAbility: SUCCESS
Tick end
```

---

## Migration Notes

Transitioning from the legacy `Controller.gd` logic to LimboAI-driven AI involves:

- Retaining core systems: `HexPathfinder`, `ThreatModel`, `AbilityPolicy`, and formation utilities remain unchanged.
- Replacing per-unit state machines with LimboAI behavior trees for clearer, extensible logic.
- Incrementally porting controller logic into discrete BT tasks, improving modularity.
- Leveraging blackboard keys to share data instead of global variables or signals.
- Best practice: keep pathfinding and threat evaluation pure and stateless; embed decision logic in BT tasks.
- Use the debug tools to validate behavior correctness during migration.

This approach enables easier future enhancements such as new behaviors, faction-specific tactics, and adaptive difficulty.

---

## Future Extensions

Looking ahead, Realm Walker’s AI system is designed to evolve with the following planned expansions:

- **Adaptive AI**: Incorporate runtime learning modules that adjust threat evaluation, target preferences, and movement strategies based on player behavior.
- **Personality Modules**: Define distinct AI personalities (aggressive, defensive, opportunistic) by parameterizing behavior trees or swapping task implementations.
- **Learning Systems**: Integrate reinforcement learning or heuristic tuning within LimboAI tasks or via Godot-native AI subsystems to improve AI performance over time.
- **Procedural Behavior Generation**: Use AI planning or genetic algorithms to generate novel tactics dynamically.
- **Enhanced Debugging Tools**: Develop in-editor visualization overlays that correlate AI decisions with game state, enabling designers to fine-tune behaviors interactively.

These extensions will leverage the modular LimboAI foundation and Realm Walker’s ECS to create rich, challenging, and believable AI opponents.

---
