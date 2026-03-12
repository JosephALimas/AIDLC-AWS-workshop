# Flappy Kiro - Domain Entities

## Entity Overview

This document defines the core domain entities, their properties, relationships, and data flow.

---

## 1. Player Entity

### Properties
```javascript
Player {
    // Position
    x: number,              // X coordinate (pixels)
    y: number,              // Y coordinate (pixels)
    
    // Dimensions
    width: number,          // 40 pixels
    height: number,         // 40 pixels
    
    // Physics
    velocity: number,       // Vertical velocity (pixels/frame)
    
    // Constants
    GRAVITY: 0.5,          // Gravity acceleration
    JUMP_VELOCITY: -10,    // Jump velocity boost
    
    // Visual
    sprite: Image          // ghosty.png asset
}
```

### Behaviors
- `update()`: Apply physics and update position
- `jump()`: Apply jump velocity
- `reset()`: Reset to initial state
- `getBounds()`: Return collision hitbox
- `getCenterX()`: Return center X coordinate

### Initial State
```javascript
{
    x: 200,
    y: 400,
    velocity: 0,
    width: 40,
    height: 40
}
```

---

## 2. Wall Entity

### Properties
```javascript
Wall {
    // Position
    x: number,              // X coordinate (pixels)
    
    // Gap Configuration
    gapY: number,           // Y position where gap starts
    gapHeight: 150,         // Fixed gap height
    
    // Dimensions
    width: 60,              // Fixed wall width
    
    // Scoring
    passed: boolean,        // Has player passed this wall?
    
    // Derived Properties (calculated)
    topWall: {
        x: number,
        y: 0,
        width: 60,
        height: gapY
    },
    bottomWall: {
        x: number,
        y: gapY + 150,
        width: 60,
        height: canvasHeight - (gapY + 150)
    }
}
```


### Behaviors
- `update()`: Move wall left by scroll speed
- `isOffScreen()`: Check if wall has scrolled off canvas
- `getTopWallBounds()`: Return top wall collision box
- `getBottomWallBounds()`: Return bottom wall collision box

### Initial State (on generation)
```javascript
{
    x: 1200,                    // Spawn at right edge
    gapY: random(50, 600),      // Random gap position
    passed: false,
    width: 60,
    gapHeight: 150
}
```

---

## 3. GameState Entity

### Properties
```javascript
GameState {
    // State Machine
    currentState: string,   // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
    
    // Scoring
    currentScore: number,   // Current game score
    highScore: number,      // Session high score
    
    // Timing
    frameCounter: number,   // Frame counter for wall generation
    lastFrameTime: number   // Timestamp of last frame
}
```

### State Values
- `MENU`: Start menu displayed, waiting for user to start
- `PLAYING`: Active gameplay, physics and collisions active
- `PAUSED`: Gameplay frozen, can resume
- `GAME_OVER`: Game ended, showing final score

### Behaviors
- `setState(newState)`: Transition to new state
- `getState()`: Get current state
- `isPlaying()`: Check if in PLAYING state
- `isPaused()`: Check if in PAUSED state
- `isGameOver()`: Check if in GAME_OVER state
- `isMenu()`: Check if in MENU state
- `incrementScore()`: Increase current score by 1
- `resetScore()`: Reset current score to 0
- `updateHighScore()`: Update high score if current is higher

### Initial State
```javascript
{
    currentState: 'MENU',
    currentScore: 0,
    highScore: 0,
    frameCounter: 0,
    lastFrameTime: 0
}
```

---


## 4. Canvas Entity

### Properties
```javascript
Canvas {
    // Dimensions
    width: 1200,            // Canvas width (pixels)
    height: 800,            // Canvas height (pixels)
    
    // Boundaries
    groundHeight: 50,       // Height of ground visual
    ceilingHeight: 50,      // Height of ceiling visual
    
    // Playable Area
    playableTop: 50,        // Y coordinate of playable area top
    playableBottom: 750,    // Y coordinate of playable area bottom
    playableHeight: 700     // Height of playable area
}
```

### Behaviors
- None (static configuration)

---

## 5. Audio Entity

### Properties
```javascript
Audio {
    jumpSound: AudioObject,     // jump.wav
    gameOverSound: AudioObject, // game_over.wav
    muted: boolean              // Mute state
}
```

### Behaviors
- `playJump()`: Play jump sound effect
- `playGameOver()`: Play game over sound effect
- `mute()`: Mute all sounds
- `unmute()`: Unmute all sounds

---

## Entity Relationships

### Ownership Hierarchy
```
Game (Root)
├── GameState
├── Player
├── WallManager
│   └── Wall[] (array of walls)
├── CollisionDetector
├── ScoreManager
├── Renderer
├── AudioManager
└── InputHandler
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│              Game Loop (60 FPS)                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │   GameState    │
         │  Query State   │
         └────────┬───────┘
                  │
                  ▼ (if PLAYING)
         ┌────────────────┐
         │     Player     │
         │  Update Physics│
         │  position, vel │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │  WallManager   │
         │  Update Walls  │
         │  x positions   │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │CollisionDetect │
         │ Check Player   │
         │ vs Walls/Bounds│
         └────────┬───────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌────────────────┐  ┌────────────────┐
│  If Collision  │  │ If Wall Passed │
│  GameState     │  │  ScoreManager  │
│  → GAME_OVER   │  │  → Increment   │
└────────────────┘  └────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │    Renderer    │
         │  Draw All      │
         │  Entities      │
         └────────────────┘
```


### Entity Interactions

#### Player ↔ InputHandler
```
InputHandler listens for spacebar
→ Calls player.jump()
→ Player updates velocity
```

#### Player ↔ CollisionDetector
```
CollisionDetector queries player.getBounds()
→ Returns hitbox {x, y, width, height}
→ Used for collision checks
```

#### WallManager ↔ CollisionDetector
```
CollisionDetector queries wallManager.getWalls()
→ Returns array of wall objects
→ Checks each wall for collision
```

#### WallManager ↔ ScoreManager
```
Game checks wallManager.checkWallPassed(player.x)
→ Returns true if wall was passed
→ Calls scoreManager.incrementScore()
→ Marks wall.passed = true
```

#### GameState ↔ All Components
```
All components query gameState.getState()
→ Adjust behavior based on current state
→ Only update when state == PLAYING
```

---

## Entity Lifecycle

### Player Lifecycle
```
1. Created at game initialization
2. Reset on game start (MENU → PLAYING)
3. Updated every frame during PLAYING
4. Frozen during PAUSED and GAME_OVER
5. Reset on restart
```

### Wall Lifecycle
```
1. Created when frameCounter reaches generation interval
2. Added to walls array
3. Updated every frame (x position decreases)
4. Marked as passed when player passes
5. Removed when x < -60 (off-screen)
```

### GameState Lifecycle
```
1. Created at game initialization with state = MENU
2. Transitions through states based on events
3. Persists throughout game session
4. High score maintained across game restarts
```

---

## Data Persistence

### Session-Based (In-Memory)
- Current score: Reset on each game
- High score: Persists during browser session
- Game state: Persists during browser session

### No Persistence
- Player position: Reset each game
- Wall positions: Cleared each game
- Velocity: Reset each game

