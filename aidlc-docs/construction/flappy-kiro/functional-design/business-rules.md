# Flappy Kiro - Business Rules

## Physics Rules

### PR1: Gravity Rule
**Rule**: Gravity constantly pulls the player downward
- **Value**: 0.5 pixels/frame²
- **Application**: Every frame during PLAYING state
- **Formula**: `velocity += 0.5`
- **Effect**: Player accelerates downward continuously

### PR2: Jump Rule
**Rule**: Spacebar press applies upward velocity
- **Value**: -10 pixels/frame (negative = upward)
- **Application**: On spacebar keydown event
- **Formula**: `velocity = -10` (replaces current velocity)
- **Constraint**: Only active during PLAYING state
- **Side Effect**: Play jump sound effect

### PR3: Velocity Application Rule
**Rule**: Velocity updates player position each frame
- **Formula**: `y += velocity`
- **Application**: Every frame during PLAYING state
- **No Clamping**: Velocity can increase indefinitely (no terminal velocity)

### PR4: Position Update Rule
**Rule**: Player position updates based on physics
- **Horizontal**: Fixed at x=200 (no horizontal movement)
- **Vertical**: Updated by velocity each frame
- **Bounds**: No clamping until collision detection

---

## Wall Generation Rules

### WR1: Generation Timing Rule
**Rule**: New wall pairs generate at fixed intervals
- **Interval**: 120 frames (2 seconds at 60 FPS)
- **Trigger**: frameCounter >= 120
- **Reset**: frameCounter = 0 after generation
- **Initial Delay**: First wall generates after 120 frames

### WR2: Wall Dimensions Rule
**Rule**: All walls have fixed dimensions
- **Width**: 60 pixels
- **Gap Height**: 150 pixels
- **Top Wall Height**: Variable (0 to gapY)
- **Bottom Wall Height**: Variable (gapY + 150 to canvas bottom)


### WR3: Gap Position Randomization Rule
**Rule**: Gap vertical position is randomized within safe bounds
- **Minimum gapY**: 50 pixels (ensure top wall visible)
- **Maximum gapY**: 600 pixels (ensure bottom wall visible and gap fits)
- **Formula**: `gapY = Math.random() * (600 - 50) + 50`
- **Distribution**: Uniform random (completely random within bounds)
- **Validation**: Gap must be fully visible on canvas

### WR4: Wall Spawn Position Rule
**Rule**: Walls spawn at right edge of canvas
- **Spawn X**: 1200 pixels (canvas width)
- **Spawn Timing**: Every 120 frames
- **Initial State**: passed = false

### WR5: Wall Movement Rule
**Rule**: Walls scroll left at constant speed
- **Speed**: 2 pixels per frame (120 pixels/second at 60 FPS)
- **Formula**: `wall.x -= 2`
- **Application**: Every frame during PLAYING state
- **Pause Behavior**: Walls freeze during PAUSED state

### WR6: Wall Removal Rule
**Rule**: Walls are removed when off-screen
- **Condition**: `wall.x < -60` (wall width = 60)
- **Action**: Remove from walls array
- **Purpose**: Memory management and performance

---

## Collision Rules

### CR1: Hitbox Tolerance Rule
**Rule**: Player hitbox is smaller than sprite for forgiveness
- **Sprite Size**: 40x40 pixels
- **Hitbox Size**: 30x30 pixels
- **Tolerance**: 5 pixels on each side
- **Hitbox Position**: 
  - `hitbox.x = player.x + 5`
  - `hitbox.y = player.y + 5`
- **Rationale**: Makes game more forgiving and enjoyable


### CR2: Ground Collision Rule
**Rule**: Player collides with ground at bottom of canvas
- **Ground Position**: y = 750 (canvas height 800 - ground height 50)
- **Collision Condition**: `player.y + player.height >= 750`
- **Result**: Trigger GAME_OVER state
- **Visual**: Ground is visible (50px height)

### CR3: Ceiling Collision Rule
**Rule**: Player collides with ceiling at top of canvas
- **Ceiling Position**: y = 50
- **Collision Condition**: `player.y <= 50`
- **Result**: Trigger GAME_OVER state
- **Visual**: Ceiling is visible (50px height)

### CR4: Wall Collision Rule
**Rule**: Player collides with top or bottom wall sections
- **Detection Method**: Bounding box overlap
- **Check Frequency**: Every frame during PLAYING state
- **Collision Areas**:
  - Top wall: From y=50 to y=gapY
  - Bottom wall: From y=(gapY+150) to y=750
- **Result**: Trigger GAME_OVER state immediately

### CR5: Bounding Box Overlap Rule
**Rule**: Two boxes overlap if they intersect
- **Formula**:
  ```
  overlap = (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
  )
  ```
- **Application**: Used for all wall collision checks
- **Optimization**: Early exit on first collision found

---

## Scoring Rules

### SR1: Score Increment Rule
**Rule**: Score increases when player passes through wall gap
- **Trigger**: Player center X passes wall right edge
- **Condition**: `player.centerX > wall.x + wall.width && !wall.passed`
- **Increment**: +1 point per wall pair
- **One-Time**: Mark wall.passed = true to prevent double-counting


