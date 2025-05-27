import Screen from './Screen';
import GameScreen from './GameScreen';
import ContinueScreen from './ContinueScreen';
import kleur from 'kleur';

export default class MainMenuScreen extends Screen {
  private options = [kleur.yellow('Continue'), kleur.yellow('New Game'), kleur.yellow('Exit')];
  private selected = 0;

  public render(): void {
    console.clear();
    console.log(kleur.yellow('=== Monters RPG ===\n'));
    this.options.forEach((opt, i) => {
      console.log(
        (i === this.selected ? '› ' : '  ') + opt
      );
    });
  }

  public handleInput(cmd: string): Screen | null {
    if (cmd === 'up' && this.selected > 0) this.selected--;
    if (cmd === 'down' && this.selected < this.options.length - 1) this.selected++;
    if (cmd === 'return') {
      switch (this.options[this.selected]) {
        case kleur.yellow('Continue'):  return new ContinueScreen();
        case kleur.yellow('New Game'):  return new GameScreen();      // inicia jogo do zero
        case kleur.yellow('Exit'):      process.exit(0);
      }
    }
    return this;  // permanece nesta tela
  }
}
