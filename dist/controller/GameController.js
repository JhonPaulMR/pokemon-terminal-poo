"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = __importDefault(require("../model/Map"));
const Player_1 = __importDefault(require("../model/Player"));
const GameView_1 = __importDefault(require("../view/GameView"));
const Database_1 = __importDefault(require("../db/Database"));
const InventoryScreen_1 = __importDefault(require("../view/InventoryScreen"));
const BattleController_1 = __importDefault(require("./BattleController"));
const Pokemon_1 = __importDefault(require("../model/Pokemon"));
const PokemonType_1 = require("../enum/PokemonType");
const Item_1 = require("../model/Item");
const kleur_1 = __importDefault(require("kleur"));
const BUSH_ENCOUNTERS_MAPA1 = [
    { pokemonId: 2, minLevel: 2, maxLevel: 5, chance: 0.4 }, // Charmander
    { pokemonId: 3, minLevel: 2, maxLevel: 5, chance: 0.4 }, // Squirtle
    { pokemonId: 4, minLevel: 2, maxLevel: 5, chance: 0.4 }, // Bulbasaur
    { pokemonId: 1, minLevel: 3, maxLevel: 7, chance: 0.2 }, // Pikachu
];
class GameController {
    constructor(mapFile, dbFile) {
        this.mapFile = mapFile;
        this.dbFile = dbFile;
        this.currentScreenHandler = null;
        this.battleController = null;
        this.inBattle = false;
        this.previousPlayerX = 0;
        this.previousPlayerY = 0;
        this.mapInteractionMessage = null;
    }
    initializeCommonComponents(loadPlayerFromDb) {
        this.modelMap = new Map_1.default(this.mapFile);
        this.modelMap.load(); // Make sure map is loaded before player position is set
        this.db = new Database_1.default(this.dbFile);
        let playerX, playerY;
        if (loadPlayerFromDb) {
            const pos = this.db.getPlayerPosition();
            playerX = pos.x;
            playerY = pos.y;
        }
        else {
            // Default starting position for new game.
            // Assuming 'o' is at (14,6) in mapa1.txt, start player at (13,6) to be adjacent.
            playerX = 13;
            playerY = 6;
        }
        const pikachuDef = this.db.getPokemonDefinitionById(1);
        let initialPokemon = null;
        if (pikachuDef) {
            initialPokemon = this.db.instantiatePokemon(pikachuDef.id, pikachuDef.stats.baseLevel || 5);
        }
        if (!initialPokemon) {
            console.error("Não foi possível criar o Pokémon inicial (Pikachu)! Usando FallbackMon.");
            const fallbackStats = {
                attack: 10, defense: 10, hp: 20, maxHp: 20, speed: 10,
                type: PokemonType_1.PokemonType.NORMAL, level: 5, xp: 0, xpToNextLevel: 100,
            };
            initialPokemon = new Pokemon_1.default(0, "FallbackMon", "Fallback Art", fallbackStats);
        }
        this.modelPlayer = new Player_1.default(playerX, playerY, initialPokemon);
        if (loadPlayerFromDb) {
            this.modelPlayer.inventory.fromSaveData(this.db.getPlayerInventory());
            const teamData = this.db.getPlayerTeamData();
            const allPokemonBaseDefinitions = this.db.getAllPokemonDefinitions();
            const instantiatedPokemons = [];
            allPokemonBaseDefinitions.forEach((def) => {
                const instance = this.db.instantiatePokemon(def.id, def.stats.baseLevel || 1);
                if (instance) {
                    instantiatedPokemons.push(instance);
                }
            });
            this.modelPlayer.loadTeamFromData(teamData, instantiatedPokemons);
        }
        else {
            this.db.saveGameData(this.modelPlayer);
        }
        this.gameView = new GameView_1.default(this.modelMap, this.modelPlayer);
    }
    startNew() {
        this.initializeCommonComponents(false);
        this.inBattle = false;
        this.currentScreenHandler = null;
    }
    startContinue() {
        this.initializeCommonComponents(true);
        this.inBattle = false;
        this.currentScreenHandler = null;
    }
    render() {
        if (this.inBattle && this.battleController) {
            this.battleController.getScreen().render();
        }
        else if (this.currentScreenHandler) {
            this.currentScreenHandler.render();
        }
        else if (this.gameView) {
            this.gameView.render();
            if (this.mapInteractionMessage) {
                console.log(kleur_1.default.bold().cyan(`\n${this.mapInteractionMessage}`));
                this.mapInteractionMessage = null; // Clear message after displaying
            }
        }
    }
    handleInput(cmd) {
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
                    console.log(kleur_1.default.bold().cyan(`\n${this.mapInteractionMessage}`));
                    this.mapInteractionMessage = null;
                }
            }
            else if (nextScreen !== this.currentScreenHandler) {
                this.currentScreenHandler = nextScreen;
                (_b = (_a = this.currentScreenHandler) === null || _a === void 0 ? void 0 : _a.onEnter) === null || _b === void 0 ? void 0 : _b.call(_a);
                (_c = this.currentScreenHandler) === null || _c === void 0 ? void 0 : _c.render();
            }
            else {
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
                const moveResult = this.modelPlayer.move(cmd === "left" ? -1 : cmd === "right" ? 1 : 0, cmd === "up" ? -1 : cmd === "down" ? 1 : 0, this.modelMap);
                if (moveResult === '"') {
                    if (this.modelPlayer.getActivePokemon()) {
                        triggeredBattle = this.tryStartBattle();
                    }
                    else {
                        this.mapInteractionMessage = "Você não tem Pokémon para batalhar!";
                    }
                }
                break;
            case "i":
                this.currentScreenHandler = new InventoryScreen_1.default(this.modelPlayer, this);
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
                        let obtainedItemType;
                        if (randomItemValue < 0.5) {
                            obtainedItemType = Item_1.ItemType.POTION;
                        }
                        else {
                            obtainedItemType = Item_1.ItemType.POKEBALL;
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
    tryStartBattle() {
        const encounterChance = 0.25;
        if (Math.random() < encounterChance) {
            const availableEncounters = BUSH_ENCOUNTERS_MAPA1.filter((enc) => Math.random() < enc.chance);
            if (availableEncounters.length > 0) {
                const encounterDef = availableEncounters[Math.floor(Math.random() * availableEncounters.length)];
                const level = Math.floor(Math.random() * (encounterDef.maxLevel - encounterDef.minLevel + 1)) + encounterDef.minLevel;
                const wildPokemonBase = this.db.getPokemonDefinitionById(encounterDef.pokemonId);
                if (wildPokemonBase) {
                    const wildPokemonInstance = this.db.instantiatePokemon(wildPokemonBase.id, level);
                    if (wildPokemonInstance && this.modelPlayer.getActivePokemon()) {
                        this.startBattle(wildPokemonInstance);
                        return true;
                    }
                    else if (!this.modelPlayer.getActivePokemon()) {
                        this.mapInteractionMessage = "Você precisa de um Pokémon ativo para entrar em batalhas!";
                        this.modelPlayer.x = this.previousPlayerX;
                        this.modelPlayer.y = this.previousPlayerY;
                    }
                }
            }
        }
        return false;
    }
    startBattle(wildPokemon) {
        this.inBattle = true;
        this.modelPlayer.lastMapPosition = {
            x: this.previousPlayerX,
            y: this.previousPlayerY,
        };
        this.battleController = new BattleController_1.default(this.modelPlayer, wildPokemon, this, this.db, () => {
            this.endBattle();
        });
        this.battleController.getScreen().render();
    }
    endBattle() {
        var _f;
        this.inBattle = false;
        const battleOutcomeMessage = ((_f = this.battleController) === null || _f === void 0 ? void 0 : _f.getScreen().message) || "";
        this.battleController = null;
        const activePokemon = this.modelPlayer.getActivePokemon();
        if (activePokemon &&
            (this.modelPlayer.lastMapPosition.x !== this.modelPlayer.x ||
                this.modelPlayer.lastMapPosition.y !== this.modelPlayer.y)) {
            this.modelPlayer.x = this.modelPlayer.lastMapPosition.x;
            this.modelPlayer.y = this.modelPlayer.lastMapPosition.y;
            this.mapInteractionMessage = battleOutcomeMessage;
        }
        else if (!activePokemon) {
            this.mapInteractionMessage = battleOutcomeMessage.includes("derrotado") ? battleOutcomeMessage : "Você não tem mais Pokémon capazes de lutar!";
        }
        else {
            this.mapInteractionMessage = battleOutcomeMessage;
        }
        this.db.saveGameData(this.modelPlayer);
        this.currentScreenHandler = null;
        // The main render loop (triggered by GameScreen/ContinueScreen's keypress handler)
        // will call GameController.render(), which will display the map and the mapInteractionMessage.
    }
    resumeGame() {
        this.currentScreenHandler = null;
        this.gameView.render();
        if (this.mapInteractionMessage) { // Show any pending message on resume
            console.log(kleur_1.default.bold().cyan(`\n${this.mapInteractionMessage}`));
            this.mapInteractionMessage = null;
        }
    }
    getDatabase() {
        return this.db;
    }
}
exports.default = GameController;
