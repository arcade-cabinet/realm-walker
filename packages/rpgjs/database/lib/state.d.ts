import { Data } from './common';
import { EfficiencyOptions } from './interfaces/efficiency';
import { ParamsModifierOption } from './interfaces/params-modifier';
import { EffectsOption } from './interfaces/effects';
export interface StateOptions extends EfficiencyOptions, ParamsModifierOption, EffectsOption, Data {
}
export declare function State(options: StateOptions): (target: any) => void;
