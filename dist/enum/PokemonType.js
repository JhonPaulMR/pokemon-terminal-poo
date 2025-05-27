"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeChart = exports.PokemonType = void 0;
var PokemonType;
(function (PokemonType) {
    PokemonType["NORMAL"] = "Normal";
    PokemonType["FIRE"] = "Fire";
    PokemonType["WATER"] = "Water";
    PokemonType["GRASS"] = "Grass";
    PokemonType["ELECTRIC"] = "Electric";
    PokemonType["ROCK"] = "Rock";
})(PokemonType || (exports.PokemonType = PokemonType = {}));
exports.TypeChart = {
    [PokemonType.FIRE]: { strongAgainst: [PokemonType.GRASS], weakAgainst: [PokemonType.WATER, PokemonType.ROCK] },
    [PokemonType.WATER]: { strongAgainst: [PokemonType.FIRE, PokemonType.ROCK], weakAgainst: [PokemonType.GRASS, PokemonType.ELECTRIC] },
    [PokemonType.GRASS]: { strongAgainst: [PokemonType.WATER, PokemonType.ROCK], weakAgainst: [PokemonType.FIRE] },
    [PokemonType.ELECTRIC]: { strongAgainst: [PokemonType.WATER], weakAgainst: [PokemonType.GRASS, PokemonType.ROCK] },
    [PokemonType.ROCK]: { strongAgainst: [PokemonType.FIRE, PokemonType.ELECTRIC], weakAgainst: [PokemonType.WATER, PokemonType.GRASS] },
    [PokemonType.NORMAL]: { strongAgainst: [], weakAgainst: [] }, // Normal não tem vantagens ou desvantagens diretas aqui
};
