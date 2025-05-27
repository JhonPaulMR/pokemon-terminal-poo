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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Map {
    constructor(filename) {
        this.filename = filename;
        this.grid = [];
    }
    load() {
        let fullPath = this.filename;
        if (!path.isAbsolute(fullPath)) {
            fullPath = path.resolve(__dirname, this.filename);
        }
        try {
            const content = fs.readFileSync(fullPath, "utf-8");
            this.grid = content.split("\n").map((line) => line.split(""));
        }
        catch (error) {
            console.error(`Erro ao carregar o mapa de ${fullPath}:`, error);
            // Lança um erro ou define um mapa padrão para evitar falhas catastróficas
            throw new Error(`Falha ao carregar o mapa: ${this.filename}`);
        }
    }
    getCell(x, y) {
        if (y < 0 || y >= this.grid.length || !this.grid[y])
            return "#"; // Adicionada verificação para this.grid[y]
        if (x < 0 || x >= this.grid[y].length)
            return "#";
        return this.grid[y][x];
    }
    /**
     * Define o caractere de uma célula específica no mapa.
     * Usado para alterar o mapa dinamicamente (ex: remover um item interativo).
     * @param x Coordenada X da célula.
     * @param y Coordenada Y da célula.
     * @param char Novo caractere para a célula.
     */
    setCell(x, y, char) {
        if (y >= 0 &&
            y < this.grid.length &&
            this.grid[y] &&
            x >= 0 &&
            x < this.grid[y].length) {
            this.grid[y][x] = char;
        }
        else {
            console.warn(`Tentativa de definir célula fora dos limites: (${x}, ${y})`);
        }
    }
    get width() {
        var _a;
        return ((_a = this.grid[0]) === null || _a === void 0 ? void 0 : _a.length) || 0;
    }
    get height() {
        return this.grid.length;
    }
}
exports.default = Map;
