import * as readline from 'readline';
import Screen from './view/Screen';
import MainMenuScreen from './view/MainScreen';
import GameScreen from './view/GameScreen';
import ContinueScreen from './view/ContinueScreen';

let currentScreen: Screen = new MainMenuScreen();
currentScreen.onEnter?.();
currentScreen.render();

const mainMenuKeypressListener = (_str: string | undefined, key: { name: string, ctrl?: boolean }) => {
  if (key.ctrl && key.name === 'c') {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.exit();
  }

  // Só processa input se a tela atual for o MainMenu ou uma que não tem seu próprio listener de keypress dedicado
  if (currentScreen instanceof MainMenuScreen) {
      const next = currentScreen.handleInput(key.name!);
      if (next && next !== currentScreen) {
        currentScreen = next;
        currentScreen.onEnter?.(); 
      }
  }
  // Se a tela atual não for MainMenu, seu próprio handler (bindInput) já está ativo.
  // A renderização também é responsabilidade da tela ativa.
  currentScreen.render();
};


readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.on('keypress', mainMenuKeypressListener);

// Lógica para restaurar o listener do menu principal se voltarmos a ele
// (não totalmente implementado aqui, pois a navegação de volta ao menu não está completa)