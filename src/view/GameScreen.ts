import Screen from './Screen';
import GameController from '../controller/GameController';
import * as readline from 'readline'; // Para o bindInput

export default class GameScreen extends Screen {
  // GameController agora é público para ser acessado pelo index.ts para input
  public controller = new GameController('../assets/map/mapa1.txt', './db.json');

  public onEnter(): void {
    this.controller.startNew();
    // O GameController agora gerencia seu próprio estado de tela (mapa, inventário, batalha)
    // O input é vinculado uma vez quando esta tela é inserida.
    this.bindInput();
    this.render(); // Render inicial
  }

  public render(): void {
    this.controller.render();
  }

  public handleInput(cmd: string): Screen | null {
    this.controller.handleInput(cmd);
    // O GameController agora decide se a tela muda (para batalha, inventário, ou se a batalha termina)
    // Se o controller definir que uma nova "Screen" principal deve ser mostrada (ex: voltar ao menu),
    // ele deveria ter um mecanismo para sinalizar isso, mas por agora, GameScreen sempre retorna 'this'
    // ou null se o controller indicar que a tela deve ser fechada (não é o caso aqui geralmente).
    return this; // Permanece no "jogo" (que pode ser mapa, inventário ou batalha)
  }

  // Método para vincular o input diretamente ao GameController
  private bindInput(): void {
    // Remove listeners antigos para evitar duplicação se onEnter for chamado múltiplas vezes
    process.stdin.removeAllListeners('keypress');

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    process.stdin.on('keypress', (_str, key) => {
      if (key.ctrl && key.name === 'c') {
        // Restaurar o modo do terminal antes de sair
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.exit();
      }
      // Delega o input diretamente para o GameController
      this.controller.handleInput(key.name as string);
      this.render(); // O controller já renderiza internamente, mas para garantir a atualização da tela principal.
                     // Idealmente, o controller renderizaria ou pediria à tela atual para renderizar.
    });
  }
}