import Map from "../model/Map";
import Player from "../model/Player";
import GameView from "../view/GameView";
import Database, { PokemonDefinition } from "../db/Database";
import Screen from "../view/Screen";
import InventoryScreen from "../view/InventoryScreen";
import BattleController from "./BattleController";
import Pokemon from "../model/Pokemon";
import { PokemonType } from "../enum/PokemonType";
import { ItemType } from "../model/Item";
import kleur from "kleur";

interface BushEncounter {
  pokemonId: number;
  minLevel: number;
  maxLevel: number;
  chance: number;
}

const BUSH_ENCOUNTERS_MAPA1: BushEncounter[] = [
  { pokemonId: 2, minLevel: 2, maxLevel: 5, chance: 0.4 }, // Charmander
  { pokemonId: 3, minLevel: 2, maxLevel: 5, chance: 0.4 }, // Squirtle
  { pokemonId: 4, minLevel: 2, maxLevel: 5, chance: 0.4 }, // Bulbasaur
  { pokemonId: 1, minLevel: 3, maxLevel: 7, chance: 0.2 }, // Pikachu
];

export default class GameController {
  private modelMap!: Map;
  private modelPlayer!: Player;
  private gameView!: GameView;
  private db!: Database;
  private currentScreenHandler: Screen | null = null;
  private battleController: BattleController | null = null;
  private inBattle: boolean = false;
  private previousPlayerX: number = 0;
  private previousPlayerY: number = 0;
  private mapInteractionMessage: string | null = null;

  constructor(private mapFile: string, private dbFile?: string) {}

  private initializeCommonComponents(loadPlayerFromDb: boolean): void {
    this.modelMap = new Map(this.mapFile);
    this.modelMap.load(); // Make sure map is loaded before player position is set
    this.db = new Database(this.dbFile);

    let playerX, playerY;
    if (loadPlayerFromDb) {
      const pos = this.db.getPlayerPosition();
      playerX = pos.x;
      playerY = pos.y;
    } else {
      // Default starting position for new game.
      // Assuming 'o' is at (14,6) in mapa1.txt, start player at (13,6) to be adjacent.
      playerX = 13;
      playerY = 6;
    }

    const pikachuDef = this.db.getPokemonDefinitionById(1);
    let initialPokemon: Pokemon | null = null;

    if (pikachuDef) {
      initialPokemon = this.db.instantiatePokemon(
        pikachuDef.id,
        pikachuDef.stats.baseLevel || 5
      );
    }

    if (!initialPokemon) {
      console.error(
        "Não foi possível criar o Pokémon inicial (Pikachu)! Usando FallbackMon."
      );
      const fallbackStats = {
        attack: 10, defense: 10, hp: 20, maxHp: 20, speed: 10,
        type: PokemonType.NORMAL, level: 5, xp: 0, xpToNextLevel: 100,
      };
      initialPokemon = new Pokemon(0,"FallbackMon","Fallback Art",fallbackStats);
    }
    this.modelPlayer = new Player(playerX, playerY, initialPokemon);

    if (loadPlayerFromDb) {
      this.modelPlayer.inventory.fromSaveData(this.db.getPlayerInventory());
      const teamData = this.db.getPlayerTeamData();
      const allPokemonBaseDefinitions = this.db.getAllPokemonDefinitions();
      const instantiatedPokemons: Pokemon[] = [];
      allPokemonBaseDefinitions.forEach((def) => {
        const instance = this.db.instantiatePokemon(def.id, def.stats.baseLevel || 1);
        if (instance) {
          instantiatedPokemons.push(instance);
        }
      });
      this.modelPlayer.loadTeamFromData(teamData, instantiatedPokemons);
    } else {
      this.db.saveGameData(this.modelPlayer);
    }

    this.gameView = new GameView(this.modelMap, this.modelPlayer);
  }

  public startNew(): void {
    this.initializeCommonComponents(false);
    this.inBattle = false;
    this.currentScreenHandler = null;
  }

