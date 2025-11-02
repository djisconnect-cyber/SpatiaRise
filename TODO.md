# TODO: Implement Swipe Gestures for Mobile Maze Game

## Overview
Add swipe gesture controls to the maze game for mobile playability. Swipes on the canvas will move the player in the corresponding direction (up, down, left, right), mapping to the existing WASD keyboard controls.

## Steps to Complete

- [x] **Step 1: Add Touch Event Listeners to Canvas**
  - Attach `touchstart` and `touchend` event listeners to the `game-canvas` element.
  - Store initial touch position on `touchstart`.
  - Calculate swipe direction on `touchend` based on delta X/Y.

- [x] **Step 2: Implement Swipe Detection Logic**
  - Define a minimum swipe distance threshold (e.g., 30px) to distinguish from taps.
  - Determine swipe direction: horizontal (left/right) or vertical (up/down) based on larger delta.
  - Ignore diagonal swipes or small movements.

- [x] **Step 3: Map Swipe to Player Movement**
  - Call `movePlayer(dx, dy)` with appropriate values based on swipe direction.
  - Ensure this only triggers during 'playing' state, similar to keyboard events.

- [x] **Step 4: Ensure Gestures Only on Canvas**
  - Confirm listeners are only on the canvas element, not the entire document.
  - Prevent default touch behaviors (e.g., scrolling) on the canvas.

- [x] **Step 5: Test Implementation**
  - Test on a touch-enabled device or browser simulator.
  - Verify movement works correctly and doesn't interfere with existing keyboard controls.
  - Check for edge cases like rapid swipes or boundary touches.

## Notes
- Maintain existing keyboard controls for desktop play.
- Use `e.preventDefault()` on touch events to avoid page scrolling.
- If issues arise, consider adding visual feedback for swipe detection.
