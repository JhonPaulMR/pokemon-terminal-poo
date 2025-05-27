import Screen from './Screen';
import GameController from '../controller/GameController';
import * as readline from 'readline';

export default class ContinueScreen extends Screen {
  public controller = new GameController('../assets/map/mapa1.txt', './db.json');

  public onEnter(): void {
    this.controller.startContinue();
    this.bindInput();
    this.render();
  }

  public render(): void {
    this.controller.render();
  }

  public handleInput(cmd: string): Screen | null {
    this.controller.handleInput(cmd);
    return this;
  }

  private bindInput(): void {
    process.stdin.removeAllListeners('keypress');
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    process.stdin.on('keypress', (_str, key) => {
      if (key.ctrl && key.name === 'c') {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.exit();
      }
      this.controller.handleInput(key.name as string);
      this.render(); // Controller cuida do render interno
    });
  }
}