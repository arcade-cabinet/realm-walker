import { ActorGlobalOptions } from './actor';
interface EnemyOptions extends ActorGlobalOptions {
    startingItems?: [{
        nb: number;
        item: any;
    }];
    graphic?: string;
    gain?: {
        exp?: number;
        gold?: number;
        items?: [{
            nb: number;
            item: any;
            chance?: number;
        }];
    };
}
export declare function Enemy(options: EnemyOptions): (target: any) => void;
export {};
