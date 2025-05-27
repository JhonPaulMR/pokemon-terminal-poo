# Monsters RPG - Um Jogo em Terminal Baseado em Pokemon

Bem-vindo ao Monsters RPG! Um jogo de aventura baseado em texto onde você explora um mundo, captura e treina monstros, e enfrenta desafios. Este projeto foi desenvolvido em TypeScript, aplicando conceitos de Programação Orientada a Objetos (POO) e o padrão de arquitetura MVC (Model-View-Controller).

## Funcionalidades

* **Exploração do Mapa**: Navegue por um mapa baseado em texto usando as teclas direcionais.
* **Encontros Aleatórios**: Encontre monstros selvagens na grama alta (representada por `"`).
* **Sistema de Batalha**: Batalhas baseadas em turnos onde você pode:
    * Atacar.
    * Usar itens (Poções para curar, Pokebolas para capturar).
    * Trocar seu Pokémon ativo.
    * Tentar fugir da batalha.
* **Captura de Monstros**: Use Pokebolas para tentar capturar monstros selvagens e adicioná-los à sua equipe.
* **Sistema de Nível e XP**: Seus monstros ganham experiência (XP) após vencer batalhas e podem subir de nível, melhorando seus atributos.
* **Inventário**: Gerencie seus itens, como Poções e Pokebolas.
* **Equipe de Monstros**: Monte uma equipe de até 6 monstros.
* **Persistência de Dados**: O progresso do jogo (posição do jogador, inventário, equipe) é salvo em um arquivo `db.json`, permitindo continuar o jogo de onde parou.
* **Objetos Interativos**: Encontre objetos no mapa (representados por `o`) que, ao interagir (tecla 'e' ou 'Enter'), podem dar itens ao jogador e depois desaparecem.

## Conceitos de POO e Design Aplicados

* **Modelo MVC (Model-View-Controller)**:
    * **Model**: Classes como `Player`, `Pokemon`, `Map`, `Inventory`, `Item` e `Database` representam os dados e a lógica de negócios do jogo.
    * **View**: Classes como `GameView`, `BattleScreen`, `InventoryScreen`, `MainScreen` são responsáveis por apresentar as informações ao usuário.
    * **Controller**: Classes como `GameController` e `BattleController` gerenciam a entrada do usuário, atualizam o modelo e selecionam a visualização apropriada.
* **Classes e Objetos**: O jogo é construído em torno de classes que definem os diferentes componentes (Jogador, Monstro, Mapa, etc.) e seus objetos instanciados.
* **Encapsulamento**: Dados internos das classes são protegidos (privados) e acessados/modificados através de métodos públicos.
* **Herança e Polimorfismo**: A classe `Screen` atua como uma classe base para todas as telas do jogo (`MainMenuScreen`, `GameScreen`, `BattleScreen`, etc.), permitindo que o `GameController` trate diferentes telas de forma polimórfica através de uma interface comum (`render`, `handleInput`).
* **Abstração**: O jogador interage com o jogo através de comandos simples, e a complexidade interna da lógica de jogo, batalhas, e gerenciamento de dados é abstraída.
* **Enumerações**: `PokemonType`, `BattleAction`, e `ItemType` são usados para criar conjuntos de constantes nomeadas, melhorando a legibilidade e segurança do código.
* **Interfaces (e Tipos Estruturais)**: Interfaces como `PokemonDefinition`, `PokemonData`, `BushEncounter`, e `Item` definem contratos para a estrutura de objetos de dados.

## Como Rodar o Projeto

1.  **Pré-requisitos**:
    * Node.js (versão recomendada no `package.json` ou mais recente)
    * NPM (geralmente vem com o Node.js)

2.  **Instalação**:
    * Clone o repositório:
        ```bash
        git clone <URL_DO_REPOSITORIO>
        cd <NOME_DA_PASTA_DO_PROJETO>
        ```
    * Instale as dependências:
        ```bash
        npm install
        ```

3.  **Compilação (TypeScript para JavaScript)**:
    * Compile o código TypeScript:
        ```bash
        npm run tsc  # (Se você adicionar um script "tsc": "tsc" em package.json)
        # ou diretamente
        npx tsc
        ```
    Isso irá gerar os arquivos JavaScript na pasta `dist`.

4.  **Execução**:
    * Rode o jogo a partir da pasta raiz do projeto:
        ```bash
        node dist/index.js
        ```

## Controles do Jogo

* **Navegação no Mapa**: Teclas direcionais (Cima, Baixo, Esquerda, Direita)
* **Inventário**: Tecla `i`
* **Interagir com Objetos Adjacentes**: Tecla `e` ou `Enter`
* **Menus de Seleção**: Teclas direcionais (Cima, Baixo) para selecionar e `Enter` para confirmar.
* **Sair do Jogo**: `Ctrl + C`

## Estrutura do Projeto (Simplificada)

/
├── src/                # Código fonte TypeScript
│   ├── controller/     # Controladores (GameController, BattleController)
│   ├── db/           # Lógica de banco de dados (Database.ts, db.json)
│   ├── enum/         # Enumerações (PokemonType, BattleAction, ItemType)
│   ├── model/        # Modelos de dados (Player, Pokemon, Map, Item, Inventory)
│   ├── view/         # Telas e visualizações (GameView, BattleScreen, etc.)
│   ├── tests/        # Testes unitários (opcional, mas recomendado)
│   └── index.ts      # Ponto de entrada da aplicação
├── dist/               # Código JavaScript compilado (gerado pelo tsc)
│   ├── assets/
│   │   └── map/
│   │       └── mapa1.txt # Arquivo do mapa
│   ├── controller/
│   ├── db/
│   ├── enum/
│   ├── model/
│   ├── view/
│   └── index.js
├── db.json             # Arquivo de save do jogo
├── package.json
├── tsconfig.json
└── README.md           # Este arquivo


## Para Desenvolvedores

* O código fonte está em `src/` e é escrito em TypeScript.
* O código compilado para JavaScript está em `dist/`.
* Os testes podem ser executados com `npm test` (configurado em `package.json` e `jest.config.js`).

Divirta-se jogando e explorando o código!
