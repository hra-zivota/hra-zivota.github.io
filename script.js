const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let resolution = 10;
let cols, rows;
let grid;
let isRunning = true; // Indikátor běhu hry
let slow = true; // zpomalý hru
var mouse = {
    x: undefined,
    y: undefined
}

function setup() {
    canvas.width = Math.floor(window.innerWidth / resolution) * resolution;
    canvas.height = Math.floor(window.innerHeight / resolution) * resolution;
    cols = canvas.width / resolution;
    rows = canvas.height / resolution;
    grid = buildGrid();
}

function buildGrid() {
    return new Array(cols).fill(null)
        .map(() => new Array(rows).fill(null)
            .map(() => Math.floor(Math.random() * 2)));
}

function update() {
    const next = grid.map(arr => [...arr]);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const cell = grid[i][j];
            let sum = 0;
            for (let x = -1; x < 2; x++) {
                for (let y = -1; y < 2; y++) {
                    const i_ = (i + x + cols) % cols;
                    const j_ = (j + y + rows) % rows;
                    sum += grid[i_][j_];
                }
            }
            sum -= cell;
            if (cell === 1 && (sum < 2 || sum > 3)) {
                next[i][j] = 0;
            } else if (cell === 0 && sum === 3) { // TODO
                next[i][j] = 1;
            }
        }
    }
    grid = next;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = i * resolution;
            const y = j * resolution;
            if (grid[i][j] === 1) {
                ctx.fillRect(x, y, resolution, resolution);
            }
            ctx.strokeRect(x, y, resolution, resolution); // Vykreslení mřížky
        }
    }
}

function loop() {
    if (isRunning) {
        update();
        render();
    }
    setTimeout(loop, slow ? 100 : 0); // Zpomalování hry, pokud je slow true
}

setup();
loop();

window.addEventListener('resize', () => {
    setup();
});

window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX - canvas.offsetLeft;
    mouse.y = event.clientY - canvas.offsetTop;
    console.log(mouse);
})

canvas.addEventListener('click', (event) => {
    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;
    const i = Math.floor(mouseX / resolution);
    const j = Math.floor(mouseY / resolution);
    grid[i][j] = 1 - grid[i][j]; // Neguje stav buňky
    render();
});

document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        isRunning = !isRunning; // Přepíná stav běhu hry
    } else if (event.key === 'r') {
        setup(); // Reload hry s náhodným rozložením buněk
        render();
    } else if (event.key === 's') {
        slow = !slow;
    } else if (event.key === 'i') {
        // Oživení všech buněk
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j] = 1;
            }
        }
        render();
    } else if (event.key === 'o') {
        // Zabití všech buněk
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j] = 0;
            }
        }
        render();
    } else if (event.key === 'p') {
        // Neguje stav všech buněk
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j] = 1 - grid[i][j];
            }
        }
        render();
    } else if (event.key === 'g') {
        // Zobrazení Gosperova glider gun
        const gliderGunPattern = [
            [0, 24],
            [1, 22], [1, 24],
            [2, 12], [2, 13], [2, 20], [2, 21], [2, 34], [2, 35],
            [3, 11], [3, 15], [3, 20], [3, 21], [3, 34], [3, 35],
            [4, 0], [4, 1], [4, 10], [4, 16], [4, 20], [4, 21],
            [5, 0], [5, 1], [5, 10], [5, 14], [5, 16], [5, 17], [5, 22], [5, 24],
            [6, 10], [6, 16], [6, 24],
            [7, 11], [7, 15],
            [8, 12], [8, 13]
        ];

        // Reset grid
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j] = 0;
            }
        }

        // Insert Gosper's glider gun pattern
        for (const [x, y] of gliderGunPattern) {
            grid[x][y] = 1;
        }

        render();
    } else if (event.key >= '1' && event.key <= '9' && event.key !== '5') {
        // Vytvoření letadla na základě stisknuté číslice
        const direction = parseInt(event.key);
        const i = Math.floor(mouse.x / resolution);
        const j = Math.floor(mouse.y / resolution);
        createGlider(i, j, direction);
    }
});

function createGlider(startX, startY, direction) {
    // Ignore even numbers
    if (direction % 2 === 0) {
        console.error('Invalid direction for glider');
        return;
    }

    // Glider shape
    let gliderShape;
    switch (direction) {
        case 1: // Vlevo dolů
            gliderShape = [
                [0, 0], [0, 1], [0, 2],
                [1, 2],
                [2, 1]
            ];
            break;
        case 3: // Vpravo dolů
            gliderShape = [
                [0, 1],
                [1, 2],
                [2, 0], [2, 1], [2, 2]
            ];
            break;
        case 7: // Vlevo nahorů
            gliderShape = [
                [0, 0], [0, 1], [0, 2],
                [1, 0],
                [2, 1]
            ];
            break;
        case 9: // Vpravo nahorů
            gliderShape = [
                [0, 1],
                [1, 0],
                [2, 0], [2, 1], [2, 2]
            ];
            break;
        default:
            console.error('Invalid direction for glider');
            return;
    }

    // Set grid cells based on glider shape and starting position
    for (const [dx, dy] of gliderShape) {
        const x = startX + dx;
        const y = startY + dy;
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            grid[x][y] = 1;
        }
    }
    render();
}
