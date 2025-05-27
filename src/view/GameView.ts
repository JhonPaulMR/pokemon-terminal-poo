import * as readline from 'readline';
import kleur from 'kleur';
import Map from '../model/Map';
import Player from '../model/Player';
// Assuming GameController might be needed for messages, or messages are handled by GameController.render
// import GameController from '../controller/GameController'; 

export default class GameView {
  // constructor(private map: Map, private player: Player, private controller: GameController) {} // If GameController ref is needed
  constructor(private map: Map, private player: Player) {}


  render(): void {
    console.clear();

    const termWidth = process.stdout.columns || this.map.width;
    const termHeight = (process.stdout.rows || this.map.height) - 1; // -1 for potential message line
    const px = this.player.x;
    const py = this.player.y;

    const halfW = Math.floor(termWidth / 2);
    const halfH = Math.floor(termHeight / 2);

    let startX = this.player.x - halfW;
    let startY = this.player.y - halfH;

    startX = Math.max(0, Math.min(startX, this.map.width - termWidth));
    startY = Math.max(0, Math.min(startY, this.map.height - termHeight));

    for (let y = startY; y < startY + termHeight; y++) {
      let line = '';
      for (let x = startX; x < startX + termWidth; x++) {
        const cell = this.map.getCell(x, y);
        if (x === this.player.x && y === this.player.y) {
          line += kleur.green('@');
        } else if (cell === '"') {
          line += kleur.green('"');
        } else if (cell === 'o') { // New: Render 'o' in yellow
          line += kleur.yellow('o');
        } else {
          line += cell;
        }
      }
      console.log(line);
    }
    // Message display is handled by GameController.render()
  }

  bindInput(onCommand: (cmd: string) => void) {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.on('keypress', (_str, key) => {
      if (key.ctrl && key.name === 'c') process.exit();
      onCommand(key.name as string);
    });
  }
}