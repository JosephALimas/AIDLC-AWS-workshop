# Flappy Kiro - Business Logic Model

## Game Loop Algorithm

### Frame Timing
- **Target FPS**: 60 frames per second
- **Frame Duration**: ~16.67ms per frame
- **Implementation**: requestAnimationFrame for browser-optimized timing

### Game Loop Sequence
```
1. Calculate deltaTime since last frame
2. Check current game state
3. If state == PLAYING:
   a. Update player physics
   b. Update wall positions
   c. Check collisions
   d. Update score if wall passed
   e. Transition to GAME_OVER if collision
4. Render current state
5. Request next frame
```

### Pseudocode
```javascript
let lastTime = 0;

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    if (gameState === 'PLAYING') {
        updatePlayer(deltaTime);
        updateWalls(deltaTime);
        checkCollisions();
        checkScoring();
    }
    
    render();
    requestAnimationFrame(gameLoop);
}
```

---

## Player Physics Algorithm

### Constants
- **Gravity**: 0.5 pixels/frame²
- **Jump Velocity**: -10 pixels/frame (negative = upward)
- **Initial Position**: x=200, y=400 (center-left of canvas)


### Physics Update Algorithm
```
On each frame:
1. Apply gravity to velocity: velocity += GRAVITY
2. Update position: y += velocity
3. Clamp velocity to prevent extreme speeds (optional terminal velocity)
```

### Jump Algorithm
```
On spacebar press (if state == PLAYING):
1. Set velocity = JUMP_VELOCITY (-10)
2. Play jump sound effect
```

### Pseudocode
```javascript
class Player {
    constructor() {
        this.x = 200;
        this.y = 400;
        this.velocity = 0;
        this.GRAVITY = 0.5;
        this.JUMP_VELOCITY = -10;
    }
    
    update() {
        this.velocity += this.GRAVITY;
        this.y += this.velocity;
    }
    
    jump() {
        this.velocity = this.JUMP_VELOCITY;
    }
}
```

---

## Wall Generation Algorithm

### Constants
- **Generation Interval**: 120 frames (2 seconds at 60 FPS)
- **Wall Width**: 60 pixels
- **Gap Height**: 150 pixels
- **Initial Spawn X**: 1200 (right edge of canvas)

### Generation Logic
```
1. Initialize frame counter = 0
2. On each frame:
   a. Increment frame counter
   b. If counter >= 120:
      - Generate new wall pair
      - Reset counter to 0
```


### Wall Pair Structure
```
Wall Pair = {
    x: spawn position (1200),
    topWall: {
        x: wall x position,
        y: 0,
        width: 60,
        height: gapY
    },
    bottomWall: {
        x: wall x position,
        y: gapY + 150,
        width: 60,
        height: 800 - (gapY + 150)
    },
    passed: false (for scoring)
}
```

### Gap Position Randomization
```
1. Calculate safe bounds:
   - Minimum gapY: 50 (ensure top wall visible)
   - Maximum gapY: 800 - 150 - 50 = 600 (ensure bottom wall visible)
2. Generate random gapY: Math.random() * (600 - 50) + 50
3. Create wall pair with calculated gapY
```

### Pseudocode
```javascript
class WallManager {
    constructor() {
        this.walls = [];
        this.frameCounter = 0;
        this.GENERATION_INTERVAL = 120;
    }
    
    update() {
        this.frameCounter++;
        if (this.frameCounter >= this.GENERATION_INTERVAL) {
            this.generateWall();
            this.frameCounter = 0;
        }
    }
    
    generateWall() {
        const gapY = Math.random() * (600 - 50) + 50;
        this.walls.push({
            x: 1200,
            gapY: gapY,
            passed: false
        });
    }
}
```

---


## Wall Movement Algorithm

### Constants
- **Scroll Speed**: 2 pixels per frame (120 pixels/second at 60 FPS)

### Movement Logic
```
On each frame:
1. For each wall in walls array:
   a. wall.x -= SCROLL_SPEED
2. Remove walls where x < -wall.width (off-screen left)
```

### Pseudocode
```javascript
updateWalls() {
    for (let wall of this.walls) {
        wall.x -= 2; // SCROLL_SPEED
    }
    
    // Remove off-screen walls
    this.walls = this.walls.filter(wall => wall.x > -60);
}
```

---

## Collision Detection Algorithm

