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
    [command, ...arg] = command.split(' ');
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
            console.log(GetTODOWithName(arg.join(' ').toLowerCase().concat()));
            break;
        case 'date':
            console.log(GetTODOAfterDate(arg[0]));
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
    const todoLists = showTODO();
    const arr = []
    for (const todoList of todoLists){
        const resultTodos = [];
        for (const todo of todoList){
            const nameTodo = todo.split(';')[0].split(' ').slice(1).join(' ').concat();
            if (nameTodo.toLowerCase() === name){
                resultTodos.push(todo);
            }
        }

        if (resultTodos.length > 0){
            arr.push(resultTodos);
        }
    }

    return arr;
}

function GetTODOAfterDate(dateInput) {
    dateInput = parseDate(dateInput);
    const allTodo = showTODO();
    const regex = /TODO\s+([^;]+);\s*([^;]+);\s*(.+)/;

    let result = [];
    for (const todoInFile of allTodo) {
        let todoArr = []
        for (const todo of todoInFile) {
            const match = todo.match(regex);
            if (match) {
                const date = parseDate(match[2].trim());
                if (date > dateInput) {
                    todoArr.push(todo)
                }
            }
        }

        if (todoArr.length > 0) {
            result.push(todoArr)
        }
    }

    return result;
}

function parseDate(dateString) {
    const parts = dateString.split('-');

    const year = parseInt(parts[0], 10);
    const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
    const day = parts[2] ? parseInt(parts[2], 10) : 1;

    return new Date(year, month, day);
}

