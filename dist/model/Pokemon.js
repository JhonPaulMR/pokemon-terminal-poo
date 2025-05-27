"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Função auxiliar para calcular a experiência total necessária para um determinado nível
// na curva Médio-Rápido, conforme interpretação da tabela da Bulbapedia.
function getTotalXpForMediumFast(level) {
    if (level <= 1)
        return 0; // XP total para alcançar o nível 1 é 0 (começa no nível 1 com 0 XP total)
    return Math.pow(level, 3); // XP total para alcançar níveis > 1 é L^3
}
class Pokemon {
    constructor(id, name, asciiArt, stats) {
        this.id = id;
        this.name = name;
        this.asciiArt = asciiArt;
        this.stats = Object.assign({}, stats); // Clonar para evitar modificação do objeto de stats original
        // Se 'stats.hp' recebido é o HP base para o nível 1, e 'stats.maxHp' não está ajustado para o nível atual:
        // A lógica de cálculo de maxHp e hp inicial baseado no nível deve ocorrer aqui ou em createInstanceWithLevel.
        // Por agora, assume-se que 'stats.maxHp' e 'stats.hp' (para currentHp) já estão corretos para 'stats.level'.
        this.currentHp = this.stats.hp; // Idealmente, this.currentHp = this.stats.maxHp se o Pokémon começa com vida cheia.
        // Define xpToNextLevel de acordo com a curva Médio-Rápido para o nível atual
        this.stats.xpToNextLevel = getTotalXpForMediumFast(this.stats.level + 1) - getTotalXpForMediumFast(this.stats.level);
        // Garante que o XP atual não exceda o necessário para o próximo nível (importante se stats.xp for > 0 na criação)
        if (this.stats.xp >= this.stats.xpToNextLevel && this.stats.xpToNextLevel > 0) {
            // Se o XP passado já for suficiente para subir de nível, chama levelUp.
            // Isso pode acontecer se um Pokémon for criado com XP acumulado.
            // No entanto, geralmente, um Pokémon recém-criado ou que acabou de subir de nível teria this.stats.xp = 0.
            // Para evitar chamadas recursivas no construtor, essa lógica é mais segura em gainXp.
            // Se for uma criação inicial, o XP geralmente deve ser 0.
        }
    }
    takeDamage(damage) {
        this.currentHp -= damage;
        if (this.currentHp < 0) {
            this.currentHp = 0;
        }
    }
    heal(amount) {
        this.currentHp += amount;
        if (this.currentHp > this.stats.maxHp) {
            this.currentHp = this.stats.maxHp;
        }
    }
    gainXp(amount) {
        if (amount <= 0)
            return false; // Não processa XP negativo ou zero
        this.stats.xp += amount;
        let leveledUpThisCall = false;
        // Loop para lidar com múltiplos level ups com uma única concessão de XP
        while (this.stats.xp >= this.stats.xpToNextLevel && this.stats.xpToNextLevel > 0) {
            // (this.stats.xpToNextLevel > 0 evita loop infinito se xpToNextLevel for 0 ou negativo)
            this.levelUp();
            leveledUpThisCall = true;
        }
        return leveledUpThisCall;
    }
    levelUp() {
        this.stats.level++;
        // Subtrai o XP necessário para o nível anterior, carregando o excesso para o novo nível
        this.stats.xp -= this.stats.xpToNextLevel;
        // Se o xp restante for negativo (acontece se xpToNextLevel for maior que o xp atual antes do level up, o que não deveria ocorrer com a lógica de while), zera.
        if (this.stats.xp < 0)
            this.stats.xp = 0;
        // Atualiza xpToNextLevel para o novo nível usando a curva Médio-Rápido
        this.stats.xpToNextLevel = getTotalXpForMediumFast(this.stats.level + 1) - getTotalXpForMediumFast(this.stats.level);
        if (this.stats.xpToNextLevel <= 0 && this.stats.level < 100) { // Nível máximo pode ser 100
            console.warn(`xpToNextLevel calculado como ${this.stats.xpToNextLevel} para o nível ${this.stats.level}. Verifique a fórmula.`);
            // Define um fallback para evitar divisão por zero ou loops, se necessário.
            // Para o nível 100, xpToNextLevel pode ser 0 ou um valor muito alto, indicando que não há mais níveis.
            if (this.stats.level >= 100) { // Exemplo de nível máximo
                this.stats.xpToNextLevel = Infinity; // Ou 0, e xp não aumenta mais.
                this.stats.xp = 0; // Zera o XP no nível máximo.
            }
        }
        // Aumentar status (exemplo simples - mantenha ou ajuste conforme sua lógica de jogo)
        // Esta é uma progressão linear simples, você pode querer torná-la dependente do Pokémon base.
        this.stats.maxHp += 5;
        this.stats.attack += 2;
        this.stats.defense += 2;
        this.stats.speed += 1;
        this.currentHp = this.stats.maxHp; // Curar completamente ao subir de nível
        console.log(`${this.name} subiu para o nível ${this.stats.level}!`);
    }
    // Método para criar uma instância com stats variáveis (nível)
    static createInstanceWithLevel(basePokemonDef, targetLevel) {
        // Cria um Pokémon no nível 1 com os stats base e XP inicial correto para a curva.
        const initialStatsForLevel1 = Object.assign(Object.assign({}, basePokemonDef.stats), { level: 1, xp: 0, 
            // Define xpToNextLevel para ir do nível 1 para o 2
            xpToNextLevel: getTotalXpForMediumFast(1 + 1) - getTotalXpForMediumFast(1) // = 8
         });
        // Ajusta maxHp e hp inicial para o nível 1 se basePokemonDef.stats.hp/maxHp forem para um nível diferente ou forem apenas bases
        // Exemplo: initialStatsForLevel1.maxHp = basePokemonDef.stats.hp; (se .hp for o base HP)
        // initialStatsForLevel1.hp = initialStatsForLevel1.maxHp;
        const newPokemonInstance = new Pokemon(basePokemonDef.id, basePokemonDef.name, basePokemonDef.asciiArt, initialStatsForLevel1);
        // Simular subidas de nível para ajustar os stats até o 'targetLevel' desejado
        if (targetLevel > 1) {
            // Precisamos simular o ganho de XP para cada nível até atingir o targetLevel.
            // A forma mais robusta é setar o nível e recalcular os stats e xpToNextLevel,
            // ou chamar levelUp() repetidamente.
            for (let currentSimulatedLevel = 1; currentSimulatedLevel < targetLevel; currentSimulatedLevel++) {
                // Aumentos de status que ocorreriam em levelUp()
                newPokemonInstance.stats.maxHp += 5; // Estes devem corresponder aos aumentos em levelUp()
                newPokemonInstance.stats.attack += 2;
                newPokemonInstance.stats.defense += 2;
                newPokemonInstance.stats.speed += 1;
                newPokemonInstance.stats.level++; // Incrementa o nível manualmente na simulação
            }
            // Após o loop, o nível está correto. Ajusta xpToNextLevel para o targetLevel final.
            newPokemonInstance.stats.xpToNextLevel = getTotalXpForMediumFast(newPokemonInstance.stats.level + 1) - getTotalXpForMediumFast(newPokemonInstance.stats.level);
            newPokemonInstance.stats.xp = 0; // XP é zerado para o novo nível
        }
        newPokemonInstance.currentHp = newPokemonInstance.stats.maxHp; // Garante HP cheio no final
        return newPokemonInstance;
    }
}
exports.default = Pokemon;
