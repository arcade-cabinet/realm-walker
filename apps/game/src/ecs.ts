import { Entity, world } from '@realm-walker/core';
import createECS from 'miniplex-react';

// Create React hooks bound to the Core ECS World
// Create React hooks bound to the Core ECS World
export const ECS = createECS<Entity>(world);
export const { useEntities, useWorld } = ECS as any;
