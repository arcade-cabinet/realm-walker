# Guardian Mythology Cutscenes - Integration Guide

**Status**: All 8 cutscenes complete  
**Location**: `scenes/cutscenes/guardians/`  
**Last Updated**: 2025-10-21

---

## Overview

8 FMV cutscenes that reveal the terrible truth about each Guardian's sacrifice and the compact's cruelty. These are pivotal story moments that transform player understanding of the world.

---

## Cutscene Files

All cutscenes extend `FMVCutscene.gd` and follow the same 4-phase revelation structure:

1. **RiverSageRevelation.gd** - Dissolution of self for wisdom
2. **StoneWardenRevelation.gd** - Eternal burden without release
3. **MistWalkerRevelation.gd** - Guardian of the compact's lies
4. **SilentKeeperRevelation.gd** - Knew the compact was doomed
5. **ForestAncientRevelation.gd** - Eternal growth as consumption
6. **DivineSmithRevelation.gd** - Forced creation without rest
7. **EternalNoteRevelation.gd** - Perfect harmony as torture
8. **TwinGodsRevelation.gd** - Sundering of unified being

---

## Revelation Structure

Each cutscene has 4 phases:

### Phase 1: Introduction (8 seconds)

- Establishes Guardian's role
- Shows their eternal duty
- Hints at the cost

### Phase 2: The Horror Revealed (10 seconds)

- Reveals what the compact actually did
- Shows the transformation/binding
- Player understands the sacrifice's true nature

### Phase 3: The Consequences (12 seconds)

- Shows impact on compact species (otters/badgers/foxes)
- Reveals how Guardian's curse spreads
- Connects to larger mythology

### Phase 4: The Truth (8 seconds)

- Final devastating revelation
- Connection to the sun's shattering
- Player's understanding transforms

**Total duration per cutscene**: ~38 seconds

---

## Mythology Unlocked

Each cutscene unlocks specific mythology entries tracked by `StoryProgression`:

### River Sage

- guardians_sacrificed_selves
- compact_required_dissolution
- river_sage_lost_identity
- otters_remember_what_was_lost

### Stone Warden

- guardians_cannot_die
- compact_is_prison
- stone_warden_begs_for_release
- badgers_unknowingly_burden_parent

### Mist Walker

- compact_was_forced
- guardians_did_not_volunteer
- mist_walker_keeps_greatest_secret
- transformation_was_agony
- foxes_inherited_survival_lies

### Silent Keeper

- silent_keeper_knew_truth
- compact_had_fatal_flaw
- guardians_sacrifice_was_futile
- ravens_were_right_to_flee
- sun_shattered_because_of_compact
- silence_was_enforced_not_chosen

### Forest Ancient

- forest_ancient_cannot_stop_growing
- immortality_requires_consumption
- guardians_hunger_eternally
- compact_prevents_natural_death
- forest_ancient_begs_to_burn

### Divine Smith

- divine_smith_cannot_stop_creating
- shards_were_forged_in_agony
- creation_became_compulsion
- smith_knew_weapons_would_destroy
- forge_will_burn_eternally

### Eternal Note

- eternal_note_cannot_stop_singing
- guardians_torture_each_other
- harmony_is_prison
- music_requires_silence
- note_will_sound_eternally

### Twin Gods

- twin_gods_were_one_being
- compact_split_what_was_whole
- balance_requires_integration_not_division
- guardians_were_made_by_sundering
- creator_and_destroyer_yearn_to_reunite
- compact_is_war_against_self

---

## Integration Points

### When to Trigger

Each cutscene triggers when player:

1. Encounters the Guardian in Act 2
2. Completes the Guardian's trial
3. Is deemed worthy to receive the truth

### StoryProgression Hooks

```gdscript
# After Guardian encounter
StoryProgression.mark_guardian_encountered(guardian_id)

# Trigger cutscene
var cutscene = load("res://scenes/cutscenes/guardians/%sRevelation.gd" % guardian_name)
get_tree().change_scene_to_packed(cutscene)

# On cutscene completion (automatic)
StoryProgression.unlock_mythology(mythology_list)
Player.unlock_ability(ability_name)
Player.modify_reputation(faction, amount)
```

### Ability Unlocks

Each Guardian grants unique abilities:

- **River Sage**: chronomancy_basic, time_sense, wisdom_sight
- **Stone Warden**: endurance_basic, burden_bearer, unbreakable_will
- **Mist Walker**: shadow_step, mist_veil, truth_sense
- **Silent Keeper**: truth_sight, future_glimpse, forbidden_knowledge
- **Forest Ancient**: verdant_growth, root_grasp, life_drain
- **Divine Smith**: divine_forge, reality_shaping, weapon_blessing
- **Eternal Note**: resonance_manipulation, discord_strike, silence_gift
- **Twin Gods**: creation_destruction, light_dark_switch, unity_glimpse

