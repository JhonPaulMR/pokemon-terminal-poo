export enum PokemonType {
  NORMAL = 'Normal',
  FIRE = 'Fire',
  WATER = 'Water',
  GRASS = 'Grass',
  ELECTRIC = 'Electric',
  ROCK = 'Rock',
}

export const TypeChart: { [key in PokemonType]?: { strongAgainst: PokemonType[], weakAgainst: PokemonType[] } } = {
  [PokemonType.FIRE]: { strongAgainst: [PokemonType.GRASS], weakAgainst: [PokemonType.WATER, PokemonType.ROCK] },
  [PokemonType.WATER]: { strongAgainst: [PokemonType.FIRE, PokemonType.ROCK], weakAgainst: [PokemonType.GRASS, PokemonType.ELECTRIC] },
  [PokemonType.GRASS]: { strongAgainst: [PokemonType.WATER, PokemonType.ROCK], weakAgainst: [PokemonType.FIRE] },
  [PokemonType.ELECTRIC]: { strongAgainst: [PokemonType.WATER], weakAgainst: [PokemonType.GRASS, PokemonType.ROCK] },
  [PokemonType.ROCK]: { strongAgainst: [PokemonType.FIRE, PokemonType.ELECTRIC], weakAgainst: [PokemonType.WATER, PokemonType.GRASS] },
  [PokemonType.NORMAL]: { strongAgainst: [], weakAgainst: [] }, // Normal não tem vantagens ou desvantagens diretas aqui
};