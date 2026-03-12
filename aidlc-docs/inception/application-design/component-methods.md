# Flappy Kiro - Component Methods

## Component Method Signatures

This document defines the method signatures for each component. Detailed business rules and implementation logic will be defined in the Functional Design phase.

---

## 1. Game Component

### Constructor
```javascript
constructor()
```
- Initializes all game components
- Sets up canvas and context
- Starts the game loop

### Core Methods

#### `init()`
- **Purpose**: Initialize game components and canvas
- **Returns**: void

#### `start()`
- **Purpose**: Start the game loop
- **Returns**: void

#### `gameLoop(timestamp)`
- **Purpose**: Main game loop executed at 60 FPS
- **Parameters**: 
  - `timestamp` (number): Current frame timestamp
- **Returns**: void

#### `update(deltaTime)`
- **Purpose**: Update all game components
- **Parameters**:
  - `deltaTime` (number): Time elapsed since last frame
- **Returns**: void

#### `render()`
- **Purpose**: Trigger rendering of all components
- **Returns**: void

---

## 2. GameStateManager Component

### Constructor
```javascript
constructor()
```
- Initializes state to MENU
- Initializes score tracking

### State Management Methods

#### `setState(newState)`
- **Purpose**: Transition to a new game state
- **Parameters**:
  - `newState` (string): Target state (MENU, PLAYING, PAUSED, GAME_OVER)
- **Returns**: void

#### `getState()`
- **Purpose**: Get current game state
- **Returns**: string (current state)

#### `isPlaying()`
- **Purpose**: Check if game is in PLAYING state
- **Returns**: boolean

#### `isPaused()`
- **Purpose**: Check if game is in PAUSED state
- **Returns**: boolean

#### `isGameOver()`
- **Purpose**: Check if game is in GAME_OVER state
- **Returns**: boolean

#### `isMenu()`
- **Purpose**: Check if game is in MENU state
- **Returns**: boolean

### Score Management Methods

#### `setScore(score)`
- **Purpose**: Set current score
- **Parameters**:
  - `score` (number): New score value
- **Returns**: void

#### `getScore()`
- **Purpose**: Get current score
- **Returns**: number

#### `getHighScore()`
- **Purpose**: Get session high score
- **Returns**: number

#### `updateHighScore()`
- **Purpose**: Update high score if current score is higher
- **Returns**: void

#### `resetScore()`
- **Purpose**: Reset current score to 0
- **Returns**: void

---

## 3. Player Component

### Constructor
```javascript
constructor(x, y, image)
```
- **Parameters**:
  - `x` (number): Initial x position
  - `y` (number): Initial y position
  - `image` (Image): Ghosty sprite image

### Physics Methods

#### `update(deltaTime)`
- **Purpose**: Update player position and physics
- **Parameters**:
  - `deltaTime` (number): Time elapsed since last frame
- **Returns**: void

#### `jump()`
- **Purpose**: Apply upward velocity (jump)
- **Returns**: void

#### `reset()`
- **Purpose**: Reset player to initial position and velocity
- **Returns**: void

### Position Methods

#### `getX()`
- **Purpose**: Get player x position
- **Returns**: number

#### `getY()`
- **Purpose**: Get player y position
- **Returns**: number

#### `getWidth()`
- **Purpose**: Get player width for collision detection
- **Returns**: number

#### `getHeight()`
- **Purpose**: Get player height for collision detection
- **Returns**: number

#### `getBounds()`
- **Purpose**: Get bounding box for collision detection
- **Returns**: object `{x, y, width, height}`

---

## 4. WallManager Component

### Constructor
```javascript
constructor(canvasWidth, canvasHeight)
```
- **Parameters**:
  - `canvasWidth` (number): Canvas width
  - `canvasHeight` (number): Canvas height

### Wall Management Methods

#### `update(deltaTime)`
- **Purpose**: Update all wall positions
- **Parameters**:
  - `deltaTime` (number): Time elapsed since last frame
- **Returns**: void

#### `generateWall()`
- **Purpose**: Create a new wall pair
- **Returns**: void

#### `removeOffscreenWalls()`
- **Purpose**: Remove walls that have scrolled off screen
- **Returns**: void

#### `reset()`
- **Purpose**: Clear all walls and reset generation
- **Returns**: void

### Query Methods

#### `getWalls()`
- **Purpose**: Get array of all active walls
- **Returns**: Array of wall objects

#### `checkWallPassed(playerX)`
- **Purpose**: Check if player has passed any walls (for scoring)
- **Parameters**:
  - `playerX` (number): Player x position
- **Returns**: boolean (true if wall was passed)

---

## 5. CollisionDetector Component

### Constructor
```javascript
constructor()
```
- Stateless component, no initialization needed

### Collision Detection Methods

#### `checkCollision(player, walls, canvasHeight)`
- **Purpose**: Check all collision scenarios
- **Parameters**:
  - `player` (Player): Player component
  - `walls` (Array): Array of wall objects
  - `canvasHeight` (number): Canvas height for ground collision
