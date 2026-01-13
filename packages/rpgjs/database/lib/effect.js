/**
* @title Existing effects
* @enum {string}
*
* Effect.NONE | No effect
* Effect.CAN_NOT_SKILL | The player will not be able to use a skill. The `player.useSkill()` method will return an exception with the `RESTRICTION_SKILL` id
* Effect.CAN_NOT_ITEM | The player may not use an item. The `player.useItem()` method will return an exception with the `RESTRICTION_ITEM` id
* Effect.GUARD | The player goes on defense. When using applyDamage(), damage will be reduced using the damageGuard formula
* Effect.SUPER_GUARD | Damage with the applyDamage() method will be divided by 4
* Effect.HALF_SP_COST | The cost of the SP will be halved when calling the `useSkill()` method
* @memberof Effect
* */
export var Effect;
(function (Effect) {
    Effect["NONE"] = "NONE";
    Effect["CAN_NOT_SKILL"] = "CAN_NOT_SKILL";
    Effect["CAN_NOT_ITEM"] = "CAN_NOT_ITEM";
    Effect["ALWAYS_ATTACK_ENEMIES"] = "ALWAYS_ATTACK_ENEMIES";
    Effect["CAN_NOT_EVADE"] = "CAN_NOT_EVADE";
    Effect["CAN_NOT_GET_EXP"] = "CAN_NOT_GET_EXP";
    Effect["CAN_NOT_GET_GOLD"] = "CAN_NOT_GET_GOLD";
    Effect["PHARMACOLOGY"] = "PHARMACOLOGY";
    // Increases the chances of making a critical hit
    Effect["CRITICAL_BONUS"] = "CRITICAL_BONUS";
    Effect["SUPER_GUARD"] = "SUPER_GUARD";
    Effect["GUARD"] = "GUARD";
    // the chances of making a critical strike are set to 0
    Effect["PREVENT_CRITICAL"] = "PREVENT_CRITICAL";
    Effect["HALF_SP_COST"] = "HALF_SP_COST";
    Effect["DOUBLE_EXP_GAIN"] = "DOUBLE_EXP_GAIN";
    Effect["AUTO_HP_RECOVER"] = "AUTO_HP_RECOVER";
    // He's the first to attack
    Effect["FAST_ATTACK"] = "FAST_ATTACK";
    // The hero can attack twice
    Effect["DUAL_ATTACK"] = "DUAL_ATTACK";
    // Each turn, the hero loses 10% of his health points.
    Effect["SLIP_DAMAGE"] = "SLIP_DAMAGE";
})(Effect || (Effect = {}));
//# sourceMappingURL=effect.js.map