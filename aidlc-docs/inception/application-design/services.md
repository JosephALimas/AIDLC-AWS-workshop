# Flappy Kiro - Service Layer Design

## Service Layer Overview

For Flappy Kiro, the service layer is minimal due to the simple, self-contained nature of the game. The primary orchestration is handled by the **Game** component itself, which acts as the main service coordinator.

---

## Primary Service: Game Orchestrator

### Game Service
**Type**: Main orchestration service

**Purpose**: 
- Coordinate all game components
- Drive the game loop
- Manage component lifecycle
- Handle frame timing

**Responsibilities**:
1. **Initialization**: Create and initialize all components
2. **Game Loop Management**: Run requestAnimationFrame loop at 60 FPS
3. **Update Coordination**: Call update methods on all components in correct order
4. **Render Coordination**: Trigger rendering after updates
5. **State-Based Behavior**: Adjust behavior based on current game state

**Orchestration Flow**:
```
Game Loop (60 FPS)
    ↓
Check Game State
    ↓
If PLAYING:
    → Update Player physics
    → Update Wall positions
    → Check Collisions
    → Update Score if wall passed
    → Trigger Game Over if collision
    ↓
If PAUSED:
    → Skip updates, maintain state
    ↓
If MENU or GAME_OVER:
    → Wait for user input
    ↓
Render current state
    ↓
Request next frame
```

---

## Service Interactions

### Component Update Order
The Game service ensures components are updated in the correct sequence:

1. **Player.update()** - Update player position and physics
2. **WallManager.update()** - Update wall positions and generate new walls
3. **CollisionDetector.checkCollision()** - Check for collisions
4. **ScoreManager** - Update score if walls passed
5. **GameStateManager** - Transition state if collision detected
6. **Renderer.render()** - Draw everything

### State-Based Orchestration

#### MENU State
- Renderer draws menu screen
- InputHandler listens for Enter key to start
- No game updates occur

#### PLAYING State
- Full update cycle runs
- All components active
- InputHandler listens for spacebar (jump) and P/Escape (pause)

#### PAUSED State
- Updates suspended
- Renderer draws pause overlay
- InputHandler listens for P/Escape to resume

#### GAME_OVER State
- Updates suspended
- Renderer draws game over screen with scores
- InputHandler listens for Enter to restart

---

## Service Communication Patterns

### Direct Method Calls
The Game service uses direct method calls to components:
```javascript
// Example orchestration in game loop
update(deltaTime) {
    if (this.stateManager.isPlaying()) {
        this.player.update(deltaTime);
        this.wallManager.update(deltaTime);
        
        const collision = this.collisionDetector.checkCollision(
            this.player,
            this.wallManager.getWalls(),
            this.canvas.height
        );
        
        if (collision) {
            this.audioManager.playGameOver();
            this.stateManager.setState('GAME_OVER');
            this.stateManager.updateHighScore();
        }
        
        if (this.wallManager.checkWallPassed(this.player.getX())) {
            this.scoreManager.incrementScore();
            this.stateManager.setScore(this.scoreManager.getScore());
        }
    }
}
```

### Event-Based Communication
InputHandler uses direct event listeners but triggers component methods:
```javascript
// Example input handling
handleKeyDown(event) {
    if (event.key === ' ' && this.stateManager.isPlaying()) {
        this.player.jump();
        this.audioManager.playJump();
    }
    
    if (event.key === 'p' || event.key === 'Escape') {
        if (this.stateManager.isPlaying()) {
            this.stateManager.setState('PAUSED');
        } else if (this.stateManager.isPaused()) {
            this.stateManager.setState('PLAYING');
        }
    }
}
```

---

## Why Minimal Service Layer?

### Rationale for Simple Architecture

1. **Small Scope**: Single-player game with limited complexity
2. **No External Services**: No backend, APIs, or external integrations
3. **No Business Logic Layer**: Game logic is simple and contained in components
4. **Direct Communication**: Components can communicate directly without abstraction overhead
5. **Performance**: Minimal indirection for 60 FPS performance

### When Service Layer Would Expand

If Flappy Kiro were to grow, additional services might include:
- **SaveService**: Persistent storage for high scores
- **LeaderboardService**: Online leaderboard integration
- **AnalyticsService**: Track gameplay metrics
- **AssetService**: Dynamic asset loading
- **MultiplayerService**: Real-time multiplayer coordination

---

## Service Lifecycle

### Initialization Phase
```
1. Create Game instance
2. Game creates all component instances
3. Game loads assets (images, audio)
4. Game sets up canvas and context
5. Game initializes InputHandler
6. Game starts game loop
```

### Runtime Phase
```
Game Loop runs continuously:
- Check state
- Update components (if PLAYING)
- Render current state
- Request next frame
```

### Cleanup Phase
```
(If needed for page navigation)
1. Stop game loop
2. Remove event listeners
3. Clear canvas
4. Release resources
```

---

## Design Decisions

### Centralized Orchestration
**Decision**: Use Game component as primary orchestrator

**Rationale**:
- Simple and clear control flow
- Easy to understand and debug
- Sufficient for game scope
- Minimal overhead

### No Message Bus
**Decision**: Direct method calls instead of event bus

**Rationale**:
- Lower latency for 60 FPS performance
- Simpler debugging
- Clear call stack
- No need for complex event routing

### Stateful Service
**Decision**: Game service maintains component references

**Rationale**:
- Components need to interact frequently
- Dependency injection would add complexity
- Performance benefit from direct references
- Clear ownership model

---

## Summary

The service layer for Flappy Kiro is intentionally minimal, with the **Game** component serving as the primary orchestration service. This design provides:

- **Simplicity**: Easy to understand and maintain
- **Performance**: Direct calls for 60 FPS target
- **Clarity**: Clear component relationships
- **Flexibility**: Easy to extend if needed

The architecture is appropriate for the game's scope and can be expanded if requirements grow.

