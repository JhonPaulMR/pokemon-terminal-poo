import BattleController from "../controller/BattleController";
import PlayerModel from "../model/Player";
import Pokemon, { PokemonStats } from "../model/Pokemon";
import { BattleAction } from "../enum/BattleAction";
import { PokemonType } from "../enum/PokemonType";
import GameController from "../controller/GameController";
import Database from "../db/Database";
import BattleScreen from "../view/BattleScreen";

// Mock das dependências principais
jest.mock("../view/BattleScreen");
jest.mock("../db/Database");
jest.mock("../controller/GameController");

// Função auxiliar para criar Pokémon rapidamente para os testes
const createPokemon = (
  id: number,
  name: string,
  level: number,
  hp: number,
  attack: number,
  defense: number,
  type: PokemonType = PokemonType.NORMAL
): Pokemon => {
  const stats: PokemonStats = {
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
  return new Pokemon(id, name, `${name}-art`, stats);
};

describe("BattleController - Testes de Vitória Simplificados", () => {
  let player: PlayerModel;
  let wildPokemon: Pokemon;
  let playerPokemon: Pokemon;
  let gameControllerMock: GameController;
  let databaseMock: Database;
  let onBattleEndMock: jest.Mock;
  let battleController: BattleController;
  let mockBattleScreenInstance: BattleScreen;

  beforeEach(() => {
    // Limpa mocks e configura instâncias
    (BattleScreen as jest.Mock).mockClear();
    (Database as jest.Mock).mockClear();
    (GameController as jest.Mock).mockClear();

    player = new PlayerModel(0, 0); // Posição inicial não relevante aqui
    gameControllerMock = new (GameController as jest.Mock)();
    databaseMock = new (Database as jest.Mock)();
    onBattleEndMock = jest.fn();

  });

  // Teste - O Pokémon do jogador deve vencer
  it("SUCESSO: deve resultar em vitória para o jogador quando o Pokémon selvagem é derrotado", (done) => {
    // Arrange
    playerPokemon = createPokemon(
      1,
      "PlayerMonForte",
      5,
      50,
      30,
      10,
      PokemonType.FIRE
    ); // Ataque alto
    wildPokemon = createPokemon(
      2,
      "WildMonFraco",
      1,
      20,
      10,
      5,
      PokemonType.GRASS
    ); // HP baixo, defesa baixa, fraco contra fogo
    player.addPokemonToTeam(playerPokemon);

    battleController = new BattleController(
      player,
      wildPokemon,
      gameControllerMock,
      databaseMock,
      onBattleEndMock
    );
    mockBattleScreenInstance = (BattleScreen as jest.Mock).mock.instances[0];
    mockBattleScreenInstance.updateBattleState = jest.fn();
    mockBattleScreenInstance.render = jest.fn();
    mockBattleScreenInstance.message = "";

    // Mock para a função de salvar o time do jogador no banco de dados, chamada em handleVictory [cite: 87]
    (databaseMock.savePlayerTeam as jest.Mock) = jest.fn();

    // Act: Jogador ataca
    battleController.handlePlayerAction(BattleAction.ATTACK);


    // Verificamos se o HP do Pokémon selvagem chegou a 0
    expect(wildPokemon.currentHp).toBe(0);

    // Verificamos se a mensagem de vitória foi passada para updateBattleState.
    const lastCallArgs = (
      mockBattleScreenInstance.updateBattleState as jest.Mock
    ).mock.calls[
      (mockBattleScreenInstance.updateBattleState as jest.Mock).mock.calls
        .length - 1
    ];
    const finalMessage = lastCallArgs[2]; // O terceiro argumento é a mensagem

    expect(finalMessage).toContain(
      `${playerPokemon.name} derrotou ${wildPokemon.name}!` //Verifica se o pokemon do player derrotou o pokemon selvagem
    );
    expect(finalMessage).toContain("XP"); // Verifica se a mensagem de XP ganho está lá


    setTimeout(() => {
      expect(onBattleEndMock).toHaveBeenCalled();
      done();
    }, 2550);

  });
});
