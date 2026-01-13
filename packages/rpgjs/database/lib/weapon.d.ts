import { EquipmentOptions } from './item';
export interface WeaponClass {
    new (...args: any[]): WeaponInstance;
    price?: number;
    _type?: string;
}
export interface WeaponOptions extends EquipmentOptions {
    atk?: number;
}
export interface WeaponInstance extends WeaponOptions {
    equipped?: boolean;
}
export declare function Weapon(options: WeaponOptions): (target: any) => void;
