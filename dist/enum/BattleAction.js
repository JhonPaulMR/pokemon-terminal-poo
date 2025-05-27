"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleAction = void 0;
var BattleAction;
(function (BattleAction) {
    BattleAction[BattleAction["ATTACK"] = 0] = "ATTACK";
    BattleAction[BattleAction["ITEM"] = 1] = "ITEM";
    BattleAction[BattleAction["POKEMON"] = 2] = "POKEMON";
    BattleAction[BattleAction["FLEE"] = 3] = "FLEE";
})(BattleAction || (exports.BattleAction = BattleAction = {}));
