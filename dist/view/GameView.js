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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const kleur_1 = __importDefault(require("kleur"));
// Assuming GameController might be needed for messages, or messages are handled by GameController.render
// import GameController from '../controller/GameController'; 
class GameView {
    // constructor(private map: Map, private player: Player, private controller: GameController) {} // If GameController ref is needed
    constructor(map, player) {
        this.map = map;
        this.player = player;
    }
    render() {
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
                    line += kleur_1.default.green('@');
                }
                else if (cell === '"') {
                    line += kleur_1.default.green('"');
                }
                else if (cell === 'o') { // New: Render 'o' in yellow
                    line += kleur_1.default.yellow('o');
                }
                else {
                    line += cell;
                }
            }
            console.log(line);
        }
        // Message display is handled by GameController.render()
    }
    bindInput(onCommand) {
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY)
            process.stdin.setRawMode(true);
        process.stdin.on('keypress', (_str, key) => {
            if (key.ctrl && key.name === 'c')
                process.exit();
            onCommand(key.name);
        });
    }
}
exports.default = GameView;
