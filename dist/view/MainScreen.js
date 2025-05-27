"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Screen_1 = __importDefault(require("./Screen"));
const GameScreen_1 = __importDefault(require("./GameScreen"));
const ContinueScreen_1 = __importDefault(require("./ContinueScreen"));
const kleur_1 = __importDefault(require("kleur"));
class MainMenuScreen extends Screen_1.default {
    constructor() {
        super(...arguments);
        this.options = [kleur_1.default.yellow('Continue'), kleur_1.default.yellow('New Game'), kleur_1.default.yellow('Exit')];
        this.selected = 0;
    }
    render() {
        console.clear();
        console.log(kleur_1.default.yellow('=== Monters RPG ===\n'));
        this.options.forEach((opt, i) => {
            console.log((i === this.selected ? '› ' : '  ') + opt);
        });
    }
    handleInput(cmd) {
        if (cmd === 'up' && this.selected > 0)
            this.selected--;
        if (cmd === 'down' && this.selected < this.options.length - 1)
            this.selected++;
        if (cmd === 'return') {
            switch (this.options[this.selected]) {
                case kleur_1.default.yellow('Continue'): return new ContinueScreen_1.default();
                case kleur_1.default.yellow('New Game'): return new GameScreen_1.default(); // inicia jogo do zero
                case kleur_1.default.yellow('Exit'): process.exit(0);
            }
        }
        return this; // permanece nesta tela
    }
}
exports.default = MainMenuScreen;
