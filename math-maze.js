/*
Maze Game using Origin Shift Algorithm
Adapted from reference code
*/

// Game constants
const MAZE_SIZE = 7;
const CELL_SIZE = 50;
const CANVAS_SIZE = MAZE_SIZE * CELL_SIZE;

// Game state
let gameState = 'generating'; // 'generating', 'displaying_maze', 'waiting_for_input', 'checking_answer', 'game_over', 'next_level'
let maze = null;
let view = null;
let score = 0;
let shortestPathSum = 0;

// DOM elements
let canvas, ctx, gameStatus, scoreDisplay, inputBox, submitBtn, restartBtn;

// Initialize game
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    gameStatus = document.getElementById('game-status');
    scoreDisplay = document.getElementById('score-display');
    inputBox = document.getElementById('input-box');
    submitBtn = document.getElementById('submit-btn');
    restartBtn = document.getElementById('restart-btn');

    // Set up event listeners
    submitBtn.addEventListener('click', checkAnswer);
    restartBtn.addEventListener('click', startNewMaze);
    inputBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    view = new GameView();
    startNewMaze();
}

// Start a new maze
function startNewMaze() {
    gameState = 'generating';
    updateStatus('Generating maze...');
    document.getElementById('input-section').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';
    score = 0;
    updateScore();

    maze = new GameMaze(MAZE_SIZE, MAZE_SIZE);
    // Generate maze with many iterations for complexity
    for (let i = 0; i < MAZE_SIZE * MAZE_SIZE * 20; i++) {
        maze.iterate();
    }

    // Compute shortest path sum
    shortestPathSum = maze.getShortestPathSum();

    gameState = 'displaying_maze';
    updateStatus('Find the sum of the shortest path from top-left to bottom-right and enter it below.');
    document.getElementById('input-section').style.display = 'flex';
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

    if (gameState === 'displaying_maze') {
        view.drawGrid(); // Draw grid lines first
        view.drawMaze(maze); // Draw walls on top
    } else if (gameState === 'game_over') {
        view.drawGameOver();
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
        this.numbers = this.generateNumbers(); // random numbers for each tile
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

    // generates random numbers for each tile
    generateNumbers() {
        let numbers = [];
        for (let y = 0; y < this.height; y++) {
            numbers.push([]);
            for (let x = 0; x < this.width; x++) {
                numbers[y].push(getRandomInt(0, 10)); // 0-9
            }
        }
        return numbers;
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

    // BFS to find shortest path from (0,0) to (width-1, height-1) and calculate sum
    getShortestPathSum() {
        const start = {x: 0, y: 0};
        const end = {x: this.width - 1, y: this.height - 1};
        const queue = [{pos: start, path: [start], sum: this.numbers[start.y][start.x]}];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        while (queue.length > 0) {
            const {pos, path, sum} = queue.shift();

            if (pos.x === end.x && pos.y === end.y) {
                return sum; // Found shortest path sum
            }

            // Check all possible moves (up, down, left, right)
            const directions = [
                {x: 0, y: -1}, // up
                {x: 0, y: 1},  // down
                {x: -1, y: 0}, // left
                {x: 1, y: 0}   // right
            ];

            for (const dir of directions) {
                const newX = pos.x + dir.x;
                const newY = pos.y + dir.y;

                if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
                    const key = `${newX},${newY}`;
                    if (!visited.has(key)) {
                        // Check if there's a wall between current and new position
                        if (this.canMove(pos.x, pos.y, newX, newY)) {
                            visited.add(key);
                            const newSum = sum + this.numbers[newY][newX];
                            queue.push({
                                pos: {x: newX, y: newY},
                                path: [...path, {x: newX, y: newY}],
                                sum: newSum
                            });
                        }
                    }
                }
            }
        }

        return -1; // No path found (shouldn't happen in a valid maze)
    }

    // Check if can move from (x1,y1) to (x2,y2)
    canMove(x1, y1, x2, y2) {
        const node1 = this.map[y1][x1];
        const node2 = this.map[y2][x2];

        if (x2 === x1 + 1) { // moving right
            return node1.direction.x === 1 || node2.direction.x === -1;
        } else if (x2 === x1 - 1) { // moving left
            return node1.direction.x === -1 || node2.direction.x === 1;
        } else if (y2 === y1 + 1) { // moving down
            return node1.direction.y === 1 || node2.direction.y === -1;
        } else if (y2 === y1 - 1) { // moving up
            return node1.direction.y === -1 || node2.direction.y === 1;
        }

        return false;
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

        // Draw numbers on tiles
        this.ctx.fillStyle = "#333333"; // Dark text for contrast
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                const number = maze.numbers[y][x];
                this.ctx.fillText(
                    number.toString(),
                    x * CELL_SIZE + CELL_SIZE / 2,
                    y * CELL_SIZE + CELL_SIZE / 2
                );
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

// Check player's answer
function checkAnswer() {
    const userAnswer = parseInt(inputBox.value);
    if (isNaN(userAnswer)) {
        updateStatus('Please enter a valid number.');
        return;
    }
    if (userAnswer === shortestPathSum) {
        score++;
        updateScore();
        updateStatus('Correct! Generating new maze...');
        document.getElementById('input-section').style.display = 'none';
        setTimeout(() => {
            startNewMaze();
        }, 2000);
    } else {
        gameState = 'game_over';
        updateStatus(`Incorrect! The correct sum was ${shortestPathSum}. Game Over.`);
        document.getElementById('input-section').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'block';
    }
    inputBox.value = '';
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
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
