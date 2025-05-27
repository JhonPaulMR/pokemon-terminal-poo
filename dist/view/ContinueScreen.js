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
const readline = __importStar(require("readline"));
class ContinueScreen extends Screen_1.default {
    constructor() {
        super(...arguments);
        this.controller = new GameController_1.default('../assets/map/mapa1.txt', './db.json');
    }
    onEnter() {
        this.controller.startContinue();
        this.bindInput();
        this.render();
    }
    render() {
        this.controller.render();
    }
    handleInput(cmd) {
        this.controller.handleInput(cmd);
        return this;
    }
    bindInput() {
        process.stdin.removeAllListeners('keypress');
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY)
            process.stdin.setRawMode(true);
        process.stdin.on('keypress', (_str, key) => {
            if (key.ctrl && key.name === 'c') {
                if (process.stdin.isTTY)
                    process.stdin.setRawMode(false);
                process.exit();
            }
            this.controller.handleInput(key.name);
            this.render(); // Controller cuida do render interno
        });
    }
}
exports.default = ContinueScreen;
