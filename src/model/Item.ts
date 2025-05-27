export enum ItemType {
  POKEBALL = 'Pokebola',
  POTION = 'Poção de Cura',
}

export interface Item {
  name: ItemType;
  description: string;
  action?: (target?: any) => void; // Ação que o item realiza
}

export const POKEBALL: Item = {
  name: ItemType.POKEBALL,
  description: 'Use para tentar capturar um monstro selvagem.',
};

export const POTION: Item = {
  name: ItemType.POTION,
  description: 'Restaura 20 HP de um monstro.',
  action: (target: import('./Pokemon').default) => {
    if (target) {
      target.heal(20);
      console.log(`${target.name} foi curado em 20 HP!`);
    }
  },
};