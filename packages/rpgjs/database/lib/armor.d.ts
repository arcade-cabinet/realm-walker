import { EquipmentOptions } from './item';
export interface ArmorClass {
    new (...args: any[]): ArmorInstance;
    price?: number;
    _type?: string;
}
export interface ArmorOptions extends EquipmentOptions {
}
export interface ArmorInstance extends ArmorOptions {
    equipped?: boolean;
}
export declare function Armor(options: ArmorOptions): (target: any) => void;
