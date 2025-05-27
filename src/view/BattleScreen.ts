import Screen from "./Screen";
import Pokemon from "../model/Pokemon";
import { PokemonType } from "../enum/PokemonType";
import PlayerModel from "../model/Player";
import { BattleAction } from "../enum/BattleAction";
import { ItemType, POTION, POKEBALL } from "../model/Item";
import BattleController from "../controller/BattleController";
import kleur from "kleur";

export default class BattleScreen extends Screen {
  private playerPokemon: Pokemon; 
  private wildPokemon: Pokemon;
  private player: PlayerModel;
  private battleController: BattleController;

  private options: string[] = [
    kleur.red("Atacar"),
    kleur.blue("Itens"),
    kleur.green("Pokémon"),
    kleur.yellow("Fugir"),
  ];
  private selectedAction = 0;
  public message: string = "";
  private selectingItem: boolean = false;
  private selectingPokemon: boolean = false;
  private itemOptions: string[] = [];
  private pokemonOptions: string[] = [];
  private selectedItemIndex = 0;
  private selectedPokemonIndex = 0;

  constructor(
    player: PlayerModel,
    wildPokemon: Pokemon,
    battleController: BattleController
  ) {
    super();
    this.player = player;
    const activePokemon = player.getActivePokemon();
    if (!activePokemon) {
      console.error(
        "BattleScreen construída sem Pokémon ativo para o jogador!"
      );

      this.playerPokemon =
        player.team[0] ||
        new Pokemon(0, "ErrorMon", "", {
          attack: 0,
          defense: 0,
          hp: 0,
          maxHp: 0,
          speed: 0,
          type: PokemonType.NORMAL,
          level: 1,
          xp: 0,
          xpToNextLevel: 0,
        });
    } else {
      this.playerPokemon = activePokemon;
    }
    this.wildPokemon = wildPokemon;
    this.battleController = battleController;
    this.message = `Um ${wildPokemon.name} selvagem apareceu!`;
  }

  private updateItemOptions(): void {
    this.itemOptions = [];
    this.player.inventory.getItems().forEach((quantity, itemType) => {
      this.itemOptions.push(`${itemType}: ${quantity}`);
    });
    if (this.itemOptions.length === 0)
      this.itemOptions.push(kleur.italic("Nenhum item"));
    this.itemOptions.push(kleur.yellow("Voltar"));
    this.selectedItemIndex = 0;
  }

  private updatePokemonOptions(): void {
    this.pokemonOptions = this.player.team.map((p, index) => {
      const activeMark =
        p === this.playerPokemon && p.currentHp > 0
          ? kleur.cyan("(Ativo) ")
          : "";
      const faintedMark = p.currentHp === 0 ? kleur.red("(Caído) ") : "";
      return `${activeMark}${faintedMark}${p.name} (HP: ${p.currentHp}/${p.stats.maxHp}, Nv: ${p.stats.level})`;
    });
    this.pokemonOptions.push(kleur.yellow("Voltar"));
    this.selectedPokemonIndex = 0; // Reseta o índice de seleção
  }

  public render(): void {
    console.clear();
    console.log(kleur.bold().magenta("=== BATALHA ===\n"));

    // Wild Pokemon
    console.log(
      kleur.yellow(
        ` Adversário: ${this.wildPokemon.name} (Nv. ${this.wildPokemon.stats.level})`
      )
    );
    console.log(
      ` HP: ${this.wildPokemon.currentHp} / ${this.wildPokemon.stats.maxHp}`
    );
    console.log(this.wildPokemon.asciiArt);
    console.log("\n--------------------\n");


    if (this.playerPokemon && this.playerPokemon.name) {
      // Verifica se playerPokemon e seu nome existem
      console.log(
        kleur.cyan(
          ` Seu Pokémon: ${this.playerPokemon.name} (Nv. ${this.playerPokemon.stats.level})`
        )
      );
      console.log(
        ` HP: ${this.playerPokemon.currentHp} / ${this.playerPokemon.stats.maxHp} | XP: ${this.playerPokemon.stats.xp}/${this.playerPokemon.stats.xpToNextLevel}`
      );
      if (this.playerPokemon.asciiArt) {
        console.log(this.playerPokemon.asciiArt);
      } else {
        console.log(kleur.italic("[Sem Arte ASCII para este Pokémon]"));
      }
    } else {
      console.log(kleur.red("Seu Pokémon não está disponível para exibição."));
    }

    if (this.message) {
      console.log(`\n${kleur.bgWhite().black(this.message)}\n`);
    }

    if (this.selectingItem) {
      console.log(kleur.blue("\n--- Usar Item ---"));
      this.itemOptions.forEach((opt, i) => {
        console.log(
          (i === this.selectedItemIndex ? kleur.cyan("› ") : "  ") + opt
        );
      });
    } else if (this.selectingPokemon) {
      console.log(kleur.green("\n--- Trocar Pokémon ---"));
      this.pokemonOptions.forEach((opt, i) => {

        console.log(
          (i === this.selectedPokemonIndex ? kleur.cyan("› ") : "  ") + opt
        );
      });
    } else {
      console.log("\nO que fazer?");
      this.options.forEach((opt, i) => {
        console.log(
          (i === this.selectedAction ? kleur.cyan("› ") : "  ") + opt
        );
      });
    }
  }

