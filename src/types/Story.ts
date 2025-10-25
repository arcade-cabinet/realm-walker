/**
 * Story types - defines quest flags and slot content
 * StoryCompositor uses these types (knows nothing about presentation)
 */

import { WorldPosition } from './GridSystem';

export type QuestFlags = Record<string, boolean>;

export interface SlotContent {
  slotId: string;
  modelPath: string;
  requiredFlags?: string[];
  position?: WorldPosition;
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface StoryData {
  id: string;
  sceneId: string;
  slotContents: SlotContent[];
  initialFlags?: QuestFlags;
}

export interface StoryState {
  flags: QuestFlags;
  activeSlotContents: SlotContent[];
}
