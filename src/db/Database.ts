import * as fs from "fs";
import * as path from "path";
import { Item, ItemType } from "../model/Item";
import Pokemon, { PokemonStats } from "../model/Pokemon";
import { PokemonType } from "../enum/PokemonType";
import PlayerModel from "../model/Player";

// Definindo a estrutura dos dados de um Pokémon no "banco de dados"
export interface PokemonDefinition {
  id: number;
  name: string;
  asciiArt: string;
  stats: Omit<
    PokemonStats,
    "hp" | "maxHp" | "level" | "xp" | "xpToNextLevel"
  > & { baseHp: number; baseLevel?: number }; // Base stats
}

// Dados do Pokémon do jogador que são salvos
export interface PokemonData {
  id: number; // Para referenciar a PokemonDefinition
  level: number;
  xp: number;
  currentHp: number;
}

interface SaveData {
  playerPosition: { x: number; y: number };
  playerInventory: { [key: string]: number };
  playerTeam: PokemonData[];
  // Adicionar outros dados do jogo a serem salvos, como monstros no PC, etc.
}

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

export default class Database {
  private filePath: string;
  private data: SaveData;
  private allPokemonDefinitions: PokemonDefinition[]; // Todos os pokemons base

  constructor(filename: string = "db.json") {
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
          type: PokemonType.ELECTRIC,
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
          type: PokemonType.FIRE,
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
          type: PokemonType.WATER,
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
          type: PokemonType.GRASS,
          baseLevel: 5,
        },
      },
      // Adicionar mais pokemons aqui
    ];
    this.data = this.load();
  }

  private load(): SaveData {
    const defaultData: SaveData = {
      playerPosition: { x: 14, y: 6 }, // Posição inicial padrão
      playerInventory: { [ItemType.POKEBALL]: 5, [ItemType.POTION]: 3 },
      playerTeam: [
        {
          id: 1,
          level: 5,
          xp: 0,
          currentHp:
            this.getPokemonDefinitionById(1)!.stats.baseHp + (5 - 1) * 5,
        },
      ], // Pikachu inicial
    };

    if (fs.existsSync(this.filePath)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
        // Merge para garantir que todos os campos existam, mesmo que o save antigo não os tenha
        return { ...defaultData, ...fileData };
      } catch (error) {
        console.error(
          "Erro ao carregar o banco de dados, usando dados padrão:",
          error
        );
        return defaultData;
      }
    } else {
      this.persist(defaultData); // Cria o arquivo com dados padrão se não existir
      return defaultData;
    }
  }

  private persist(dataToSave?: SaveData): void {
    fs.writeFileSync(
      this.filePath,
      JSON.stringify(dataToSave || this.data, null, 2)
    );
  }

  public getPokemonDefinitionById(id: number): PokemonDefinition | undefined {
    return this.allPokemonDefinitions.find((p) => p.id === id);
  }

  public getAllPokemonDefinitions(): PokemonDefinition[] {
    return [...this.allPokemonDefinitions];
  }

  // Método para instanciar um Pokémon a partir da definição e nível
  public instantiatePokemon(id: number, level: number): Pokemon | null {
    const definition = this.getPokemonDefinitionById(id);
    if (!definition) return null;

    const stats: PokemonStats = {
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

    const newPokemon = new Pokemon(
      definition.id,
      definition.name,
      definition.asciiArt,
      stats
    );
    // Simular level ups até o nível desejado para ajustar os stats
    for (let i = 1; i < level; i++) {
      newPokemon.stats.level++;
      newPokemon.stats.maxHp += 5; // Exemplo de aumento
      newPokemon.stats.hp = newPokemon.stats.maxHp;
      newPokemon.stats.attack += 2;
      newPokemon.stats.defense += 2;
      newPokemon.stats.speed += 1;
      newPokemon.stats.xpToNextLevel = Math.floor(
        newPokemon.stats.xpToNextLevel * 1.5
      );
    }
    newPokemon.currentHp = newPokemon.stats.maxHp; // Garante HP cheio

    return newPokemon;
  }

  getPlayerPosition(): { x: number; y: number } {
    return { ...this.data.playerPosition };
  }

  savePlayerPosition(x: number, y: number): void {
    this.data.playerPosition = { x, y };
    this.persist();
  }

  getPlayerInventory(): { [key: string]: number } {
    return { ...this.data.playerInventory };
  }

  savePlayerInventory(inventoryData: { [key: string]: number }): void {
    this.data.playerInventory = inventoryData;
    this.persist();
  }

  getPlayerTeamData(): PokemonData[] {
    return JSON.parse(JSON.stringify(this.data.playerTeam)); // Retorna uma cópia profunda
  }

  savePlayerTeam(teamData: PokemonData[]): void {
    this.data.playerTeam = teamData;
    this.persist();
  }

  // Método para salvar todos os dados do jogo de uma vez
  saveGameData(player: PlayerModel): void {
    this.data.playerPosition = { x: player.x, y: player.y };
    this.data.playerInventory = player.inventory.toSaveData();
    this.data.playerTeam = player.getTeamSaveData();
    this.persist();
  }
}
