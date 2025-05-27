import Screen from './Screen';
import PlayerModel from '../model/Player';
import { POKEBALL, POTION, ItemType } from '../model/Item';
import GameController from '../controller/GameController';
import kleur from 'kleur';

export default class InventoryScreen extends Screen {
  private player: PlayerModel;
  private gameController: GameController;
  private options: string[] = [];
  private selected = 0;
  private message: string | null = null;

  constructor(player: PlayerModel, gameController: GameController) {
    super();
    this.player = player;
    this.gameController = gameController;
    this.updateOptions(); // Mantém a lógica dos itens
  }

  private updateOptions(): void {
    this.options = [];
    this.player.inventory.getItems().forEach((quantity, itemType) => {
      this.options.push(`${itemType}: ${quantity}`);
    });
    if (this.options.length === 0) {
      this.options.push(kleur.italic('Inventário vazio'));
    }
    this.options.push(kleur.yellow('Voltar'));
    this.selected = Math.min(this.selected, this.options.length - 1);
  }

  public render(): void {
    console.clear();
    console.log(kleur.bold().blue('=== Inventário ===\n'));

    // Seção de Itens (como já existe)
    console.log(kleur.bold().magenta('-- Itens --'));
    this.options.forEach((opt, i) => {
      // Mantém a lógica de seleção para itens, se aplicável,
      // ou simplifica se a seleção for apenas para itens e não para Pokémon nesta tela.
      // Por enquanto, a seleção ainda é baseada nas opções de itens e "Voltar".
      console.log(
        (i === this.selected ? kleur.cyan('› ') : '  ') + opt
      );
    });

    // Nova Seção para a Equipe Pokémon
    console.log(kleur.bold().green('\n-- Equipe Pokémon --'));
    if (this.player.team.length > 0) {
      this.player.team.forEach(pokemon => {
        const hpDisplay = `${pokemon.currentHp}/${pokemon.stats.maxHp}`;
        const levelDisplay = `Nv: ${pokemon.stats.level}`;
        // Exemplo de como exibir cada Pokémon. Adapte conforme necessário.
        console.log(`  ${pokemon.name} (${levelDisplay}) - HP: ${hpDisplay}`);
      });
    } else {
      console.log(kleur.italic('  Nenhum Pokémon na equipe.'));
    }

    if (this.message) {
        console.log(`\n${this.message}`);
        this.message = null;
    }

    // Adiciona uma linha em branco antes de qualquer mensagem ou para espaçamento
    console.log('\n'); 
    // Se a mensagem de "Voltar" não estiver em this.options, você pode adicioná-la manualmente aqui
    // ou ajustar a lógica de `updateOptions` e `handleInput` se a tela de inventário
    // ganhar mais interações (como selecionar um Pokémon para ver detalhes ou usar um item nele diretamente daqui).
    // Por enquanto, a opção "Voltar" já é tratada pelo array `this.options`.
  }

  public handleInput(cmd: string): Screen | null {
    // A lógica de input atual lida com a seleção de itens e a opção "Voltar".
    // Se a intenção é apenas exibir a equipe, esta parte pode não precisar de grandes alterações.
    // Se for necessário interagir com os Pokémon listados (ex: usar item diretamente neles a partir daqui),
    // este método precisará ser expandido.

    if (cmd === 'up' && this.selected > 0) {
      this.selected--;
    } else if (cmd === 'down' && this.selected < this.options.length - 1) {
      this.selected++;
    } else if (cmd === 'return') {
      const selectedOptionText = this.options[this.selected];
      if (selectedOptionText === kleur.yellow('Voltar') || selectedOptionText === kleur.italic('Inventário vazio')) {
        this.gameController.resumeGame();
        return null;
      } else {
        const itemTypeStr = selectedOptionText.split(':')[0];
        const itemType = itemTypeStr as ItemType;

        if (itemType === ItemType.POTION) {
          const activePokemon = this.player.getActivePokemon();
          if (activePokemon && activePokemon.currentHp < activePokemon.stats.maxHp) {
            if (this.player.inventory.removeItem(ItemType.POTION)) {
              POTION.action?.(activePokemon);
              this.message = `${ItemType.POTION} usado em ${activePokemon.name}.`;
              this.gameController.getDatabase().savePlayerInventory(this.player.inventory.toSaveData());
            }
          } else if (activePokemon) {
            this.message = `${activePokemon.name} já está com HP máximo ou não há Pokémon ativo.`;
          } else {
            this.message = 'Nenhum Pokémon ativo para usar a poção.';
          }
          this.updateOptions();
        } else {
            this.message = `Não é possível usar ${itemType} aqui.`;
        }
      }
    } else if (cmd === 'i' || cmd === 'esc' || cmd === 'escape') {
        this.gameController.resumeGame();
        return null;
    }
    return this; // Permanece nesta tela
  }
}