### SR2: Player Center Calculation Rule
**Rule**: Player center is calculated from position and dimensions
- **Formula**: `centerX = player.x + (player.width / 2)`
- **Value**: `centerX = player.x + 20`
- **Purpose**: Consistent scoring trigger point

### SR3: Score Reset Rule
**Rule**: Current score resets to 0 on game restart
- **Trigger**: Transition from MENU to PLAYING
- **Action**: `currentScore = 0`
- **High Score**: Remains unchanged

### SR4: High Score Update Rule
**Rule**: High score updates if current score exceeds it
- **Trigger**: Transition to GAME_OVER state
- **Condition**: `currentScore > highScore`
- **Action**: `highScore = currentScore`
- **Persistence**: Session-based only (not saved to storage)

### SR5: Score Display Rule
**Rule**: Score is displayed during gameplay and game over
- **During PLAYING**: Show current score
- **During GAME_OVER**: Show current score and high score
- **During MENU**: Show high score only (if > 0)
- **During PAUSED**: Show current score

---

## State Transition Rules

### ST1: Menu to Playing Rule
**Rule**: Game starts when user initiates play
- **Trigger**: Enter key press or Play button click in MENU state
- **Actions**:
  1. Set state to PLAYING
  2. Reset player position and velocity
  3. Clear all walls
  4. Reset frame counter
  5. Reset current score to 0
- **High Score**: Preserved

### ST2: Playing to Paused Rule
**Rule**: Game pauses when user presses pause key
- **Trigger**: P key or Escape key press in PLAYING state
- **Actions**:
  1. Set state to PAUSED
  2. Freeze all updates (player, walls)
  3. Display pause overlay
- **Preservation**: All game state preserved


### ST3: Paused to Playing Rule
**Rule**: Game resumes when user presses pause key again
- **Trigger**: P key or Escape key press in PAUSED state
- **Actions**:
  1. Set state to PLAYING
  2. Resume all updates
  3. Remove pause overlay
- **Preservation**: All game state preserved (position, score, walls)

### ST4: Playing to Game Over Rule
**Rule**: Game ends when collision is detected
- **Trigger**: Any collision (ground, ceiling, or wall)
- **Actions**:
  1. Set state to GAME_OVER
  2. Update high score if current score is higher
  3. Play game over sound effect
  4. Display game over screen with scores
  5. Freeze all updates
- **Immediate**: Transition happens instantly on collision

### ST5: Game Over to Menu Rule
**Rule**: Return to menu when user chooses to restart
- **Trigger**: Enter key press or Restart button click in GAME_OVER state
- **Actions**:
  1. Set state to MENU
  2. Display start menu
- **Note**: Actual game reset happens on next MENU → PLAYING transition

