import { Item, ItemType } from './Item';

export default class Inventory {
  private items: Map<ItemType, number> = new Map();

  constructor() {
    // Itens iniciais (pode ser carregado do DB também)
    this.addItem(ItemType.POKEBALL, 5);
    this.addItem(ItemType.POTION, 3);
  }

  addItem(itemType: ItemType, quantity: number = 1): void {
    this.items.set(itemType, (this.items.get(itemType) || 0) + quantity);
  }

  removeItem(itemType: ItemType, quantity: number = 1): boolean {
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

  getItemCount(itemType: ItemType): number {
    return this.items.get(itemType) || 0;
  }

  getItems(): Map<ItemType, number> {
    return this.items;
  }

  // Para salvar e carregar do DB
  toSaveData(): { [key: string]: number } {
    const data: { [key: string]: number } = {};
    this.items.forEach((qty, item) => {
      data[item] = qty;
    });
    return data;
  }

  fromSaveData(data: { [key: string]: number }): void {
    this.items.clear();
    for (const itemName in data) {
      this.addItem(itemName as ItemType, data[itemName]);
    }
  }
}