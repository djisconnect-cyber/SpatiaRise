# Update Maze Display to Show Walls Instead of Paths

## Step 1: Modify drawMaze function in GameView class
- [x] Change stroke style to white and line width to 2
- [x] Draw outer walls around the entire maze
- [x] Draw internal vertical walls where no horizontal path exists between adjacent cells
- [x] Draw internal horizontal walls where no vertical path exists between adjacent cells
- [x] Remove the showPaths parameter as walls are always displayed now

## Step 2: Update render call
- [x] Change view.drawMaze(maze, true) to view.drawMaze(maze) in render function

## Step 3: Test the changes
- [x] Run the game and verify walls appear as white lines with gaps where paths should be
- [x] Ensure player can still navigate through open paths
- [x] Adjust wall thickness or color if needed for better visibility
