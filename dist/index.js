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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const MainScreen_1 = __importDefault(require("./view/MainScreen"));
let currentScreen = new MainScreen_1.default();
(_a = currentScreen.onEnter) === null || _a === void 0 ? void 0 : _a.call(currentScreen);
currentScreen.render();
const mainMenuKeypressListener = (_str, key) => {
    var _a;
    if (key.ctrl && key.name === 'c') {
        if (process.stdin.isTTY)
            process.stdin.setRawMode(false);
        process.exit();
    }
    // Só processa input se a tela atual for o MainMenu ou uma que não tem seu próprio listener de keypress dedicado
    if (currentScreen instanceof MainScreen_1.default) {
        const next = currentScreen.handleInput(key.name);
        if (next && next !== currentScreen) {
            currentScreen = next;
            (_a = currentScreen.onEnter) === null || _a === void 0 ? void 0 : _a.call(currentScreen);
        }
    }
    // Se a tela atual não for MainMenu, seu próprio handler (bindInput) já está ativo.
    // A renderização também é responsabilidade da tela ativa.
    currentScreen.render();
};
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY)
    process.stdin.setRawMode(true);
process.stdin.on('keypress', mainMenuKeypressListener);
// Lógica para restaurar o listener do menu principal se voltarmos a ele
// (não totalmente implementado aqui, pois a navegação de volta ao menu não está completa)
