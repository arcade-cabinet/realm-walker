/**
 * StoryBinding types - Mapping story content to scene slots
 */

export interface StoryBinding {
  scene_id: string;
  npc_placements: Record<string, {
    npc_id: string;
    dialogue?: string;
    quest?: string;
  }>;
  prop_placements: Record<string, {
    prop_id: string;
    interactive?: boolean;
  }>;
  door_states: Record<string, {
    target: string;
    locked: boolean;
    requires_flags?: string[];
  }>;
}
