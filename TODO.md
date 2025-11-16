# Math Maze Game Development TODO

## Step 1: Modify Maze Generation
- [x] Update `GameMaze` class to assign random numbers (0-9) to each cell during maze creation
- [x] Add a `numbers` property to store the random numbers for each tile

## Step 2: Render Numbers
- [x] Extend `GameView` class to draw the random numbers on each tile
- [x] Ensure numbers are centered and visible on the tiles

## Step 3: Compute Shortest Path Sum
- [x] Implement BFS algorithm to find the shortest path from (0,0) to (6,6)
- [x] Calculate the sum of numbers along the shortest path
- [x] Store the computed sum for comparison

## Step 4: Add Input and Scoring UI
- [x] Update `game-math-maze.html` to include input box for sum entry
- [x] Add submit button and display current score
- [x] Add instructions for the game

## Step 5: Game States and Logic
- [x] Add game states: 'displaying_maze', 'waiting_for_input', 'checking_answer', 'game_over', 'next_level'
- [x] Implement logic to compare user input to computed shortest path sum
- [x] Handle correct/incorrect answers: score++ or game over

## Step 6: UI Enhancements
- [x] Add game instructions, score counter, restart button
- [x] Add feedback messages (e.g., "Correct! Score: X" or "Wrong! Game Over")
- [x] Update `maze-game.css` for styling input box, buttons, and UI elements

## Testing and Validation
- [x] Test each step by running the game locally
- [x] Ensure maze is always solvable (shortest path exists)
- [x] Add input validation (only numbers allowed)
- [x] Test game over state and restart functionality
