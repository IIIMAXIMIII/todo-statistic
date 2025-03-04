const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    [command, arg] = command.split(' ');
    switch (command) {
        case 'show':
            console.log(showTODO());
            break;
        case 'important':
            console.log(showImportantTODO());
            break
        case 'exit':
            process.exit(0);
            break;
        case 'user':
            const comment = GetTODOWithName(arg);
            console.log(comment);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function showTODO(){
    const result = [];

    const regex = /(?<=^\s*(?:\/\/|\/\*)\s*)TODO\b.*/gm;

    for (const fileText of files) {
        const matches = fileText.match(regex);

        if (matches !== null) {
            result.push(matches);
        }
    }

    return result;
}

function showImportantTODO(){
    const todoLists = showTODO();
    const result = [];

    for (const todoList of todoLists){
        const resultTodos = [];
        for (const todo of todoList){
            if (todo.endsWith('!')){
                resultTodos.push(todo);
            }
        }

        result.push(resultTodos);
    }

    return result;
}

function GetTODOWithName(name) {
    const regex = /\/\/ TODO\s+([^;]+);\s*([^;]+);\s*(.+)/;

    const arr = []
    for (const file of files) {
        const match = file.match(regex);

        if (match) {
            const author = match[1].trim();

            if (author === name) {
                arr.push(match[0]);
            }
        }
    }

    return arr;
}
