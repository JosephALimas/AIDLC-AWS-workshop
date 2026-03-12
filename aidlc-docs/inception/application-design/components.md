# Flappy Kiro - Component Architecture

## Component Overview

This document defines the main functional components of Flappy Kiro and their high-level responsibilities.

---

## Core Components

### 1. Game Component
**Purpose**: Main game orchestrator and entry point

**Responsibilities**:
- Initialize all game components
- Manage the game loop using requestAnimationFrame
- Coordinate between components
- Handle frame timing and FPS management
- Trigger state transitions

**Key Characteristics**:
- Single instance (singleton pattern)
- Owns references to all other components
- Drives the game loop at 60 FPS

---

### 2. GameStateManager Component
**Purpose**: Centralized game state management

**Responsibilities**:
- Track current game state (MENU, PLAYING, PAUSED, GAME_OVER)
- Manage state transitions
- Store game session data (current score, high score)
- Provide state query methods
- Notify components of state changes

**Key Characteristics**:
- Single source of truth for game state
- Immutable state transitions
- Session-based score tracking

**State Machine**:
```
MENU → PLAYING → PAUSED → PLAYING
              ↓
         GAME_OVER → MENU
```

---

### 3. Player Component
**Purpose**: Represents Ghosty character and manages player physics

**Responsibilities**:
- Track player position (x, y coordinates)
- Apply gravity physics
- Handle jump velocity
- Update position each frame
- Provide collision bounds
- Listen for spacebar input directly

**Key Characteristics**:
- Constant horizontal movement (handled by wall scrolling)
- Simple physics (gravity + jump velocity)
- Bounding box for collision detection

---

### 4. WallManager Component
**Purpose**: Manages wall generation, positioning, and lifecycle

**Responsibilities**:
- Generate wall pairs at regular intervals
- Update wall positions (scroll left)
- Remove off-screen walls
- Provide wall collision bounds
- Randomize gap positions
- Track which walls have been passed for scoring

**Key Characteristics**:
- Pool of active walls
- Fixed gap size
- Random gap vertical position
- Constant scroll speed

---

### 5. CollisionDetector Component
**Purpose**: Detect collisions between player and obstacles

**Responsibilities**:
- Check player vs wall collisions
- Check player vs ground collisions
- Check player vs ceiling collisions
- Use bounding box collision detection
- Return collision results

**Key Characteristics**:
- Stateless collision checking
- Efficient bounding box algorithm
- Called every frame during PLAYING state

---

### 6. ScoreManager Component
**Purpose**: Track and manage scoring

**Responsibilities**:
- Track current score
- Track session high score
- Detect when player passes through walls
- Update score on successful passes
- Reset score on game restart
- Provide score query methods

**Key Characteristics**:
- Session-based persistence only
- Simple increment logic
- Coordinates with WallManager to detect passes

---

### 7. Renderer Component
**Purpose**: Handle all canvas drawing operations

**Responsibilities**:
- Clear canvas each frame
- Draw background
- Draw player (Ghosty sprite)
- Draw walls
- Draw UI elements (score, menu, game over screen)
- Handle different rendering for each game state
- Manage canvas context

**Key Characteristics**:
- Single centralized rendering
- State-aware rendering (different UI per state)
- Uses HTML5 Canvas 2D context
- Draws at 60 FPS

---

### 8. AudioManager Component
**Purpose**: Centralized audio playback management

**Responsibilities**:
- Load audio assets (jump.wav, game_over.wav)
- Play sound effects on demand
- Handle audio muting/unmuting
- Manage audio state
- Prevent audio errors

**Key Characteristics**:
- Preloads audio files
- Provides simple play methods
- Handles browser audio restrictions
- Optional mute functionality

---

### 9. InputHandler Component
**Purpose**: Manage keyboard input for game controls

**Responsibilities**:
- Listen for spacebar (jump)
- Listen for P/Escape (pause)
- Listen for Enter (menu interactions)
- Handle input only in appropriate game states
- Prevent default browser behaviors

**Key Characteristics**:
- Direct event listeners on document
- State-aware input handling
- Prevents key repeat issues

---

## Component Relationships

### Primary Orchestrator
- **Game** component owns and coordinates all other components

### State Management
- **GameStateManager** is queried by all components to determine behavior

### Game Loop Flow
1. **Game** drives the loop
2. **Player** updates position
3. **WallManager** updates wall positions
4. **CollisionDetector** checks for collisions
5. **ScoreManager** updates score if walls passed
6. **Renderer** draws everything
7. **AudioManager** plays sounds when triggered

### Input Flow
- **InputHandler** listens for keyboard events
- Directly triggers **Player** jump
- Directly triggers **GameStateManager** state changes (pause, restart)

---

## Design Rationale

### Centralized State Management
Using a single GameStateManager provides:
- Clear state transitions
- Single source of truth
- Easy debugging
- Predictable behavior

### Centralized Rendering
Using a single Renderer provides:
- Consistent drawing order
- Easier canvas management
- Better performance (single context)
- Simplified state-based rendering

### Direct Input Listeners
Using direct event listeners in components provides:
- Simpler architecture for this small game
- Lower latency for player input
- Less indirection

### Centralized Audio
Using AudioManager provides:
- Consistent audio handling
- Easy mute functionality
- Better error handling
- Preloading management