### Player Hitbox (with tolerance)
- **Actual Size**: 40x40 pixels
- **Collision Hitbox**: 30x30 pixels (5px tolerance on each side)
- **Hitbox Calculation**:
  - hitbox.x = player.x + 5
  - hitbox.y = player.y + 5
  - hitbox.width = 30
  - hitbox.height = 30

### Collision Checks

#### 1. Ground Collision
```
if (player.y + player.height >= CANVAS_HEIGHT - GROUND_HEIGHT):
    collision = true
```

#### 2. Ceiling Collision
```
if (player.y <= CEILING_HEIGHT):
    collision = true
```


#### 3. Wall Collision (Bounding Box)
```
For each wall:
    // Check top wall collision
    if (playerHitbox overlaps topWall):
        collision = true
    
    // Check bottom wall collision
    if (playerHitbox overlaps bottomWall):
        collision = true
```

### Bounding Box Overlap Algorithm
```
function boxesOverlap(box1, box2):
    return (
        box1.x < box2.x + box2.width &&
        box1.x + box1.width > box2.x &&
        box1.y < box2.y + box2.height &&
        box1.y + box1.height > box2.y
    )
```

### Complete Collision Check Pseudocode
```javascript
checkCollisions() {
    const hitbox = {
        x: player.x + 5,
        y: player.y + 5,
        width: 30,
        height: 30
    };
    
    // Ground collision
    if (player.y + 40 >= 750) return true; // 800 - 50 ground height
    
    // Ceiling collision
    if (player.y <= 50) return true; // 50px ceiling height
    
    // Wall collisions
    for (let wall of walls) {
        const topWall = {x: wall.x, y: 0, width: 60, height: wall.gapY};
        const bottomWall = {x: wall.x, y: wall.gapY + 150, width: 60, height: 800 - (wall.gapY + 150)};
        
        if (boxesOverlap(hitbox, topWall) || boxesOverlap(hitbox, bottomWall)) {
            return true;
        }
    }
    
    return false;
}
```

---


## Scoring Logic Algorithm

### Score Increment Condition
```
For each wall:
    if (!wall.passed && player.centerX > wall.x + wall.width):
        score++
        wall.passed = true
```

### Player Center Calculation
```
player.centerX = player.x + (player.width / 2)
              = player.x + 20
```

### Pseudocode
```javascript
checkScoring() {
    const playerCenterX = player.x + 20;
    
    for (let wall of walls) {
        if (!wall.passed && playerCenterX > wall.x + 60) {
            score++;
            wall.passed = true;
        }
    }
}
```

### Score Reset Logic
```
On game restart:
1. currentScore = 0
2. Keep highScore unchanged (session-based)
```

### High Score Update
```
On game over:
if (currentScore > highScore):
    highScore = currentScore
```

---

## State Transition Logic

### State Machine
```
States: MENU, PLAYING, PAUSED, GAME_OVER

Transitions:
- MENU → PLAYING: User presses Enter or clicks Play button
- PLAYING → PAUSED: User presses P or Escape
- PAUSED → PLAYING: User presses P or Escape again
- PLAYING → GAME_OVER: Collision detected
- GAME_OVER → MENU: User presses Enter or clicks Restart
```


### State Transition Pseudocode
```javascript
function handleStateTransition(event) {
    switch (currentState) {
        case 'MENU':
            if (event === 'START') {
                currentState = 'PLAYING';
                resetGame();
            }
            break;
            
        case 'PLAYING':
            if (event === 'PAUSE') {
                currentState = 'PAUSED';
            } else if (event === 'COLLISION') {
                currentState = 'GAME_OVER';
                updateHighScore();
                playGameOverSound();
            }
            break;
            
        case 'PAUSED':
            if (event === 'RESUME') {
                currentState = 'PLAYING';
            }
            break;
            
        case 'GAME_OVER':
            if (event === 'RESTART') {
                currentState = 'MENU';
            }
            break;
    }
}
```

### Reset Game Logic
```
function resetGame() {
    player.x = 200;
    player.y = 400;
    player.velocity = 0;
    walls = [];
    frameCounter = 0;
    currentScore = 0;
}
```

---

## Performance Considerations

### 60 FPS Target
- All algorithms designed for O(n) or better complexity
- Wall array size limited (max ~10 walls on screen)
- Collision checks optimized with early exits
- No dynamic memory allocation during gameplay

### Optimization Strategies
1. **Object Pooling**: Reuse wall objects instead of creating new ones
2. **Early Exit**: Stop collision checking on first collision found
3. **Culling**: Remove off-screen walls immediately
4. **Fixed Time Step**: Use deltaTime for frame-rate independence

