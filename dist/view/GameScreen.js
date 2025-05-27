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
const Screen_1 = __importDefault(require("./Screen"));
const GameController_1 = __importDefault(require("../controller/GameController"));
const readline = __importStar(require("readline")); // Para o bindInput
class GameScreen extends Screen_1.default {
    constructor() {
        super(...arguments);
        // GameController agora é público para ser acessado pelo index.ts para input
        this.controller = new GameController_1.default('../assets/map/mapa1.txt', './db.json');
    }
    onEnter() {
        this.controller.startNew();
        // O GameController agora gerencia seu próprio estado de tela (mapa, inventário, batalha)
        // O input é vinculado uma vez quando esta tela é inserida.
        this.bindInput();
        this.render(); // Render inicial
    }
    render() {
        this.controller.render();
    }
    handleInput(cmd) {
        this.controller.handleInput(cmd);
        // O GameController agora decide se a tela muda (para batalha, inventário, ou se a batalha termina)
        // Se o controller definir que uma nova "Screen" principal deve ser mostrada (ex: voltar ao menu),
        // ele deveria ter um mecanismo para sinalizar isso, mas por agora, GameScreen sempre retorna 'this'
        // ou null se o controller indicar que a tela deve ser fechada (não é o caso aqui geralmente).
        return this; // Permanece no "jogo" (que pode ser mapa, inventário ou batalha)
    }
    // Método para vincular o input diretamente ao GameController
    bindInput() {
        // Remove listeners antigos para evitar duplicação se onEnter for chamado múltiplas vezes
        process.stdin.removeAllListeners('keypress');
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY)
            process.stdin.setRawMode(true);
        process.stdin.on('keypress', (_str, key) => {
            if (key.ctrl && key.name === 'c') {
                // Restaurar o modo do terminal antes de sair
                if (process.stdin.isTTY)
                    process.stdin.setRawMode(false);
                process.exit();
            }
            // Delega o input diretamente para o GameController
            this.controller.handleInput(key.name);
            this.render(); // O controller já renderiza internamente, mas para garantir a atualização da tela principal.
            // Idealmente, o controller renderizaria ou pediria à tela atual para renderizar.
        });
    }
}
exports.default = GameScreen;
