"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Pokemon_1 = __importDefault(require("./Pokemon"));
const Inventory_1 = __importDefault(require("./Inventory"));
class PlayerModel {
    constructor(x, y, initialPokemon) {
        this.x = x;
        this.y = y;
        this.team = [];
        this.maxTeamSize = 6;
        this.inventory = new Inventory_1.default();
        if (initialPokemon) {
            this.addPokemonToTeam(initialPokemon);
        }
        this.lastMapPosition = { x, y };
    }
    /**
     * Tenta mover o jogador.
     * @param dx Mudança na coordenada X.
     * @param dy Mudança na coordenada Y.
     * @param map O mapa atual.
     * @returns Retorna o caractere da célula para a qual o jogador tentou se mover se for grama ('"'),
     * ou '#' se o movimento for bloqueado (parede ou objeto 'o'),
     * ou null se o movimento for para um espaço vazio (' ').
     */
    move(dx, dy, map) {
        const nx = this.x + dx;
        const ny = this.y + dy;
        const nextCell = map.getCell(nx, ny);
        if (nextCell === ' ') { // Permite andar em espaço vazio
            this.x = nx;
            this.y = ny;
            return null; // Movimento para espaço vazio
        }
        else if (nextCell === '"') { // Permite andar na grama
            this.x = nx;
            this.y = ny;
            return '"'; // Indica que pisou na grama
        }
        else if (nextCell === '#' || nextCell === 'o') { // Bloqueado por parede ou objeto 'o'
            return nextCell; // Retorna o caractere que bloqueou
        }
        return '#'; // Trata como bloqueado por padrão
    }
    addPokemonToTeam(pokemon) {
        if (this.team.length < this.maxTeamSize) {
            this.team.push(pokemon);
            return true;
        }
        console.log('Sua equipe está cheia!');
        return false;
    }
    getActivePokemon() {
        return this.team.find(p => p.currentHp > 0);
    }
    switchPokemon(index) {
        if (index >= 0 && index < this.team.length && this.team[index].currentHp > 0) {
            const chosenPokemon = this.team.splice(index, 1)[0];
            this.team.unshift(chosenPokemon);
            return true;
        }
        return false;
    }
    getTeamSaveData() {
        return this.team.map(p => ({
            id: p.id,
            level: p.stats.level,
            xp: p.stats.xp,
            currentHp: p.currentHp,
        }));
    }
    loadTeamFromData(teamData, allPokemons) {
        this.team = teamData.map(data => {
            const basePokemon = allPokemons.find(p => p.id === data.id);
            if (basePokemon) {
                const instance = Pokemon_1.default.createInstanceWithLevel(basePokemon, data.level);
                instance.stats.xp = data.xp;
                instance.currentHp = data.currentHp > instance.stats.maxHp ? instance.stats.maxHp : data.currentHp;
                return instance;
            }
            return null;
        }).filter(p => p !== null);
    }
}
exports.default = PlayerModel;
