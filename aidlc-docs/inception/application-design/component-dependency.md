# Flappy Kiro - Component Dependencies

## Dependency Overview

This document maps the relationships between components, their communication patterns, and data flow.

---

## Dependency Matrix

| Component | Depends On | Used By | Communication Pattern |
|-----------|------------|---------|----------------------|
| Game | All components | None (entry point) | Direct method calls |
| GameStateManager | None | Game, InputHandler, Renderer | Direct method calls |
| Player | None | Game, CollisionDetector, Renderer | Direct method calls |
| WallManager | None | Game, CollisionDetector, Renderer | Direct method calls |
| CollisionDetector | None | Game | Direct method calls (stateless) |
| ScoreManager | None | Game, GameStateManager | Direct method calls |
| Renderer | None | Game | Direct method calls |
| AudioManager | None | Game, InputHandler | Direct method calls |
| InputHandler | Player, GameStateManager, AudioManager | Game | Event listeners + direct calls |

---

## Component Dependency Graph

```
                            ┌──────────────┐
                            │     Game     │
                            │ (Orchestrator)│
                            └──────┬───────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
         ┌─────────────────┐  ┌────────┐  ┌──────────────┐
         │ GameStateManager│  │ Player │  │ WallManager  │
         └─────────────────┘  └────────┘  └──────────────┘
                    │              │              │
                    │              └──────┬───────┘
                    │                     │
                    ▼                     ▼
         ┌─────────────────┐  ┌──────────────────┐
         │  ScoreManager   │  │CollisionDetector │
         └─────────────────┘  └──────────────────┘
                    │
                    │
         ┌──────────┼──────────┐
         │          │          │
         ▼          ▼          ▼
    ┌─────────┐ ┌──────────┐ ┌──────────────┐
    │Renderer │ │AudioMgr  │ │ InputHandler │
    └─────────┘ └──────────┘ └──────────────┘
```

---

## Detailed Component Relationships

### 1. Game Component (Orchestrator)

**Dependencies**:
- GameStateManager (state queries)
- Player (update, position queries)
- WallManager (update, wall queries)
- CollisionDetector (collision checks)
- ScoreManager (score updates)
- Renderer (rendering)
- AudioManager (sound effects)
- InputHandler (input setup)

**Relationship Type**: Owner/Coordinator
- Creates all component instances
- Calls update methods in sequence
- Coordinates data flow between components

---

### 2. GameStateManager Component

**Dependencies**: None (self-contained)

**Used By**:
- Game (state queries and transitions)
- InputHandler (state checks for input handling)
- Renderer (state-based rendering)

**Data Provided**:
- Current game state (MENU, PLAYING, PAUSED, GAME_OVER)
- Current score
- High score

**Communication Pattern**: Query/Command
```javascript
// Query
if (gameStateManager.isPlaying()) { ... }

// Command
gameStateManager.setState('GAME_OVER');
```

---

### 3. Player Component

**Dependencies**: None (self-contained physics)

**Used By**:
- Game (update calls, position queries)
- CollisionDetector (bounds for collision checks)
- Renderer (drawing)
- InputHandler (jump method calls)

**Data Provided**:
- Position (x, y)
- Dimensions (width, height)
- Bounding box

**Communication Pattern**: Direct method calls
```javascript
player.update(deltaTime);
player.jump();
const bounds = player.getBounds();
```

---

### 4. WallManager Component

**Dependencies**: None (self-contained)

**Used By**:
- Game (update calls, wall queries)
- CollisionDetector (wall bounds for collision checks)
- Renderer (drawing walls)

**Data Provided**:
- Array of active walls
- Wall pass detection

**Communication Pattern**: Direct method calls
```javascript
wallManager.update(deltaTime);
const walls = wallManager.getWalls();
const passed = wallManager.checkWallPassed(playerX);
```

---

### 5. CollisionDetector Component

**Dependencies**: None (stateless utility)

**Used By**:
- Game (collision checking)

**Data Required**:
- Player bounds
- Wall bounds array
- Canvas dimensions

**Communication Pattern**: Stateless function calls
```javascript
const collision = collisionDetector.checkCollision(
    player,
    walls,
    canvasHeight
);
```

---

### 6. ScoreManager Component

**Dependencies**: None (self-contained)

**Used By**:
- Game (score updates)
- GameStateManager (score synchronization)
- Renderer (score display)

**Data Provided**:
- Current score
- High score

**Communication Pattern**: Direct method calls
```javascript
scoreManager.incrementScore();
const score = scoreManager.getScore();
```

---

### 7. Renderer Component

**Dependencies**: None (receives data to render)

**Used By**:
- Game (rendering calls)

**Data Required**:
- Game state (from GameStateManager)
- Player data (from Player)
- Walls data (from WallManager)
- Score data (from ScoreManager/GameStateManager)

**Communication Pattern**: Data passing
```javascript
renderer.render(
    gameState,
    player,
    walls,
    score,
    highScore
);
```

---

### 8. AudioManager Component

**Dependencies**: None (self-contained)

**Used By**:
- Game (game over sound)
- InputHandler (jump sound)

**Communication Pattern**: Direct method calls
```javascript
audioManager.playJump();
audioManager.playGameOver();
```

