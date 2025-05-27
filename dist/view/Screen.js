"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Screen {
    render() {
        console.log("O método render() não foi sobrescrito na classe derivada.");
    }
    handleInput(cmd) {
        console.log(`O método handleInput() não foi sobrescrito para tratar o comando: ${cmd}`);
        return this;
    }
}
exports.default = Screen;
