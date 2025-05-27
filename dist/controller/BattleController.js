"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Pokemon_1 = __importDefault(require("../model/Pokemon"));
const BattleAction_1 = require("../enum/BattleAction");
const PokemonType_1 = require("../enum/PokemonType");
const Item_1 = require("../model/Item");
const BattleScreen_1 = __importDefault(require("../view/BattleScreen"));
class BattleController {
    constructor(player, wildPokemon, gameController, database, onBattleEnd) {
        this.player = player;
        this.wildPokemon = wildPokemon;
        this.gameController = gameController;
        this.database = database;
        this.onBattleEnd = onBattleEnd;
        const activePlayerPokemon = this.player.getActivePokemon();
        if (!activePlayerPokemon) {
            console.error("Tentativa de iniciar batalha sem Pokémon ativo! Isso não deveria acontecer.");
            this.onBattleEnd(); // Termina a batalha prematuramente se não houver pokémon.
        }
        this.battleScreen = new BattleScreen_1.default(player, wildPokemon, this);
    }
    getScreen() {
        return this.battleScreen;
    }
    calculateDamage(attacker, defender) {
        let damage = attacker.stats.attack - defender.stats.defense / 2;
        if (damage < 1)
            damage = 1;
        const attackerType = attacker.stats.type;
        const defenderType = defender.stats.type;
        let effectivenessMessage = "";
        const typeInteraction = PokemonType_1.TypeChart[attackerType];
        if (typeInteraction) {
            if (typeInteraction.strongAgainst.includes(defenderType)) {
                damage *= 2;
                effectivenessMessage = ` É super efetivo!`;
            }
            else if (typeInteraction.weakAgainst.includes(defenderType)) {
                damage *= 0.5;
                effectivenessMessage = ` Não é muito efetivo...`;
            }
        }
        if (effectivenessMessage) {
            this.battleScreen.message += effectivenessMessage;
        }
        return Math.floor(damage);
    }
    handlePlayerAction(action, payload) {
        var _a;
        let playerPokemon = this.player.getActivePokemon(); // Obtenha o pokémon ativo no início da ação
        let playerActionMessage = ""; // Mensagem da ação do jogador
        let enemyTurnShouldOccur = true;
        // Verifica se o jogador tem um Pokémon para lutar
        if (!playerPokemon || playerPokemon.currentHp === 0) {
            const nextAvailablePokemon = this.player.team.find(p => p.currentHp > 0);
            if (nextAvailablePokemon) {
                this.battleScreen.message = "Seu Pokémon está caído! Você precisa trocar.";
                // A tela de batalha deve permitir a seleção de um novo Pokémon.
                // Por enquanto, apenas atualiza a mensagem e espera uma ação do tipo POKEMON.
                // Idealmente, o BattleScreen entraria em modo de seleção de Pokémon.
                this.battleScreen.updateBattleState(playerPokemon || this.player.team[0], this.wildPokemon, this.battleScreen.message); // Usa o primeiro da equipe se o ativo estiver caído.
                this.battleScreen.render();
                // Não deve retornar aqui se queremos que o jogador escolha um novo pokémon na mesma "rodada de input"
                // Mas também não deve deixar o inimigo atacar se o jogador não puder agir.
                // A lógica atual da BattleScreen pode já lidar com a seleção.
                return; // Impede ações subsequentes e o turno do inimigo até que um novo Pokémon seja escolhido.
            }
            else {
                this.battleScreen.message = "Todos os seus Pokémon estão caídos!";
                this.endBattle(false, false, false, this.battleScreen.message); // Derrota
                return;
            }
        }
        // Se chegamos aqui, playerPokemon é válido e está vivo.
        const currentActivePlayerPokemon = playerPokemon; // Guarda referência caso troque.
        switch (action) {
            case BattleAction_1.BattleAction.ATTACK:
                this.battleScreen.message = ""; // Limpa mensagem de efetividade anterior
                const damageToWild = this.calculateDamage(currentActivePlayerPokemon, this.wildPokemon);
                this.wildPokemon.takeDamage(damageToWild);
                playerActionMessage = `${currentActivePlayerPokemon.name} atacou ${this.wildPokemon.name} causando ${damageToWild} de dano.${this.battleScreen.message}`;
                if (this.wildPokemon.currentHp === 0) {
                    this.handleVictory(playerActionMessage);
                    enemyTurnShouldOccur = false;
                    return;
                }
                break;
            case BattleAction_1.BattleAction.ITEM:
                const itemType = payload;
                if (itemType === Item_1.ItemType.POTION) {
                    if (this.player.inventory.getItemCount(Item_1.ItemType.POTION) > 0) {
                        if (currentActivePlayerPokemon.currentHp < currentActivePlayerPokemon.stats.maxHp) {
                            this.player.inventory.removeItem(Item_1.ItemType.POTION);
                            (_a = Item_1.POTION.action) === null || _a === void 0 ? void 0 : _a.call(Item_1.POTION, currentActivePlayerPokemon);
                            playerActionMessage = `Você usou ${Item_1.ItemType.POTION} em ${currentActivePlayerPokemon.name}.`;
                            this.database.savePlayerInventory(this.player.inventory.toSaveData());
                        }
                        else {
                            playerActionMessage = `${currentActivePlayerPokemon.name} já está com HP máximo.`;
                            enemyTurnShouldOccur = false;
                        }
                    }
                    else {
                        playerActionMessage = `Você não tem ${Item_1.ItemType.POTION}.`;
                        enemyTurnShouldOccur = false;
                    }
                }
                else if (itemType === Item_1.ItemType.POKEBALL) {
                    if (this.player.inventory.getItemCount(Item_1.ItemType.POKEBALL) > 0) {
                        this.player.inventory.removeItem(Item_1.ItemType.POKEBALL);
                        this.database.savePlayerInventory(this.player.inventory.toSaveData());
                        playerActionMessage = `Você usou ${Item_1.ItemType.POKEBALL}!`;
                        this.attemptCapture(playerActionMessage);
                        enemyTurnShouldOccur = false; // attemptCapture lida com o turno do inimigo
                        return;
                    }
                    else {
                        playerActionMessage = `Você não tem ${Item_1.ItemType.POKEBALL}.`;
                        enemyTurnShouldOccur = false;
                    }
                }
                break;
            case BattleAction_1.BattleAction.POKEMON:
                const pokemonIndex = payload;
                if (this.player.team[pokemonIndex] !== currentActivePlayerPokemon && this.player.team[pokemonIndex].currentHp > 0) {
                    if (this.player.switchPokemon(pokemonIndex)) {
                        playerPokemon = this.player.getActivePokemon(); // Atualiza o pokémon ativo localmente
                        playerActionMessage = `Você trocou para ${playerPokemon.name}.`;
                    }
                    else {
                        playerActionMessage = "Não foi possível trocar o Pokémon.";
                        enemyTurnShouldOccur = false;
                    }
                }
                else if (this.player.team[pokemonIndex] === currentActivePlayerPokemon) {
                    playerActionMessage = "Este Pokémon já está em batalha!";
                    enemyTurnShouldOccur = false;
                }
                else {
                    playerActionMessage = "Não pode trocar por um Pokémon caído!";
                    enemyTurnShouldOccur = false;
                }
                break;
            case BattleAction_1.BattleAction.FLEE:
                playerActionMessage = "Você fugiu da batalha!";
                this.endBattle(false, true, false, playerActionMessage);
                enemyTurnShouldOccur = false;
                return;
        }
        // Atualiza a tela com a ação do jogador
        // `playerPokemon` aqui pode ser o novo Pokémon após uma troca
        const pokemonParaExibir = this.player.getActivePokemon() || currentActivePlayerPokemon;
        this.battleScreen.updateBattleState(pokemonParaExibir, this.wildPokemon, playerActionMessage);
        this.battleScreen.render();
        // Turno do Inimigo
        if (enemyTurnShouldOccur && this.wildPokemon.currentHp > 0) {
            setTimeout(() => {
                this.battleScreen.message = ""; // Limpa para a mensagem de efetividade do inimigo
                // É crucial pegar o Pokémon ativo do jogador AQUI, APÓS a ação do jogador
                // (especialmente se foi uma troca ou se o Pokémon ativo mudou por outra razão)
                const pokemonAlvoDoJogador = this.player.getActivePokemon();
                if (!pokemonAlvoDoJogador) { // Verificação de segurança
                    console.error("ERRO CRÍTICO: Pokémon do jogador tornou-se indefinido antes do ataque selvagem.");
                    this.endBattle(false, false, false, playerActionMessage + "\nOcorreu um erro e a batalha não pode continuar.");
                    return;
                }
                const damageToPlayer = this.calculateDamage(this.wildPokemon, pokemonAlvoDoJogador);
                pokemonAlvoDoJogador.takeDamage(damageToPlayer);
                // Construir mensagem do ataque selvagem usando o nome do Pokémon alvo (que sabemos que existe)
                let wildActionMessage = `${this.wildPokemon.name} atacou ${pokemonAlvoDoJogador.name} causando ${damageToPlayer} de dano.${this.battleScreen.message}`;
                if (pokemonAlvoDoJogador.currentHp === 0) {
                    wildActionMessage += `\n${pokemonAlvoDoJogador.name} foi derrotado!`;
                    const nextPokemon = this.player.team.find(p => p.currentHp > 0);
                    if (nextPokemon) {
                        wildActionMessage += "\nEscolha o próximo Pokémon.";
                        // O BattleScreen precisa entrar no modo de seleção de Pokémon
                        this.battleScreen.updateBattleState(pokemonAlvoDoJogador, this.wildPokemon, playerActionMessage + "\n" + wildActionMessage);
                        this.battleScreen.render();
                        // Não chama endBattle, espera o jogador trocar.
                        // A BattleScreen deve ser atualizada para refletir a necessidade de troca.
                        // O fluxo de input do BattleScreen deve agora lidar com a seleção.
                        return; // Interrompe o fluxo normal aqui, pois o jogador precisa agir.
                    }
                    else {
                        wildActionMessage += "\nTodos os seus Pokémon foram derrotados!";
                        this.endBattle(false, false, false, playerActionMessage + "\n" + wildActionMessage);
                        return; // Batalha termina
                    }
                }
                // Atualiza a tela com a mensagem da ação do jogador E do inimigo
                this.battleScreen.updateBattleState(pokemonAlvoDoJogador, this.wildPokemon, playerActionMessage + "\n" + wildActionMessage);
                this.battleScreen.render();
            }, 1000);
        }
    }
    attemptCapture(initialMessage) {
        const catchRateBase = 255; // Exemplo de taxa de captura base
        const maxHp = this.wildPokemon.stats.maxHp;
        const currentHp = this.wildPokemon.currentHp;
        // Fórmula de exemplo para chance de captura (simplificada)
        let catchChance = ((3 * maxHp - 2 * currentHp) * catchRateBase) / (3 * maxHp);
        catchChance = Math.max(1, Math.min(catchChance / 255, 1)); // Normaliza para 0-1, mínimo de ~0.4%
        const randomRoll = Math.random();
        let captureMessage = "";
        if (randomRoll < catchChance) {
            captureMessage = `Gotcha! ${this.wildPokemon.name} foi capturado!`;
            if (this.player.addPokemonToTeam(this.wildPokemon)) {
                captureMessage += `\n${this.wildPokemon.name} foi adicionado à sua equipe.`;
            }
            else {
                captureMessage += `\nSua equipe está cheia. ${this.wildPokemon.name} foi enviado para o PC (não implementado).`;
            }
            this.database.savePlayerTeam(this.player.getTeamSaveData());
            this.endBattle(true, false, true, initialMessage + "\n" + captureMessage);
        }
        else {
            captureMessage = `Oh não! O ${this.wildPokemon.name} escapou da Pokebola!`;
            const fullMessage = initialMessage + "\n" + captureMessage;
            const pokemonAlvoDoJogadorAntesDoAtaque = this.player.getActivePokemon();
            if (!pokemonAlvoDoJogadorAntesDoAtaque) {
                this.endBattle(false, false, false, fullMessage + "\nSeu Pokémon não pôde continuar.");
                return;
            }
            this.battleScreen.updateBattleState(pokemonAlvoDoJogadorAntesDoAtaque, this.wildPokemon, fullMessage);
            this.battleScreen.render();
            // Turno do selvagem após falha na captura
            setTimeout(() => {
                this.battleScreen.message = ""; // Limpa para a mensagem de efetividade do inimigo
                const pokemonAlvoDoJogadorNoTurnoInimigo = this.player.getActivePokemon();
                if (!pokemonAlvoDoJogadorNoTurnoInimigo) { // Verificação de segurança
                    console.error("ERRO CRÍTICO: Pokémon do jogador indefinido antes do ataque selvagem pós-captura falha.");
                    this.endBattle(false, false, false, fullMessage + "\nOcorreu um erro e a batalha não pode continuar.");
                    return;
                }
                const damageToPlayer = this.calculateDamage(this.wildPokemon, pokemonAlvoDoJogadorNoTurnoInimigo);
                pokemonAlvoDoJogadorNoTurnoInimigo.takeDamage(damageToPlayer);
                let wildActionMessage = `${this.wildPokemon.name} atacou ${pokemonAlvoDoJogadorNoTurnoInimigo.name} causando ${damageToPlayer} de dano.${this.battleScreen.message}`;
                if (pokemonAlvoDoJogadorNoTurnoInimigo.currentHp === 0) {
                    wildActionMessage += `\n${pokemonAlvoDoJogadorNoTurnoInimigo.name} foi derrotado!`;
                    const nextPokemon = this.player.team.find(p => p.currentHp > 0);
                    if (nextPokemon) {
                        wildActionMessage += "\nEscolha o próximo Pokémon.";
                        this.battleScreen.updateBattleState(pokemonAlvoDoJogadorNoTurnoInimigo, this.wildPokemon, fullMessage + "\n" + wildActionMessage);
                        this.battleScreen.render();
                        return;
                    }
                    else {
                        wildActionMessage += "\nTodos os seus Pokémon foram derrotados!";
                        this.endBattle(false, false, false, fullMessage + "\n" + wildActionMessage);
                        return;
                    }
                }
                this.battleScreen.updateBattleState(pokemonAlvoDoJogadorNoTurnoInimigo, this.wildPokemon, fullMessage + "\n" + wildActionMessage);
                this.battleScreen.render();
            }, 1000);
        }
    }
    handleVictory(previousMessage = "") {
        const victor = this.player.getActivePokemon(); // Deve ser o Pokémon que acabou de lutar
        if (!victor) { // Segurança: se por algum motivo não houver Pokémon ativo
            console.error("Vitória processada sem Pokémon ativo do jogador.");
            this.endBattle(true, false, false, previousMessage + "\nVitória! Mas ocorreu um erro ao processar XP.");
            return;
        }
        const baseXP = 25; // Define um XP base
        const xpGained = baseXP + Math.floor(this.wildPokemon.stats.level * 10);
        const leveledUp = victor.gainXp(xpGained);
        let victoryMessage = `${victor.name} derrotou ${this.wildPokemon.name}!`;
        victoryMessage += `\n${victor.name} ganhou ${xpGained} XP.`;
        if (leveledUp) {
            victoryMessage += `\n${victor.name} subiu para o nível ${victor.stats.level}!`;
        }
        this.database.savePlayerTeam(this.player.getTeamSaveData()); // Salva o time com XP e possível level up
        this.endBattle(true, false, false, (previousMessage ? previousMessage + "\n" : "") + victoryMessage);
    }
    endBattle(isVictory, fled = false, captured = false, customMessage) {
        let finalMessage = customMessage || "A batalha terminou.";
        // Lógica para mensagens padrão se customMessage não for fornecido (embora geralmente seja)
        if (fled && !customMessage) {
            finalMessage = "Você fugiu da batalha.";
        }
        else if (captured && !customMessage) {
            // A mensagem de captura já é parte do customMessage em attemptCapture
        }
        else if (isVictory && !captured && !customMessage) {
            // A mensagem de vitória já é parte do customMessage em handleVictory
        }
        else if (!isVictory && !fled && !captured && !customMessage) {
            finalMessage = "Você foi derrotado...";
        }
        // Garante que há um Pokémon para exibir, mesmo que seja o primeiro da equipe (pode estar caído se for derrota total)
        const pokemonToDisplay = this.player.getActivePokemon() || this.player.team[0] || new Pokemon_1.default(0, "Fantasma", "", { attack: 0, defense: 0, hp: 0, maxHp: 0, speed: 0, type: PokemonType_1.PokemonType.NORMAL, level: 1, xp: 0, xpToNextLevel: 100 });
        this.battleScreen.updateBattleState(pokemonToDisplay, this.wildPokemon, finalMessage);
        this.battleScreen.render();
        setTimeout(() => {
            this.onBattleEnd(); // Chama o callback para retornar ao GameController
        }, 2500);
    }
}
exports.default = BattleController;