---

### 9. InputHandler Component

**Dependencies**:
- Player (for jump calls)
- GameStateManager (for state transitions)
- AudioManager (for sound effects)

**Used By**:
- Game (initialization only)

**Communication Pattern**: Event-driven + direct calls
```javascript
// Listens for keyboard events
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        player.jump();
        audioManager.playJump();
    }
});
```

---

## Data Flow Diagrams

### Game Loop Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    Game Loop                        │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────┐
         │  Query GameStateManager   │
         │  Is state PLAYING?        │
         └───────────┬───────────────┘
                     │
                     ▼ (if PLAYING)
         ┌───────────────────────────┐
         │  Player.update(deltaTime) │
         │  → Updates position       │
         └───────────┬───────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │ WallManager.update()      │
         │ → Updates wall positions  │
         └───────────┬───────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │ CollisionDetector.check() │
         │ ← Player bounds           │
         │ ← Wall bounds             │
         │ → Collision result        │
         └───────────┬───────────────┘
                     │
                     ├─ If collision ──────┐
                     │                     ▼
                     │         ┌───────────────────────┐
                     │         │ AudioManager.playGO() │
                     │         │ StateManager.setGO()  │
                     │         └───────────────────────┘
                     │
                     ├─ If wall passed ────┐
                     │                     ▼
                     │         ┌───────────────────────┐
                     │         │ ScoreManager.incr()   │
                     │         │ StateManager.setScore()│
                     │         └───────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │  Renderer.render()        │
         │  ← Game state             │
         │  ← Player data            │
         │  ← Walls data             │
         │  ← Score data             │
         └───────────────────────────┘
```

### Input Handling Data Flow

```
┌─────────────────────────────────────────────────────┐
│              Keyboard Event                         │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────┐
         │    InputHandler           │
         │    Receives event         │
         └───────────┬───────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Spacebar       │    │  P / Escape     │
│  (Jump)         │    │  (Pause)        │
└────────┬────────┘    └────────┬────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Player.jump()   │    │ StateManager    │
│ Audio.playJump()│    │ .togglePause()  │
└─────────────────┘    └─────────────────┘
```

### Rendering Data Flow

```
┌─────────────────────────────────────────────────────┐
│              Renderer.render()                      │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Clear       │  │ Check       │  │ Draw        │
│ Canvas      │  │ Game State  │  │ Background  │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ If MENU:    │  │ If PLAYING: │  │ If PAUSED:  │
│ Draw Menu   │  │ Draw Game   │  │ Draw Pause  │
└─────────────┘  └──────┬──────┘  └─────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Draw Player │  │ Draw Walls  │  │ Draw Score  │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## Communication Patterns Summary

### Direct Method Calls (Synchronous)
- **Used by**: Game orchestrator calling component methods
- **Advantage**: Simple, fast, clear call stack
- **Example**: `player.update(deltaTime)`

### Event Listeners (Asynchronous)
- **Used by**: InputHandler for keyboard events
- **Advantage**: Decouples input from game loop
- **Example**: `document.addEventListener('keydown', handler)`

### Data Passing (Stateless)
- **Used by**: Renderer and CollisionDetector
- **Advantage**: No side effects, easy to test
- **Example**: `renderer.render(state, player, walls, score)`

---

## Dependency Injection Points

### Game Constructor
```javascript
constructor() {
    // Create all components
    this.stateManager = new GameStateManager();
    this.player = new Player(x, y, image);
    this.wallManager = new WallManager(width, height);
    this.collisionDetector = new CollisionDetector();
    this.scoreManager = new ScoreManager();
    this.renderer = new Renderer(canvas, context);
    this.audioManager = new AudioManager();
    this.inputHandler = new InputHandler(
        this.player,
        this.stateManager,
        this.audioManager
    );
}
```

---

## Circular Dependency Prevention

### No Circular Dependencies
The architecture is designed to prevent circular dependencies:

- **Game** owns all components (one-way dependency)
- **InputHandler** receives references but doesn't create them
- **Components** don't reference each other directly
- **Data flows** through Game orchestrator

### Dependency Direction
```
Game (top level)
  ↓
Components (middle level)
  ↓
Utilities (bottom level)
```

---

## Testing Implications

### Unit Testing
- **GameStateManager**: Test in isolation (no dependencies)
- **Player**: Test physics in isolation
- **WallManager**: Test wall generation in isolation
- **CollisionDetector**: Test with mock data
- **ScoreManager**: Test in isolation

### Integration Testing
- **Game Loop**: Test component coordination
- **Input Flow**: Test InputHandler → Player → AudioManager
- **Collision Flow**: Test Player → CollisionDetector → StateManager

### Mocking Strategy
- Mock components when testing Game orchestration
- Use real components for integration tests
- Mock canvas context for Renderer tests

---

## Performance Considerations

### Minimal Indirection
- Direct method calls for performance
- No event bus overhead
- No unnecessary abstraction layers

### Efficient Data Flow
- Components updated in optimal order
- Collision detection only when PLAYING
- Rendering uses cached references

### Memory Management
- Components created once at initialization
- No dynamic component creation during gameplay
- Wall pooling in WallManager to avoid GC

