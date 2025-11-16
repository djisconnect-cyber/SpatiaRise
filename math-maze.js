/*
Maze Game using Origin Shift Algorithm
Adapted from reference code
*/

// Game constants
const MAZE_SIZE = 7;
const CELL_SIZE = 50;
const CANVAS_SIZE = MAZE_SIZE * CELL_SIZE;

// Game state
let gameState = 'generating'; // 'generating', 'displaying'
let maze = null;
let view = null;

// DOM elements
let canvas, ctx, gameStatus;

// Initialize game
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    gameStatus = document.getElementById('game-status');

    view = new GameView();
    startNewMaze();
}

// Start a new maze
function startNewMaze() {
    gameState = 'generating';
    updateStatus('Generating maze...');

    maze = new GameMaze(MAZE_SIZE, MAZE_SIZE);
    // Generate maze with many iterations for complexity
    for (let i = 0; i < MAZE_SIZE * MAZE_SIZE * 20; i++) {
        maze.iterate();
    }

    gameState = 'displaying';
    updateStatus('Maze generated! Displaying the maze.');
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // No timer needed - maze is always visible
}

// Render game
function render() {
    view.clearCanvas();

    if (gameState === 'displaying') {
        view.drawGrid(); // Draw grid lines first
        view.drawMaze(maze); // Draw walls on top
    }
}


function updateStatus(text) {
    gameStatus.textContent = text;
}



// Adapted classes from reference code

class Node {
    constructor(directionX = 0, directionY = 0) {
        this.direction = {x: directionX, y: directionY};
    }

    setDirection(x, y) {
        this.direction.x = x;
        this.direction.y = y;
    }
}

class GameMaze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.map = this.newMap(); // the array of nodes defining the maze
        this.origin = {x: this.width - 1, y: this.height - 1}; // position of the origin point
        this.nextOrigin = {x: null, y: null}; // position of the next origin point. this is defined here to improve performance
        this.possibleDirections = [
            {x: -1, y: 0},
            {x: 0, y: -1},
            {x: 1, y: 0},
            {x: 0, y: 1}
        ]; // an array containing the possible directions the origin can travel in
    }

    // returns a map of a valid maze
    newMap() {
        let map = [];
        for (let y = 0; y < this.height; y++) {
            map.push([]);
            for (let x = 0; x < this.width - 1; x++) {
                map[y].push(new Node(1, 0));
            }
            map[y].push(new Node(0, 1));
        }
        map[this.height - 1][this.width - 1].setDirection(0, 0);

        return map;
    }

    setOrigin(x, y) {
        this.origin.x = x;
        this.origin.y = y;
    }

    setNextOrigin(x, y) {
        this.nextOrigin.x = x;
        this.nextOrigin.y = y;
    }

    // performs one iteration of the algorithm
    iterate() {
        // select a random direction
        let direction = this.possibleDirections[getRandomInt(0, this.possibleDirections.length)];

        // check if out of bounds
        this.setNextOrigin(this.origin.x + direction.x, this.origin.y + direction.y);
        if (this.nextOrigin.x < 0 || this.nextOrigin.x >= this.width || this.nextOrigin.y < 0 || this.nextOrigin.y >= this.height) return;

        // set the origin nodes direction to this direction
        this.map[this.origin.y][this.origin.x].setDirection(direction.x, direction.y);

        // the node in this direction becomes the new origin node
        this.setOrigin(this.nextOrigin.x, this.nextOrigin.y);
        this.map[this.origin.y][this.origin.x].setDirection(0, 0);
    }
}



class GameView {
    constructor() {
        this.cnv = document.getElementById('game-canvas');
        this.ctx = this.cnv.getContext('2d');
    }

    clearCanvas() {
        this.ctx.fillStyle = "#FDECEF";
        this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);
    }

    drawMaze(maze) {
        this.ctx.strokeStyle = "#BF3853"; // Wall color
        this.ctx.lineWidth = 3; // Increased thickness for better visibility

        // Draw outer walls
        this.ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw internal walls
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                const node = maze.map[y][x];

                // Check right wall (between this cell and right neighbor)
                if (x < maze.width - 1) {
                    const rightNode = maze.map[y][x + 1];
                    // Draw wall if no connection to the right
                    if (!(node.direction.x === 1 || rightNode.direction.x === -1)) {
                        this.ctx.beginPath();
                        this.ctx.moveTo((x + 1) * CELL_SIZE, y * CELL_SIZE);
                        this.ctx.lineTo((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
                        this.ctx.stroke();
                    }
                }

                // Check bottom wall (between this cell and bottom neighbor)
                if (y < maze.height - 1) {
                    const bottomNode = maze.map[y + 1][x];
                    // Draw wall if no connection downward
                    if (!(node.direction.y === 1 || bottomNode.direction.y === -1)) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x * CELL_SIZE, (y + 1) * CELL_SIZE);
                        this.ctx.lineTo((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
                        this.ctx.stroke();
                    }
                }
            }
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = "#ffb6c1"; // Pink grid lines to match theme
        this.ctx.lineWidth = 1;

        // Draw horizontal grid lines
        for (let y = 1; y < MAZE_SIZE; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CELL_SIZE);
            this.ctx.lineTo(CANVAS_SIZE, y * CELL_SIZE);
            this.ctx.stroke();
        }

        // Draw vertical grid lines
        for (let x = 1; x < MAZE_SIZE; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CELL_SIZE, 0);
            this.ctx.lineTo(x * CELL_SIZE, CANVAS_SIZE);
            this.ctx.stroke();
        }
    }

    drawPlayer(player) {
        this.ctx.fillStyle = "#00ff00";
        this.ctx.beginPath();
        this.ctx.arc(
            player.x * CELL_SIZE + CELL_SIZE / 2,
            player.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 4,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }

    drawFinish(x, y) {
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillRect(
            x * CELL_SIZE + CELL_SIZE / 4,
            y * CELL_SIZE + CELL_SIZE / 4,
            CELL_SIZE / 2,
            CELL_SIZE / 2
        );
    }

    drawGameOver() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "36px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("GAME OVER", this.cnv.width / 2, this.cnv.height / 2 - 20);
        this.ctx.font = "24px Arial";
        this.ctx.fillText(`Final Score: ${score}`, this.cnv.width / 2, this.cnv.height / 2 + 20);
        this.ctx.textAlign = "left";
    }
}

// Helper function
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Start game when page loads
window.addEventListener('load', () => {
    initGame();
    gameLoop();
});