  public handleInput(key: string): Screen | null {
    this.message = ""; // Limpa a mensagem a cada input

    if (this.selectingItem) {
      if (key === "up" && this.selectedItemIndex > 0) this.selectedItemIndex--;
      else if (
        key === "down" &&
        this.selectedItemIndex < this.itemOptions.length - 1
      )
        this.selectedItemIndex++;
      else if (key === "return") {
        const selectedItemText = this.itemOptions[this.selectedItemIndex];
        if (
          selectedItemText === kleur.yellow("Voltar") ||
          selectedItemText === kleur.italic("Nenhum item")
        ) {
          this.selectingItem = false;
        } else {
          const itemTypeStr = selectedItemText.split(":")[0] as ItemType;
          this.battleController.handlePlayerAction(
            BattleAction.ITEM,
            itemTypeStr
          );
          this.selectingItem = false;
        }
      } else if (key === "escape" || key === "backspace") {
        this.selectingItem = false;
      }
    } else if (this.selectingPokemon) {
      if (key === "up" && this.selectedPokemonIndex > 0)
        this.selectedPokemonIndex--;
      else if (
        key === "down" &&
        this.selectedPokemonIndex < this.pokemonOptions.length - 1
      )
        this.selectedPokemonIndex++;
      else if (key === "return") {
        if (
          this.pokemonOptions[this.selectedPokemonIndex] ===
          kleur.yellow("Voltar")
        ) {
          this.selectingPokemon = false;
        } else {
          const targetPokemon = this.player.team[this.selectedPokemonIndex];
          // Verifica se o Pokémon alvo é diferente do atual E está vivo
          if (
            targetPokemon !== this.playerPokemon &&
            targetPokemon.currentHp > 0
          ) {
            this.battleController.handlePlayerAction(
              BattleAction.POKEMON,
              this.selectedPokemonIndex
            );
            // this.playerPokemon atualizado por updateBattleState via BattleController
          } else if (targetPokemon.currentHp === 0) {
            this.message = "Este Pokémon está caído e não pode lutar!";
          } else {
            // Mesmo Pokémon
            this.message = "Este Pokémon já está em batalha!";
          }
          this.selectingPokemon = false;
        }
      } else if (key === "escape" || key === "backspace") {
        this.selectingPokemon = false;
      }
    } else {
      // Menu principal da batalha
      if (key === "up" && this.selectedAction > 0) this.selectedAction--;
      else if (key === "down" && this.selectedAction < this.options.length - 1)
        this.selectedAction++;
      else if (key === "return") {
        const action = this.selectedAction;
        if (action === BattleAction.ATTACK) {
          this.battleController.handlePlayerAction(BattleAction.ATTACK);
        } else if (action === BattleAction.ITEM) {
          this.updateItemOptions();
          if (
            this.itemOptions.length > 1 ||
            (this.itemOptions.length === 1 &&
              this.itemOptions[0] !== kleur.italic("Nenhum item"))
          ) {
            // Verifica se há itens além de "Voltar"
            this.selectingItem = true;
          } else {
            this.message = "Nenhum item no inventário!";
          }
        } else if (action === BattleAction.POKEMON) {
          if (this.player.team.length > 0) {
            this.updatePokemonOptions();
            this.selectingPokemon = true;
          } else {
            this.message = "Você não tem Pokémon!";
          }
        } else if (action === BattleAction.FLEE) {
          this.battleController.handlePlayerAction(BattleAction.FLEE);
        }
      }
    }
    return this;
  }

  public updateBattleState(
    playerPokemon: Pokemon,
    wildPokemon: Pokemon,
    message: string
  ): void {
    this.playerPokemon = playerPokemon;
    this.wildPokemon = wildPokemon;
    this.message = message;
  }
}
