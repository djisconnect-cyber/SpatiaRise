# Maze Game Implementation TODO

## Step 1: Create Game Structure
- [x] Create `maze-game.html` with basic HTML structure, canvas, and script/css links
- [x] Create `maze-game.js` as empty file for game logic
- [x] Create `maze-game.css` for styling

## Step 2: Adapt Maze Generation
- [x] Copy and adapt Maze and Node classes from reference `main.js`
- [x] Modify Maze class for fixed 8x8 size
- [x] Add start position (0,0) and finish position (7,7)
- [x] Ensure maze generation creates solvable paths

## Step 3: Implement Game States
- [x] Add game state management ('generating', 'displaying', 'playing', 'gameover')
- [x] Implement 5-second timer for wall display phase
- [x] Add state transition logic

## Step 4: Player Mechanics
- [x] Create Player class with position tracking
- [x] Implement WASD movement input
- [x] Add collision detection against maze walls

## Step 5: Rendering
- [x] Adapt View class from reference `graphics.js`
- [x] Draw walls only during display phase
- [x] Render player as green circle and finish as red square
- [x] Display current score

## Step 6: Game Logic
- [x] Handle player movement and position updates
- [x] Check for wall collisions (trigger game over)
- [x] Check for reaching finish (increment score, generate new maze)
- [x] Display score on game over

## Step 7: UI Elements
- [x] Add score display element
- [x] Add game instructions text
- [x] Add restart button for game over state

## Step 8: Event Handling
- [x] Set up WASD key listeners for movement
- [x] Prevent default key behaviors
- [x] Add restart functionality

## Testing
- [x] Test maze generation for solvability
- [x] Test 5-second display timer
- [x] Test WASD movement and collision detection
- [x] Test scoring and maze regeneration
- [x] Full gameplay loop testing
