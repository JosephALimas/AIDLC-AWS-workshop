# Game Over Sprite Enhancement

## Overview
Implementation of visual feedback for game over state with dedicated sprite and player size increase.

## Requirements

### Functional Requirements
1. Display lose.png sprite when player dies
2. Increase player size for better visibility
3. Maintain proper sizing across all sprite states
4. Ensure smooth state transitions

### Visual Requirements
1. All sprites render at consistent size (120x120)
2. lose.png displays during GAME_OVER state
3. No distortion or stretching of sprites
4. Proper hitbox scaling

## Implementation Details

### Player Size
- **Previous**: 100x100 pixels
- **New**: 120x120 pixels
- **Increase**: 20%
- **Hitbox Tolerance**: 12 pixels (proportional increase)

### Sprite States
1. **GAME_OVER**: lose.png
2. **Power-up Active**: power_up.png (with golden aura)
3. **Score >= 5**: player.png
4. **Default**: ghosty.png

### Sprite Priority
```
GAME_OVER > Power-up Active > Score Milestone > Default
```

## Technical Specifications

### Constants Modified
```javascript
const PLAYER_SIZE = 120;        // Increased from 100
const HITBOX_TOLERANCE = 12;    // Increased from 10
```

### Sprite Loading
```javascript
this.playerSpriteLose = new Image();
this.playerSpriteLose.src = 'assets/lose.png';
```

### Sprite Selection Logic
```javascript
if (this.state === STATES.GAME_OVER) {
    currentSprite = this.playerSpriteLose;
} else if (this.doublePointsActive) {
    currentSprite = this.playerSpritePowerUp;
} else if (this.score >= 5) {
    currentSprite = this.playerSpriteAlt;
} else {
    currentSprite = this.playerSprite;
}
```

## Assets Required
- `assets/lose.png` - Game over sprite (120x120 recommended)
- All existing sprites scale to 120x120 automatically

## Game Flow

### Normal Gameplay
1. Player starts with ghosty.png (120x120)
2. At 5 points → player.png (120x120)
3. Collect power-up → power_up.png (120x120) with aura
4. Power-up expires → return to player.png or ghosty.png

### Game Over
1. Player collides → state changes to GAME_OVER
2. Sprite immediately changes to lose.png
3. lose.png displays on game over screen
4. New game → reset to ghosty.png

## Visual Consistency
- All sprites render at 120x120 pixels
- Hitbox scales proportionally
- No visual glitches during state transitions
- Consistent appearance across all states

## Testing Checklist
- [ ] lose.png displays on game over
- [ ] All sprites render at 120x120
- [ ] No distortion in any sprite
- [ ] Hitbox matches visual size
- [ ] State transitions are smooth
- [ ] Power-up aura scales correctly
- [ ] Sprite resets properly on new game

## Benefits
1. Better visibility with 20% larger player
2. Clear visual feedback for game over
3. Consistent sprite sizing
4. Professional game feel
5. Improved user experience

## Future Enhancements
- Death animation sequence
- Particle effects on collision
- Screen shake on game over
- Fade transition to lose sprite
