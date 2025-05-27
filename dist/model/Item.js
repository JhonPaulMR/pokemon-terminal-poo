"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POTION = exports.POKEBALL = exports.ItemType = void 0;
var ItemType;
(function (ItemType) {
    ItemType["POKEBALL"] = "Pokebola";
    ItemType["POTION"] = "Po\u00E7\u00E3o de Cura";
})(ItemType || (exports.ItemType = ItemType = {}));
exports.POKEBALL = {
    name: ItemType.POKEBALL,
    description: 'Use para tentar capturar um monstro selvagem.',
};
exports.POTION = {
    name: ItemType.POTION,
    description: 'Restaura 20 HP de um monstro.',
    action: (target) => {
        if (target) {
            target.heal(20);
            console.log(`${target.name} foi curado em 20 HP!`);
        }
    },
};