### ST6: Invalid Transition Rule
**Rule**: Some state transitions are not allowed
- **Forbidden**:
  - MENU → PAUSED (can't pause before starting)
  - MENU → GAME_OVER (can't game over before starting)
  - PAUSED → GAME_OVER (collision detection disabled while paused)
  - GAME_OVER → PLAYING (must go through MENU)
- **Enforcement**: State machine only allows valid transitions

---

## Boundary Rules

### BR1: Canvas Dimensions Rule
**Rule**: Game canvas has fixed dimensions
- **Width**: 1200 pixels
- **Height**: 800 pixels
- **Aspect Ratio**: 3:2
- **Responsive**: No (fixed size)


### BR2: Playable Area Rule
**Rule**: Playable area is bounded by ground and ceiling
- **Top Boundary**: y = 50 (ceiling height)
- **Bottom Boundary**: y = 750 (canvas height - ground height)
- **Playable Height**: 700 pixels
- **Visual Indicators**: Both ground and ceiling are visible

### BR3: Wall Spawn Boundary Rule
**Rule**: Walls spawn outside visible canvas area
- **Spawn X**: 1200 (at right edge)
- **Purpose**: Walls scroll into view smoothly
- **Visibility**: Walls become visible as they scroll left

### BR4: Wall Removal Boundary Rule
**Rule**: Walls are removed when completely off-screen
- **Removal X**: -60 (wall width past left edge)
- **Purpose**: Clean up memory and improve performance
- **Timing**: Checked every frame

---

## Input Rules

### IR1: Jump Input Rule
**Rule**: Spacebar triggers jump action
- **Key**: Spacebar (key code 32 or key ' ')
- **State Requirement**: Only active in PLAYING state
- **Action**: Set player velocity to JUMP_VELOCITY (-10)
- **Sound**: Play jump sound effect
- **Repeat Prevention**: No special handling needed (each press = new jump)

### IR2: Pause Input Rule
**Rule**: P or Escape key toggles pause
- **Keys**: 'p', 'P', or 'Escape'
- **State Requirement**: Only active in PLAYING or PAUSED states
- **Action**: Toggle between PLAYING and PAUSED
- **Sound**: No sound effect

### IR3: Start Input Rule
**Rule**: Enter key starts game from menu
- **Key**: 'Enter'
- **State Requirement**: Only active in MENU state
- **Action**: Transition to PLAYING and reset game
- **Sound**: No sound effect


### IR4: Restart Input Rule
**Rule**: Enter key restarts game from game over
- **Key**: 'Enter'
- **State Requirement**: Only active in GAME_OVER state
- **Action**: Transition to MENU
- **Sound**: No sound effect

### IR5: Input State Filtering Rule
**Rule**: Input is only processed in appropriate states
- **Spacebar**: Only in PLAYING
- **Pause Keys**: Only in PLAYING or PAUSED
- **Enter**: Only in MENU or GAME_OVER
- **Enforcement**: Check state before processing input

---

## Audio Rules

### AR1: Jump Sound Rule
**Rule**: Jump sound plays on every jump
- **Trigger**: Spacebar press in PLAYING state
- **Sound File**: jump.wav
- **Volume**: Default (1.0)
- **Overlap**: Allow (can play multiple times if pressed rapidly)

### AR2: Game Over Sound Rule
**Rule**: Game over sound plays on collision
- **Trigger**: Transition to GAME_OVER state
- **Sound File**: game_over.wav
- **Volume**: Default (1.0)
- **One-Time**: Plays once per game over

### AR3: Mute Rule
**Rule**: Audio can be muted/unmuted
- **Toggle**: M key (optional feature)
- **Effect**: Prevents all sound playback
- **Persistence**: Session-based
- **Default**: Unmuted

---

## Validation Rules

### VR1: Frame Rate Validation Rule
**Rule**: Game must maintain 60 FPS target
- **Target**: 60 frames per second
- **Tolerance**: ±5 FPS acceptable
- **Measurement**: Use requestAnimationFrame timing
- **Fallback**: No frame skipping (let browser handle timing)


### VR2: Asset Loading Validation Rule
**Rule**: All assets must load before game starts
- **Assets**: ghosty.png, jump.wav, game_over.wav
- **Validation**: Check asset load completion
- **Error Handling**: Display error message if assets fail to load
- **Retry**: Allow manual retry on failure

### VR3: Canvas Validation Rule
**Rule**: Canvas must be available and properly sized
- **Check**: Verify canvas element exists in DOM
- **Size**: Verify canvas is 1200x800
- **Context**: Verify 2D context is available
- **Error Handling**: Display error if canvas unavailable

### VR4: Browser Compatibility Validation Rule
**Rule**: Game requires modern browser features
- **Required Features**:
  - HTML5 Canvas
  - requestAnimationFrame
  - Audio API
  - ES6 JavaScript
- **Validation**: Check feature availability
- **Fallback**: Display compatibility message if features missing

---

## Edge Case Rules

### EC1: Rapid Jump Rule
**Rule**: Handle rapid spacebar presses
- **Behavior**: Each press resets velocity to JUMP_VELOCITY
- **No Cooldown**: No delay between jumps
- **Effect**: Player can "hover" by rapid pressing
- **Acceptable**: This is intended behavior

### EC2: Wall Overlap Rule
**Rule**: Multiple walls can be on screen simultaneously
- **Maximum**: ~6 walls visible at once (1200px / 200px spacing)
- **Collision**: Check all walls each frame
- **Performance**: Acceptable with small wall count

### EC3: Score Overflow Rule
**Rule**: Handle very high scores
- **Type**: JavaScript number (safe up to 2^53)
- **Practical Limit**: Unlikely to reach in normal gameplay
- **Display**: No special formatting needed


### EC4: Player Off-Screen Rule
**Rule**: Player can temporarily go off-screen vertically
- **Above Canvas**: Player can jump above y=0 (ceiling collision at y=50)
- **Below Canvas**: Player falls below canvas (ground collision at y=750)
- **Collision**: Triggers immediately when bounds are crossed
- **Visual**: Player may be partially visible at edges

### EC5: Pause During Collision Rule
**Rule**: Cannot pause during collision frame
- **Behavior**: Collision detection happens before input processing
- **Result**: Game transitions to GAME_OVER before pause can be triggered
- **Acceptable**: This is intended behavior

### EC6: Wall Generation at Start Rule
**Rule**: No walls present at game start
- **Initial State**: walls array is empty
- **First Wall**: Appears after 120 frames (2 seconds)
- **Purpose**: Give player time to prepare
- **Acceptable**: This is intended behavior

---

## Performance Rules

### PF1: Update Frequency Rule
**Rule**: All updates happen at 60 FPS
- **Player Physics**: Updated every frame
- **Wall Movement**: Updated every frame
- **Collision Detection**: Checked every frame
- **Rendering**: Rendered every frame

### PF2: Collision Optimization Rule
**Rule**: Optimize collision detection for performance
- **Early Exit**: Stop checking on first collision
- **Culling**: Only check visible walls
- **Hitbox**: Use simple bounding boxes (no pixel-perfect)

### PF3: Memory Management Rule
**Rule**: Manage memory efficiently
- **Wall Removal**: Remove off-screen walls immediately
- **No Pooling**: Simple array management sufficient
- **Asset Reuse**: Load assets once, reuse throughout session