- **Returns**: boolean (true if collision detected)

#### `checkPlayerWallCollision(playerBounds, wallBounds)`
- **Purpose**: Check bounding box collision between player and wall
- **Parameters**:
  - `playerBounds` (object): `{x, y, width, height}`
  - `wallBounds` (object): `{x, y, width, height}`
- **Returns**: boolean

#### `checkGroundCollision(playerY, playerHeight, canvasHeight)`
- **Purpose**: Check if player hit the ground
- **Parameters**:
  - `playerY` (number): Player y position
  - `playerHeight` (number): Player height
  - `canvasHeight` (number): Canvas height
- **Returns**: boolean

#### `checkCeilingCollision(playerY)`
- **Purpose**: Check if player hit the ceiling
- **Parameters**:
  - `playerY` (number): Player y position
- **Returns**: boolean

---

## 6. ScoreManager Component

### Constructor
```javascript
constructor()
```
- Initializes score to 0
- Initializes high score to 0

### Score Methods

#### `incrementScore()`
- **Purpose**: Increase score by 1
- **Returns**: void

#### `getScore()`
- **Purpose**: Get current score
- **Returns**: number

#### `getHighScore()`
- **Purpose**: Get session high score
- **Returns**: number

#### `reset()`
- **Purpose**: Reset current score to 0
- **Returns**: void

#### `updateHighScore(currentScore)`
- **Purpose**: Update high score if current is higher
- **Parameters**:
  - `currentScore` (number): Current score to compare
- **Returns**: void

---

## 7. Renderer Component

### Constructor
```javascript
constructor(canvas, context)
```
- **Parameters**:
  - `canvas` (HTMLCanvasElement): Canvas element
  - `context` (CanvasRenderingContext2D): 2D rendering context

### Rendering Methods

#### `clear()`
- **Purpose**: Clear the canvas
- **Returns**: void

#### `drawBackground()`
- **Purpose**: Draw background color/pattern
- **Returns**: void

#### `drawPlayer(player)`
- **Purpose**: Draw the player sprite
- **Parameters**:
  - `player` (Player): Player component
- **Returns**: void

#### `drawWalls(walls)`
- **Purpose**: Draw all wall pairs
- **Parameters**:
  - `walls` (Array): Array of wall objects
- **Returns**: void

#### `drawScore(score)`
- **Purpose**: Draw current score on screen
- **Parameters**:
  - `score` (number): Current score
- **Returns**: void

#### `drawMenu()`
- **Purpose**: Draw start menu UI
- **Returns**: void

#### `drawGameOver(score, highScore)`
- **Purpose**: Draw game over screen
- **Parameters**:
  - `score` (number): Final score
  - `highScore` (number): Session high score
- **Returns**: void

#### `drawPauseScreen()`
- **Purpose**: Draw pause overlay
- **Returns**: void

#### `render(gameState, player, walls, score, highScore)`
- **Purpose**: Main render method that draws appropriate UI based on state
- **Parameters**:
  - `gameState` (string): Current game state
  - `player` (Player): Player component
  - `walls` (Array): Array of walls
  - `score` (number): Current score
  - `highScore` (number): High score
- **Returns**: void

---

## 8. AudioManager Component

### Constructor
```javascript
constructor()
```
- Initializes audio objects
- Preloads audio files

### Audio Methods

#### `loadAudio()`
- **Purpose**: Load and preload audio files
- **Returns**: Promise (resolves when audio loaded)

#### `playJump()`
- **Purpose**: Play jump sound effect
- **Returns**: void

#### `playGameOver()`
- **Purpose**: Play game over sound effect
- **Returns**: void

#### `mute()`
- **Purpose**: Mute all audio
- **Returns**: void

#### `unmute()`
- **Purpose**: Unmute all audio
- **Returns**: void

#### `isMuted()`
- **Purpose**: Check if audio is muted
- **Returns**: boolean

---

## 9. InputHandler Component

### Constructor
```javascript
constructor(player, gameStateManager)
```
- **Parameters**:
  - `player` (Player): Player component reference
  - `gameStateManager` (GameStateManager): State manager reference

### Input Methods

#### `setupListeners()`
- **Purpose**: Set up keyboard event listeners
- **Returns**: void

#### `handleKeyDown(event)`
- **Purpose**: Handle keydown events
- **Parameters**:
  - `event` (KeyboardEvent): Keyboard event
- **Returns**: void

#### `handleKeyUp(event)`
- **Purpose**: Handle keyup events (if needed)
- **Parameters**:
  - `event` (KeyboardEvent): Keyboard event
- **Returns**: void

#### `removeListeners()`
- **Purpose**: Clean up event listeners
- **Returns**: void

---

## Notes

- All methods will have detailed implementation logic defined in the Functional Design phase
- Business rules for physics, collision detection, and scoring will be specified in detail later
- Error handling and edge cases will be addressed in Functional Design
- Performance optimizations will be considered in NFR Design phase

