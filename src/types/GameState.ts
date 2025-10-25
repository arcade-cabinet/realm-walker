/**
 * GameState types - Player progress and quest tracking
 */

export interface QuestState {
  // Story progression flags
  storyFlags: Record<string, boolean>;  // "met_elder", "defeated_guardian_1", "has_palace_key"
  
  // Active quests
  activeQuests: string[];  // ["find_the_guardian", "explore_palace"]
  
  // Completed quests
  completedQuests: string[];  // ["character_selection", "city_exploration"]
  
  // Story thread progress (A/B/C stories)
  aStoryProgress: number;  // Guardian boons collected (0-9)
  bStoryProgress: number;  // Faction allies recruited (0-12)
  cStoryProgress: number;  // Ravens encounters handled (0-N)
}

export interface GameViewState {
  currentScene: string;
  viewport: { width: number; height: number };
  uiState: {
    dialogueOpen: boolean;
    inventoryOpen: boolean;
    questLogOpen: boolean;
  };
}