  public startContinue(): void {
    this.initializeCommonComponents(true);
    this.inBattle = false;
    this.currentScreenHandler = null;
  }

  public render(): void {
    if (this.inBattle && this.battleController) {
      this.battleController.getScreen().render();
    } else if (this.currentScreenHandler) {
      this.currentScreenHandler.render();
    } else if (this.gameView) {
      this.gameView.render();
      if (this.mapInteractionMessage) {
        console.log(kleur.bold().cyan(`\n${this.mapInteractionMessage}`));
        this.mapInteractionMessage = null; // Clear message after displaying
      }
    }
  }

  public handleInput(cmd: string): void {
    var _a, _b, _c, _d, _e;

    if (this.inBattle && this.battleController) {
      this.battleController.getScreen().handleInput(cmd);
      return;
    }

    if (this.currentScreenHandler) {
      const nextScreen = this.currentScreenHandler.handleInput(cmd);
      if (nextScreen === null) {
        this.currentScreenHandler = null;
        this.gameView.render(); // Re-render map immediately after closing a screen
        if (this.mapInteractionMessage) { // Display any pending message
            console.log(kleur.bold().cyan(`\n${this.mapInteractionMessage}`));
            this.mapInteractionMessage = null;
        }
      } else if (nextScreen !== this.currentScreenHandler) {
        this.currentScreenHandler = nextScreen;
        (_b = (_a = this.currentScreenHandler) === null || _a === void 0 ? void 0 : _a.onEnter) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_c = this.currentScreenHandler) === null || _c === void 0 ? void 0 : _c.render();
      } else {
        (_d = this.currentScreenHandler) === null || _d === void 0 ? void 0 : _d.render();
      }
      return;
    }

    let triggeredBattle = false;
    let needsRender = true; 

    switch (cmd) {
      case "up":
      case "down":
      case "left":
      case "right":
        this.previousPlayerX = this.modelPlayer.x;
        this.previousPlayerY = this.modelPlayer.y;
        const moveResult = this.modelPlayer.move(
          cmd === "left" ? -1 : cmd === "right" ? 1 : 0,
          cmd === "up" ? -1 : cmd === "down" ? 1 : 0,
          this.modelMap
        );

        if (moveResult === '"') {
          if (this.modelPlayer.getActivePokemon()) {
            triggeredBattle = this.tryStartBattle();
          } else {
            this.mapInteractionMessage = "Você não tem Pokémon para batalhar!";
          }
        }
        break;
      case "i":
        this.currentScreenHandler = new InventoryScreen(this.modelPlayer, this);
        (_e = this.currentScreenHandler.onEnter) === null || _e === void 0 ? void 0 : _e.call(this.currentScreenHandler);
        this.currentScreenHandler.render();
        needsRender = false; 
        break;
      case "e": 
      case "return": // Handle 'return' for Enter key
        const { x: px, y: py } = this.modelPlayer;
        const adjacentCoords = [
          { x: px, y: py - 1 }, // Up
          { x: px, y: py + 1 }, // Down
          { x: px - 1, y: py }, // Left
          { x: px + 1, y: py }, // Right
        ];

        let interacted = false;
        for (const coord of adjacentCoords) {
          if (this.modelMap.getCell(coord.x, coord.y) === 'o') {
            const randomItemValue = Math.random();
            let obtainedItemType: ItemType;
            if (randomItemValue < 0.5) {
              obtainedItemType = ItemType.POTION;
            } else {
              obtainedItemType = ItemType.POKEBALL;
            }
            this.modelPlayer.inventory.addItem(obtainedItemType, 1);
            this.mapInteractionMessage = `Você obteve um(a) ${obtainedItemType}!`;
            this.modelMap.setCell(coord.x, coord.y, ' '); 
            interacted = true;
            break; 
          }
        }
        break;
      default:
        needsRender = false; 
        break;
    }

