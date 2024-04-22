import * as readline from 'node:readline'

// Для интерактивного взаимодействия с консолью
const consoleReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
export function consoleReadLine(question: string): Promise<string> {
    return new Promise(resolve => {
        consoleReader.question(question, input => resolve(input));
    });
}

export async function waitKeyPress() {
    console.log("Для продолжения нажмите любую клавишу")
    process.stdin.setRawMode(true)
    return new Promise(resolve => process.stdin.once('data', data => {
        process.stdin.setRawMode(false)
        resolve(0)
    }))
}