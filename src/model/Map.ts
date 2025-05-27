import * as fs from "fs";
import * as path from "path";

export default class Map {
  private grid: string[][] = [];
  constructor(private filename: string) {}

  load(): void {
    let fullPath = this.filename;
    if (!path.isAbsolute(fullPath)) {
      fullPath = path.resolve(__dirname, this.filename);
    }

    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      this.grid = content.split("\n").map((line) => line.split(""));
    } catch (error) {
      console.error(`Erro ao carregar o mapa de ${fullPath}:`, error);
      // Lança um erro ou define um mapa padrão para evitar falhas catastróficas
      throw new Error(`Falha ao carregar o mapa: ${this.filename}`);
    }
  }

  getCell(x: number, y: number): string {
    if (y < 0 || y >= this.grid.length || !this.grid[y]) return "#"; // Adicionada verificação para this.grid[y]
    if (x < 0 || x >= this.grid[y].length) return "#";
    return this.grid[y][x];
  }

  /**
   * Define o caractere de uma célula específica no mapa.
   * Usado para alterar o mapa dinamicamente (ex: remover um item interativo).
   * @param x Coordenada X da célula.
   * @param y Coordenada Y da célula.
   * @param char Novo caractere para a célula.
   */
  setCell(x: number, y: number, char: string): void {
    if (
      y >= 0 &&
      y < this.grid.length &&
      this.grid[y] &&
      x >= 0 &&
      x < this.grid[y].length
    ) {
      this.grid[y][x] = char;
    } else {
      console.warn(
        `Tentativa de definir célula fora dos limites: (${x}, ${y})`
      );
    }
  }

  get width(): number {
    return this.grid[0]?.length || 0;
  }

  get height(): number {
    return this.grid.length;
  }
}
