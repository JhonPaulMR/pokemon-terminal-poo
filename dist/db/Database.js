"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Item_1 = require("../model/Item");
const Pokemon_1 = __importDefault(require("../model/Pokemon"));
const PokemonType_1 = require("../enum/PokemonType");
const PIKACHU_ART = `
⠀⠀⠀⠀⠀⠀⣰⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣰⠟⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀
⠀⠀⠀⠀⢀⠁⠀⠇⠀⠀⠀⠀⠀⠀⠀⢀⠀⠤⠀⠒⣶⣶⠆⠀⠀⢀⠔⠁⢠⠀
⠀⠀⠀⠀⠘⢀⠼⠤⠀⠀⠀⠄⡠⠐⠈⠀⠀⠀⠀⡰⠟⠁⠀⢀⠔⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢜⡁⠀⠀⠀⣖⣦⠀⠀⠤⣤⠄⠐⠂⠁⠀⠀⢀⠔⠁⠀⠀⠀⠀⠀⡇
⠀⠀⠀⡸⠷⢁⡀⢀⡀⠈⢉⠤⢄⠀⠈⡀⠀⠀⠀⠀⣔⡁⠄⠄⠀⠀⢀⠠⠂⠁
⠀⠀⢠⢻⠀⠹⣿⠿⡇⠀⠡⠔⠜⠀⠀⢁⠀⠀⠀⠀⢡⠀⠀⢀⠄⠊⠁⠀⠀⠀
⠀⠀⠀⠫⡀⠀⠐⠤⠃⠀⠀⠀⠀⢀⠀⠀⢂⠀⠀⠀⠀⢃⠀⠸⠀⠀⠀⠀⠀⠀
⢀⠠⠐⠂⠉⠢⠀⡀⠀⠀⠀⠀⠖⠉⠉⠀⠀⢧⡀⠀⡠⠒⠀⡠⠀⠀⠀⠀⠀⠀
⢸⡘⠀⠀⠀⠀⢢⠈⠂⠀⠀⠀⠘⢤⣄⣤⠄⠀⠈⢊⠢⣠⣎⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠉⠀⠒⠒⠀⢣⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠗⣾⠿⠆⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡷⠄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⡀⠀⠀⠀⣀⣀⠀⠀⢀⣀⡀⠤⢊⠆⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠐⠢⢤⣥⠒⠉⠉⠑⠂⠠⠤⡤⢺⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢛⠀⠀⠀⠀⠀⠀⠀⠐⢾⠀⠀⠀⠀⠀⠀⠀⠀⠀
`;
const CHARMANDER_ART = `
   ⠀⠀⢀⠤⠐⠒⠂⠄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣰⠇⠀⠀⠀⢠⡀⠑⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣠⠟⠀⠀⠀⠀⣮⣾⡆⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⡘⠀⠀⠀⠀⠀⠀⠯⠭⠃⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⡀⠱⣄⣀⠐⠀⣀⣀⣀⠠⠂⢠⠀⠀⠀⠀⠀⠀⠀⠀⢠⢤⡀⠀
⢰⣳⠁⠚⢿⠄⣀⡠⣔⢪⠒⠁⠼⠄⠐⠈⠵⣧⠀⠀⠀⣇⡀⠱⡀
⠀⠈⢀⠀⠀⡜⠀⠀⠀⠀⠑⡀⠀⠀⠀⢀⠜⠁⠀⠀⠀⡆⠹⡄⡣
⠀⠀⠀⠑⢠⠀⠀⠀⠀⠀⠀⠐⡀⠀⢊⠁⠀⠀⠀⠀⠀⠸⣀⣹⠇
⠀⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀⠀⢡⠀⠈⡄⠀⠀⠀⠀⠀⠀⡘⠀⠀
⠀⠀⠀⠀⠀⢇⠀⠀⠀⠀⠀⠀⢸⠀⠀⢠⠀⠀⠀⠀⢀⠔⠀⠇⠀
⠀⠀⠀⢀⠔⠉⢂⠀⠀⠀⠀⠀⡜⠒⠀⢺⠁⠐⠂⠈⠁⠀⠜⠀⠀
⠀⠀⠀⠸⡀⠀⠀⠁⠢⠄⣀⡔⠀⠀⠀⢸⠀⠀⠀⢀⠠⠊⠀⠀⠀
⠀⢀⣠⠒⠉⠀⠀⠀⢪⠀⠀⡱⠀⠀⠠⡎⠉⠉⠉⠀⠀⠀⠀⠀⠀
⠀⠈⠛⠑⠒⠒⠀⠈⠁⠀⠀⠙⢵⡵⡯⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀
`;
const SQUIRTLE_ART = `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠤⠐⠒⠒⠂⠠⡀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠊⠀⠀⡠⢠⠂⠀⠀⠀⠡⡀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠇⠀⠀⢰⣷⣾⠀⠀⠀⠀⠀⡇⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠜⢨⠢⠔⡀⠀⠠⠘⠛⠛⠀⠀⠀⠀⢸⡇⠀
⠀⠀⠀⢀⣀⣀⠀⠀⠀⠰⠀⠀⠀⠀⠡⡀⠀⠈⠀⠒⠂⠄⡀⢀⠀⡀⠀
⠀⡴⠊⠀⠀⠀⠉⢆⠀⡔⢣⠀⠀⠀⠀⠐⡤⣀⠀⠀⠀⠀⠀⣀⠄⠀⠀
⢸⠀⠀⠀⢠⠀⠀⠈⣼⠀⠀⠣⠀⠀⠀⡰⡀⠀⠉⠀⠀⠰⠉⠀⠁⠠⢄
⢰⠀⠀⠀⠀⠇⠀⢀⢿⠀⢀⠇⡐⠀⠈⠀⠈⠐⠠⠤⠤⠤⠀⠀⠀⠀⢨
⠀⢓⠤⠤⠊⠀⠀⢸⠀⠣⠀⡰⠁⠀⠀⡀⠀⠀⠀⠸⠀⢰⠁⠐⠂⠈⠁
⠀⠀⠑⢀⠀⠀⠀⠈⣄⠖⠉⠑⢄⠠⠊⠀⠢⢄⣠⣃⣀⡆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠑⠠⢀⣀⠎⠀⠀⠀⠈⡄⠀⠀⠀⢠⢃⠠⠃⠐⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠸⠀⠀⠀⠀⢀⠯⠉⠤⢴⡃⠁⠀⠀⠀⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠰⡁⠀⠀⠀⠠⠂⠀⠀⠀⠀⠑⢄⠀⠀⢀⠲⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⠒⠑⠔⠁⠀⠀⠀⠀⠀⠀⠀⠁⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀
`;
const BULBASAUR_ART = `
    ⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⣀⡀⠈⡖⡤⠄⠀
⠀⠀⢀⡀⠀⠀⠀⡐⠁⠀⠀⠠⠐⠂⠀⠁⠀⠀⠀⠀
⠀⠰⡁⠐⢉⣉⣭⡍⠁⠂⠉⠘⡀⠀⠀⠀⠀⠂⠡⠀
⢀⣊⠀⡄⠻⠿⠋⠀⠀⠀⠀⠀⢃⠀⠀⠀⠀⠀⠀⢀
⡎⣾⠀⠁⣴⡆⠀⠡⢺⣿⣆⠀⢠⢱⣄⠀⠀⠀⠀⠈
⡑⠟⠀⠀⠀⠀⠀⢀⣸⡿⠟⠀⠀⠈⢿⣿⡦⡀⠀⡰
⠙⠔⠦⣤⣥⣤⣤⣤⡤⠆⠀⠀⠀⠀⢀⢀⠀⠈⠎⠀
⠀⠀⠈⣰⡋⢉⠉⠁⠒⠂⢇⢠⡆⠀⠸⢴⣿⠀⠘⠀
⠀⠀⠘⡿⠃⠀⠨⠒⢆⣸⣿⠁⠀⡠⡇⠈⠋⠀⠰⠀
⠀⠀⠀⠛⠒⠒⠁⠀⠈⠷⡤⠤⠐⠀⠘⠒⠒⠖⠁⠀
`;
class Database {
    constructor(filename = "db.json") {
        this.filePath = path.resolve(process.cwd(), filename);
        this.allPokemonDefinitions = [
            {
                id: 1,
                name: "Pikachu",
                asciiArt: PIKACHU_ART,
                stats: {
                    attack: 55,
                    defense: 40,
                    baseHp: 35,
                    speed: 90,
                    type: PokemonType_1.PokemonType.ELECTRIC,
                    baseLevel: 5,
                },
            },
            {
                id: 2,
                name: "Charmander",
                asciiArt: CHARMANDER_ART,
                stats: {
                    attack: 52,
                    defense: 43,
                    baseHp: 39,
                    speed: 65,
                    type: PokemonType_1.PokemonType.FIRE,
                    baseLevel: 5,
                },
            },
            {
                id: 3,
                name: "Squirtle",
                asciiArt: SQUIRTLE_ART,
                stats: {
                    attack: 48,
                    defense: 65,
                    baseHp: 44,
                    speed: 43,
                    type: PokemonType_1.PokemonType.WATER,
                    baseLevel: 5,
                },
            },
            {
                id: 4,
                name: "Bulbasaur",
                asciiArt: BULBASAUR_ART,
                stats: {
                    attack: 49,
                    defense: 49,
                    baseHp: 45,
                    speed: 45,
                    type: PokemonType_1.PokemonType.GRASS,
                    baseLevel: 5,
                },
            },
            // Adicionar mais pokemons aqui
        ];
        this.data = this.load();
    }
    load() {
        const defaultData = {
            playerPosition: { x: 14, y: 6 }, // Posição inicial padrão
            playerInventory: { [Item_1.ItemType.POKEBALL]: 5, [Item_1.ItemType.POTION]: 3 },
            playerTeam: [
                {
                    id: 1,
                    level: 5,
                    xp: 0,
                    currentHp: this.getPokemonDefinitionById(1).stats.baseHp + (5 - 1) * 5,
                },
            ], // Pikachu inicial
        };
        if (fs.existsSync(this.filePath)) {
            try {
                const fileData = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
                // Merge para garantir que todos os campos existam, mesmo que o save antigo não os tenha
                return Object.assign(Object.assign({}, defaultData), fileData);
            }
            catch (error) {
                console.error("Erro ao carregar o banco de dados, usando dados padrão:", error);
                return defaultData;
            }
        }
        else {
            this.persist(defaultData); // Cria o arquivo com dados padrão se não existir
            return defaultData;
        }
    }
    persist(dataToSave) {
        fs.writeFileSync(this.filePath, JSON.stringify(dataToSave || this.data, null, 2));
    }
    getPokemonDefinitionById(id) {
        return this.allPokemonDefinitions.find((p) => p.id === id);
    }
    getAllPokemonDefinitions() {
        return [...this.allPokemonDefinitions];
    }
    // Método para instanciar um Pokémon a partir da definição e nível
    instantiatePokemon(id, level) {
        const definition = this.getPokemonDefinitionById(id);
        if (!definition)
            return null;
        const stats = {
            attack: definition.stats.attack,
            defense: definition.stats.defense,
            hp: definition.stats.baseHp, // HP será ajustado pelo levelUp
            maxHp: definition.stats.baseHp,
            speed: definition.stats.speed,
            type: definition.stats.type,
            level: 1, // Começa em 1 para o levelUp funcionar
            xp: 0,
            xpToNextLevel: 100, // Exemplo, pode ser mais complexo
        };
        const newPokemon = new Pokemon_1.default(definition.id, definition.name, definition.asciiArt, stats);
        // Simular level ups até o nível desejado para ajustar os stats
        for (let i = 1; i < level; i++) {
            newPokemon.stats.level++;
            newPokemon.stats.maxHp += 5; // Exemplo de aumento
            newPokemon.stats.hp = newPokemon.stats.maxHp;
            newPokemon.stats.attack += 2;
            newPokemon.stats.defense += 2;
            newPokemon.stats.speed += 1;
            newPokemon.stats.xpToNextLevel = Math.floor(newPokemon.stats.xpToNextLevel * 1.5);
        }
        newPokemon.currentHp = newPokemon.stats.maxHp; // Garante HP cheio
        return newPokemon;
    }
    getPlayerPosition() {
        return Object.assign({}, this.data.playerPosition);
    }
    savePlayerPosition(x, y) {
        this.data.playerPosition = { x, y };
        this.persist();
    }
    getPlayerInventory() {
        return Object.assign({}, this.data.playerInventory);
    }
    savePlayerInventory(inventoryData) {
        this.data.playerInventory = inventoryData;
        this.persist();
    }
    getPlayerTeamData() {
        return JSON.parse(JSON.stringify(this.data.playerTeam)); // Retorna uma cópia profunda
    }
    savePlayerTeam(teamData) {
        this.data.playerTeam = teamData;
        this.persist();
    }
    // Método para salvar todos os dados do jogo de uma vez
    saveGameData(player) {
        this.data.playerPosition = { x: player.x, y: player.y };
        this.data.playerInventory = player.inventory.toSaveData();
        this.data.playerTeam = player.getTeamSaveData();
        this.persist();
    }
}
exports.default = Database;