    if (needsRender && !triggeredBattle && !this.currentScreenHandler) {
      this.gameView.render(); // This will call the GameController's render logic
       if (this.mapInteractionMessage && !this.inBattle && !this.currentScreenHandler) { // Ensure message is shown by the main game loop render
           // The message will be rendered by the main GameController.render() call
           // No need to console.log it here directly if GameController.render() handles it
       }
    }
    
    // Save game data if an action that modifies persistent state occurred
    // and it's not handled by a sub-screen or battle ending.
    if ((cmd === "e" || cmd === "return" || cmd === "up" || cmd === "down" || cmd === "left" || cmd === "right") && !this.currentScreenHandler && !this.inBattle) {
        this.db.saveGameData(this.modelPlayer);
    }
  }

  private tryStartBattle(): boolean {
    const encounterChance = 0.25;
    if (Math.random() < encounterChance) {
      const availableEncounters = BUSH_ENCOUNTERS_MAPA1.filter(
        (enc) => Math.random() < enc.chance
      );
      if (availableEncounters.length > 0) {
        const encounterDef =
          availableEncounters[
            Math.floor(Math.random() * availableEncounters.length)
          ];
        const level =
          Math.floor(
            Math.random() * (encounterDef.maxLevel - encounterDef.minLevel + 1)
          ) + encounterDef.minLevel;

        const wildPokemonBase = this.db.getPokemonDefinitionById(
          encounterDef.pokemonId
        );
        if (wildPokemonBase) {
          const wildPokemonInstance = this.db.instantiatePokemon(
            wildPokemonBase.id,
            level
          );
          if (wildPokemonInstance && this.modelPlayer.getActivePokemon()) {
            this.startBattle(wildPokemonInstance);
            return true;
          } else if (!this.modelPlayer.getActivePokemon()) {
            this.mapInteractionMessage = "Você precisa de um Pokémon ativo para entrar em batalhas!";
            this.modelPlayer.x = this.previousPlayerX;
            this.modelPlayer.y = this.previousPlayerY;
          }
        }
      }
    }
    return false;
  }

  private startBattle(wildPokemon: Pokemon): void {
    this.inBattle = true;
    this.modelPlayer.lastMapPosition = {
      x: this.previousPlayerX,
      y: this.previousPlayerY,
    };
    this.battleController = new BattleController(
      this.modelPlayer,
      wildPokemon,
      this,
      this.db,
      () => {
        this.endBattle();
      }
    );
    this.battleController.getScreen().render();
  }

 private endBattle(): void {
    this.inBattle = false;
    const battleOutcomeMessage = this.battleController?.getScreen().message || "";
    this.battleController = null;
    
    const activePokemon = this.modelPlayer.getActivePokemon();
    if (activePokemon &&
        (this.modelPlayer.lastMapPosition.x !== this.modelPlayer.x ||
         this.modelPlayer.lastMapPosition.y !== this.modelPlayer.y)) {
      this.modelPlayer.x = this.modelPlayer.lastMapPosition.x;
      this.modelPlayer.y = this.modelPlayer.lastMapPosition.y;
       this.mapInteractionMessage = battleOutcomeMessage; 
    } else if (!activePokemon) {
      this.mapInteractionMessage = battleOutcomeMessage.includes("derrotado") ? battleOutcomeMessage : "Você não tem mais Pokémon capazes de lutar!";
    } else {
         this.mapInteractionMessage = battleOutcomeMessage;
    }

    this.db.saveGameData(this.modelPlayer);
    this.currentScreenHandler = null;
    // The main render loop (triggered by GameScreen/ContinueScreen's keypress handler)
    // will call GameController.render(), which will display the map and the mapInteractionMessage.
  }

  public resumeGame(): void {
    this.currentScreenHandler = null;
    this.gameView.render(); 
    if (this.mapInteractionMessage) { // Show any pending message on resume
        console.log(kleur.bold().cyan(`\n${this.mapInteractionMessage}`));
        this.mapInteractionMessage = null;
    }
  }

  public getDatabase(): Database {
    return this.db;
  }
}