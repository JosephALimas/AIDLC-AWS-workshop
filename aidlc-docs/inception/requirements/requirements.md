# Flappy Kiro - Requirements Document

## Intent Analysis Summary

### User Request
Build a Flappy Bird clone called "Flappy Kiro" - an arcade-style game where the player controls a ghost character named Ghosty navigating through walls with gaps.

### Request Type
New Project - Greenfield game development

### Scope Estimate
Single Component - Standalone web-based game application

### Complexity Estimate
Simple - Clear game mechanics with well-defined implementation path

---

## Functional Requirements

### FR1: Core Gameplay Mechanics
- **FR1.1**: Ghosty character moves persistently to the right at constant horizontal speed
- **FR1.2**: Ghosty automatically descends due to gravity
- **FR1.3**: Player presses spacebar to make Ghosty ascend (jump)
- **FR1.4**: Walls appear with equally sized gaps at random vertical positions
- **FR1.5**: Player must navigate Ghosty through wall gaps
- **FR1.6**: Each successful pass through a wall pair awards 1 point
- **FR1.7**: Collision with wall or ground ends the game

### FR2: Game Controls
- **FR2.1**: Spacebar key triggers jump action
- **FR2.2**: Pause functionality using P key or Escape key

### FR3: User Interface
- **FR3.1**: Start menu with "Play" button and game instructions
- **FR3.2**: Real-time score display during gameplay
- **FR3.3**: Game over screen showing final score and restart option
- **FR3.4**: High score display (session-based, not persisted)

### FR4: Visual Design
- **FR4.1**: Simple, minimalist graphics style
- **FR4.2**: Use provided ghosty.png asset for player character
- **FR4.3**: Simple colored rectangles for walls
- **FR4.4**: Clean, readable UI elements

### FR5: Audio
- **FR5.1**: Play jump.wav sound effect when player jumps
- **FR5.2**: Play game_over.wav sound effect when game ends
- **FR5.3**: Audio should be optional/mutable

### FR6: Game States
- **FR6.1**: Menu state - display start menu
- **FR6.2**: Playing state - active gameplay
- **FR6.3**: Paused state - gameplay frozen, resume option available
- **FR6.4**: Game Over state - display results and restart option

---

## Non-Functional Requirements

### NFR1: Platform & Technology
- **NFR1.1**: Web browser platform (HTML5/Canvas)
- **NFR1.2**: Vanilla JavaScript implementation (no frameworks)
- **NFR1.3**: HTML5 Canvas for rendering
- **NFR1.4**: Compatible with modern browsers (Chrome, Firefox, Safari, Edge)

### NFR2: Performance
- **NFR2.1**: Smooth 60 FPS gameplay
- **NFR2.2**: Responsive controls with minimal input lag
- **NFR2.3**: Fast load time (< 2 seconds)
- **NFR2.4**: Fixed difficulty - no dynamic speed/gap adjustments

### NFR3: Usability
- **NFR3.1**: Simple, intuitive controls (single key gameplay)
- **NFR3.2**: Clear visual feedback for game states
- **NFR3.3**: Easy restart mechanism after game over

### NFR4: Maintainability
- **NFR4.1**: Clean, readable code structure
- **NFR4.2**: Modular game components (player, walls, collision detection, etc.)
- **NFR4.3**: Well-commented code for future modifications

### NFR5: Accessibility
- **NFR5.1**: Keyboard-only controls (no mouse required)
- **NFR5.2**: Clear visual contrast for game elements
- **NFR5.3**: Optional audio (can be muted)

---

## Technical Constraints

### TC1: Asset Requirements
- Use existing assets: ghosty.png, jump.wav, game_over.wav
- All assets located in /assets directory

### TC2: File Structure
- Single HTML file for game structure
- Separate JavaScript file for game logic
- Separate CSS file for styling (if needed)
- Assets in /assets directory

### TC3: Dependencies
- No external libraries or frameworks
- Pure vanilla JavaScript and HTML5 Canvas

---

## Game Rules & Logic

### Scoring System
- +1 point for each wall pair successfully passed
- Score resets to 0 on game restart
- High score tracked during current session only

### Collision Detection
- Collision with top wall = game over
- Collision with bottom wall = game over
- Collision with ground = game over
- Ghosty passing through gap = score increment

### Physics
- Constant gravity pulling Ghosty downward
- Jump provides upward velocity boost
- Horizontal movement is automatic and constant
- No momentum or acceleration (simple physics)

### Wall Generation
- Walls spawn at regular intervals
- Gap size is fixed and consistent
- Gap vertical position is randomized
- Walls scroll left at constant speed

---

## Out of Scope

The following features are explicitly excluded from this version:
- Persistent high score storage (local storage or database)
- Online leaderboards
- Multiple difficulty levels
- Mobile touch controls
- Multiplayer functionality
- Power-ups or special abilities
- Multiple characters or skins
- Background music
- Progressive difficulty (speed/gap changes)

---

## Success Criteria

The project will be considered successful when:
1. Game runs smoothly in web browser at 60 FPS
2. All core gameplay mechanics function correctly
3. Collision detection works accurately
4. Score tracking displays correctly
5. Sound effects play at appropriate times
6. Pause functionality works as expected
7. Game can be restarted after game over
8. Visual style is clean and minimalist
9. Controls are responsive and intuitive
10. Code is clean, modular, and well-documented

