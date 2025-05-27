"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Item_1 = require("./Item");
class Inventory {
    constructor() {
        this.items = new Map();
        // Itens iniciais (pode ser carregado do DB também)
        this.addItem(Item_1.ItemType.POKEBALL, 5);
        this.addItem(Item_1.ItemType.POTION, 3);
    }
    addItem(itemType, quantity = 1) {
        this.items.set(itemType, (this.items.get(itemType) || 0) + quantity);
    }
    removeItem(itemType, quantity = 1) {
        const currentQuantity = this.items.get(itemType);
        if (currentQuantity && currentQuantity >= quantity) {
            this.items.set(itemType, currentQuantity - quantity);
            if (this.items.get(itemType) === 0) {
                this.items.delete(itemType);
            }
            return true;
        }
        return false; // Não tinha o item ou quantidade insuficiente
    }
    getItemCount(itemType) {
        return this.items.get(itemType) || 0;
    }
    getItems() {
        return this.items;
    }
    // Para salvar e carregar do DB
    toSaveData() {
        const data = {};
        this.items.forEach((qty, item) => {
            data[item] = qty;
        });
        return data;
    }
    fromSaveData(data) {
        this.items.clear();
        for (const itemName in data) {
            this.addItem(itemName, data[itemName]);
        }
    }
}
exports.default = Inventory;
