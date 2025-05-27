export default class Screen {
    public render(): void {
        console.log("O método render() não foi sobrescrito na classe derivada.");
    }

    public handleInput(cmd: string): Screen | null {
        console.log(`O método handleInput() não foi sobrescrito para tratar o comando: ${cmd}`);
        return this;
    }

    public onEnter?(): void;
}