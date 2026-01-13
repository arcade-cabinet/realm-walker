import { DatabaseTypes } from "./interfaces/types";
export interface Data {
    /**
    * The id of the item. The identifier makes it possible to find an object in the database. By default, the identifier is the name of the class
    * @prop {string} [id]
    * @memberof Item
    * @memberof Weapon
    * @memberof Armor
    * @memberof Class
    * @memberof Enemy
    * @memberof Skill
    * @memberof State
    * @memberof Actor
    * */
    id?: string;
    /**
    * The name of the item.
    * @prop {string} [name]
    * @memberof Item
    * @memberof Weapon
    * @memberof Armor
    * @memberof Class
    * @memberof Enemy
    * @memberof Skill
    * @memberof State
    * @memberof Actor
    * */
    name?: string;
    /**
    * The description of the item.
    * @prop {string} [description]
    * @memberof Item
    * @memberof Weapon
    * @memberof Armor
    * @memberof Class
    * @memberof Enemy
    * @memberof Skill
    * @memberof State
    * @memberof Actor
    * */
    description?: string;
}
export declare function merge(options: any, type: DatabaseTypes, _static?: {}): (target: any) => void;
export interface RpgClassDatabase<T> {
    new (): any;
}
