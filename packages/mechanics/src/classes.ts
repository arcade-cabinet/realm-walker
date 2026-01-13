import { ClassOptions } from './rpg-types';

export const Warrior: ClassOptions = {
    id: 'warrior',
    name: 'Warrior',
    description: 'A strong melee fighter.',
    stats: {
        str: 10,
        agi: 5,
        int: 1,
        hp: 100
    }
};

export const Scout: ClassOptions = {
    id: 'scout',
    name: 'Scout',
    description: 'A fast reconnaissance unit.',
    stats: {
        str: 4,
        agi: 10,
        int: 5,
        hp: 60
    }
};
