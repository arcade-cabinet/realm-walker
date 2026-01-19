// Local definitions extracted from RPG-JS to remove runtime dependency
// We only need the data shapes, not the class logic.

export interface RpgCommonPlayer {
    name: string;
    hp: number;
    sp: number;
    str: number;
    int: number;
    agi: number;
    dex: number;
    level: number;
    exp: number;
}

export interface Stats {
    str?: number;
    int?: number;
    agi?: number;
    dex?: number;
    hp?: number;
    sp?: number;
}

export interface Visuals {
    spriteId?: string;
    iconId?: string;
    tint?: string;
    scale?: number;
    billboard?: boolean;
}

export interface ClassOptions {
    id: string;
    name: string;
    description?: string;
    stats?: Stats;
    visuals?: Visuals;
    skillsToLearn?: { level: number, skillId: string }[];
}

export interface ItemOptions {
    id: string;
    name: string;
    description?: string;
    price?: number;
    hpValue?: number;
    hitRate?: number;
    consumable?: boolean;
    type?: string;
    visuals?: Visuals;
}
