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
        case 'user':
            console.log(GetTODOWithName(arg.join(' ').toLowerCase().concat()));
            break;
        case 'sort':
            console.log(showSortedTODO(arg[0]))
            break;
        case 'date':
            console.log(GetTODOAfterDate(arg[0]));
            break;
        case 'exit':
            process.exit(0);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function showTODO() {
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

function showImportantTODO() {
    const todoLists = showTODO();
    const result = [];

    for (const todoList of todoLists) {
        const resultTodos = [];
        for (const todo of todoList) {
            if (todo.endsWith('!')) {
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
    for (const todoList of todoLists) {
        const resultTodos = [];
        for (const todo of todoList) {
            const nameTodo = todo.split(';')[0].split(' ').slice(1).join(' ').concat();
            if (nameTodo.toLowerCase() === name) {
                resultTodos.push(todo);
            }
        }

        if (resultTodos.length > 0) {
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

function showSortedTODO(arg) {
    const todoLists = showTODO();
    if (arg === 'user') {
        return showUserTODO(todoLists);
    } else if (arg === 'importance') {
        return showSortImportantTODO(todoLists);
    }
    else if (arg === 'date'){
        return showDateTODO(todoLists);
    }
}

function showSortImportantTODO(todoLists) {
    let result = new Map();

    for (const todoList of todoLists) {
        for (const todo of todoList) {
            result.set(todo, countSymbols(todo));
        }
    }

    return [...result.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
}


function countSymbols(arr) {
    const counter = new Map();

    for (const item of arr) {
        if (counter.has(item)) {
            counter.set(item, counter.get(item) + 1);
            continue;
        }

        counter.set(item, 1);
    }

    if (counter.has("!"))
        return counter.get("!");
    return 0;
}

function showUserTODO(todoLists) {
    const counter = new Map();

    for (const todoList of todoLists) {
        for (const todo of todoList) {
            const nameTodo = todo.split(';')[0].split(' ').slice(1).join(' ').concat().toLowerCase();
            if (counter.has(nameTodo)) {
                counter.get(nameTodo).push(todo)
                continue;
            }

            counter.set(nameTodo, [todo]);
        }
    }

    return counter;
}

function showDateTODO(todoLists) {
    const counter = new Map();
    const regex = /TODO\s+([^;]+);\s*([^;]+);\s*(.+)/;
    for (const todoList of todoLists) {
        for (const todo of todoList) {
            const match = todo.match(regex);
            if (match) {
                const date = parseDate(match[2].trim());
                if (counter.has(date)) {
                    counter.get(date).push(todo)
                    continue;
                }

                counter.set(date, [todo])
            }
        }
    }

    return new Map([...counter.entries()].sort((a, b) => new Date(a[0]) - new Date(b[0])));
}