---

## Narrative Flow

### Act 2 Structure

Player encounters Guardians in this recommended order:

1. **River Sage** (First) - Gentle introduction to sacrifice
2. **Stone Warden** - Escalates to eternal suffering
3. **Forest Ancient** - Shows horror of immortality
4. **Divine Smith** - Reveals forced creation
5. **Mist Walker** - Truth about voluntary myth
6. **Eternal Note** - Guardians torture each other
7. **Silent Keeper** - The compact was doomed
8. **Twin Gods** (Final) - Original sin of division

This builds from sympathy → horror → understanding → revelation of futility.

### Reputation Impact

Cumulative reputation changes by end of Act 2:

- **Guardians faction**: +185 (deep respect and sympathy)
- **Otters**: +10
- **Badgers**: +5
- **Foxes**: +15
- **Ravens**: +25 (understanding their rebellion)
- **Radiant**: +15
- **Veilbound**: +15
- **Verdant**: +10
- **Ironbound**: +15

---

## Scene References

Each cutscene references narrative files:

```
River Sage:
- narrative/acts/act2_guardians_burden/realm_walking_unlocked/river_sage_encounter.md
- narrative/acts/act2_guardians_burden/realm_walking_unlocked/fmv_wisdom_shard.md

(Similar pattern for other Guardians)
```

These markdown files contain the full dialogue and lore context.

---

## Audio Requirements

Each cutscene requires specific audio assets:

### Ambient Sounds

- river_ambient
- mountain_wind
- fog_whisper
- silence_oppressive (paradoxical)
- forest_breathing
- hammer_endless
- note_eternal
- twin_harmonics

### Sound Effects

- water_dissolution
- stone_splitting
- illusion_shattering
- future_echoing
- roots_spreading
- metal_screaming
- harmonic_distortion
- divine_tearing

### Music

- revelation_chord (plays at end of each cutscene)
- otter_voices_layered
- fox_laughter_distant
- badger_digging_distant
- animals_warning_calls
- guardians_begging
- future_weapons_clashing

---

## Visual Effects

### Particle Systems Required

- particle_scatter (River Sage)
- crack_spread (Stone Warden)
- mist_dispersing (Mist Walker)
- timeline_fracture (Silent Keeper)
- forest_overtaking (Forest Ancient)
- sparks_endless (Divine Smith)
- resonance_shattering (Eternal Note)
- self_splitting (Twin Gods)

### Lighting States

- dawn_soft
- ethereal_blue
- memory_glow
- stone_grey
- fissure_glow
- mist_silver
- truth_breaking_through
- void_black
- prophetic_glow
- forbidden_knowledge
- verdant_green
- parasitic_glow
- forge_orange
- forge_inferno
- resonance_gold
- duality_shimmer
- separation_trauma
- battle_eternal

All lighting states transition to `twilight_eternal` for final phase.

---

## Testing Checklist

- [ ] Each cutscene loads without errors
- [ ] All 4 phases play in sequence
- [ ] Narration text displays correctly
- [ ] Audio cues trigger at right moments
- [ ] VFX play without crashing
- [ ] Mythology unlocks properly in StoryProgression
- [ ] Abilities granted to Player
- [ ] Reputation changes apply
- [ ] Cutscene transitions back to gameplay
- [ ] Player retains context after cutscene

---

## Future Enhancements

### Phase 1 (Current)

- ✅ All 8 cutscenes scripted
- ⏳ Audio assets needed
- ⏳ VFX implementation
- ⏳ Lighting state system

### Phase 2 (Polish)

- Camera movement scripting
- Guardian model animations
- Lineage montage sequences
- Player choice integration (some Guardians may offer dark choices)

### Phase 3 (Expansion)

- Alternative revelation paths based on player reputation
- Different narration if player has certain abilities
- Compact species reactions based on which Guardians encountered
- Post-cutscene dialogue with compact animals

---

## Notes for Content Team

These cutscenes are the EMOTIONAL CORE of Act 2. They transform the game from "collect shards to restore sun" to "understand the terrible price paid and decide if the compact should continue."

The player must feel:

1. **Sympathy** for the Guardians' suffering
2. **Horror** at the compact's cruelty
3. **Understanding** of why ravens rebelled
4. **Doubt** about whether the compact should continue
5. **Responsibility** for making the final choice in Act 4

Each revelation should hit harder than the last, culminating in Twin Gods' revelation that the compact's original sin was DIVISION itself.
