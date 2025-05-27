"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BattleController_1 = __importDefault(require("../controller/BattleController"));
const Player_1 = __importDefault(require("../model/Player"));
const Pokemon_1 = __importDefault(require("../model/Pokemon"));
const BattleAction_1 = require("../enum/BattleAction");
const PokemonType_1 = require("../enum/PokemonType");
const GameController_1 = __importDefault(require("../controller/GameController"));
const Database_1 = __importDefault(require("../db/Database"));
const BattleScreen_1 = __importDefault(require("../view/BattleScreen"));
// Mock das dependências principais
jest.mock("../view/BattleScreen");
jest.mock("../db/Database");
jest.mock("../controller/GameController");
// Função auxiliar para criar Pokémon rapidamente para os testes
const createPokemon = (id, name, level, hp, attack, defense, type = PokemonType_1.PokemonType.NORMAL) => {
    const stats = {
        attack,
        defense,
        hp,
        maxHp: hp,
        speed: 10,
        type,
        level,
        xp: 0,
        xpToNextLevel: 100,
    };
    return new Pokemon_1.default(id, name, `${name}-art`, stats);
};
describe("BattleController - Testes de Vitória Simplificados", () => {
    let player;
    let wildPokemon;
    let playerPokemon;
    let gameControllerMock;
    let databaseMock;
    let onBattleEndMock;
    let battleController;
    let mockBattleScreenInstance;
    beforeEach(() => {
        // Limpa mocks e configura instâncias
        BattleScreen_1.default.mockClear();
        Database_1.default.mockClear();
        GameController_1.default.mockClear();
        player = new Player_1.default(0, 0); // Posição inicial não relevante aqui
        gameControllerMock = new GameController_1.default();
        databaseMock = new Database_1.default();
        onBattleEndMock = jest.fn();
    });
    // Teste - O Pokémon do jogador deve vencer
    it("SUCESSO: deve resultar em vitória para o jogador quando o Pokémon selvagem é derrotado", (done) => {
        // Arrange
        playerPokemon = createPokemon(1, "PlayerMonForte", 5, 50, 30, 10, PokemonType_1.PokemonType.FIRE); // Ataque alto
        wildPokemon = createPokemon(2, "WildMonFraco", 1, 20, 10, 5, PokemonType_1.PokemonType.GRASS); // HP baixo, defesa baixa, fraco contra fogo
        player.addPokemonToTeam(playerPokemon);
        battleController = new BattleController_1.default(player, wildPokemon, gameControllerMock, databaseMock, onBattleEndMock);
        mockBattleScreenInstance = BattleScreen_1.default.mock.instances[0];
        mockBattleScreenInstance.updateBattleState = jest.fn();
        mockBattleScreenInstance.render = jest.fn();
        mockBattleScreenInstance.message = "";
        // Mock para a função de salvar o time do jogador no banco de dados, chamada em handleVictory [cite: 87]
        databaseMock.savePlayerTeam = jest.fn();
        // Act: Jogador ataca
        battleController.handlePlayerAction(BattleAction_1.BattleAction.ATTACK);
        // Verificamos se o HP do Pokémon selvagem chegou a 0
        expect(wildPokemon.currentHp).toBe(0);
        // Verificamos se a mensagem de vitória foi passada para updateBattleState.
        const lastCallArgs = mockBattleScreenInstance.updateBattleState.mock.calls[mockBattleScreenInstance.updateBattleState.mock.calls
            .length - 1];
        const finalMessage = lastCallArgs[2]; // O terceiro argumento é a mensagem
        expect(finalMessage).toContain(`${playerPokemon.name} derrotou ${wildPokemon.name}!` //Verifica se o pokemon do player derrotou o pokemon selvagem
        );
        expect(finalMessage).toContain("XP"); // Verifica se a mensagem de XP ganho está lá
        setTimeout(() => {
            expect(onBattleEndMock).toHaveBeenCalled();
            done();
        }, 2550);
    });
});
