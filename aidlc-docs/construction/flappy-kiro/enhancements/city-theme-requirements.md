# City Theme Enhancement Requirements

## Overview
Transform Flappy Kiro from retro-futuristic theme to city theme with BMW branding elements.

## Visual Theme Changes

### 1. Background
- City skyline with buildings in background
- Urban atmosphere
- Day/dusk color scheme

### 2. Obstacles (Pipes → Buildings)
- Replace pipe obstacles with building structures
- Buildings should have windows and urban details
- Maintain collision mechanics

### 3. Ground
- Urban street/road appearance
- City ground texture

## New Gameplay Features

### 1. BMW Cars (Ground Obstacles)
- **Spawn Timing**: Random intervals
- **Movement**: Horizontal across ground
- **Collision**: Touching car = game over
- **Visual**: BMW car sprite/shape

### 2. Power-Up System
- **Type**: Double points power-up
- **Icon**: BMW logo/shield
- **Spawn Rate**: Every 10-30 buildings (random)
- **Effect**: 2x score multiplier
- **Duration**: Temporary (needs definition)

### 3. Personal Best Display
- **Location**: Top left corner
- **Content**: "Personal Best: [score]"
- **Persistence**: Session-based
- **Update**: When current score exceeds personal best

## Implementation Notes
- Maintain 60 FPS performance
- Keep existing collision detection logic
- Add new collision check for cars
- Implement power-up collection detection
- Add score multiplier system
