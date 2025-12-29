/**
 * Quest types - defines quest structure and objectives
 */

export interface QuestObjective {
  id: string;
  description: string;
  flagToSet?: string; // Optional if we use objective ID as flag
  completed?: boolean;
  requiredFlags?: string[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  thread: 'A' | 'B' | 'C';
  requiredFlags: string[];
  setsFlags?: string[];
  completedFlags?: string[];
  objectives: QuestObjective[];
  completed?: boolean;
}
