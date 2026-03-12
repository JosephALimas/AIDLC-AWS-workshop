# Functional Design Plan - Flappy Kiro

## Design Scope
This plan covers the detailed business logic design for Flappy Kiro game. We'll define precise algorithms, data models, business rules, and validation logic.

---

## Functional Design Questions

### Physics and Game Mechanics

#### Question 1: Gravity and Jump Physics
What specific values should be used for gravity and jump velocity?

A) Gravity: 0.5 pixels/frame², Jump: -10 pixels/frame
B) Gravity: 0.8 pixels/frame², Jump: -12 pixels/frame
C) Gravity: 1.0 pixels/frame², Jump: -15 pixels/frame
D) Other (please specify values after [Answer]: tag below)

[Answer]: A

#### Question 2: Wall Generation Timing
How frequently should new wall pairs be generated?

A) Every 2 seconds (120 frames at 60 FPS)
B) Every 2.5 seconds (150 frames)
C) Every 3 seconds (180 frames)
D) Other (please specify timing after [Answer]: tag below)

[Answer]: A


#### Question 3: Wall Dimensions and Gap Size
What should be the wall width and gap height?

A) Wall width: 60px, Gap height: 150px
B) Wall width: 80px, Gap height: 180px
C) Wall width: 100px, Gap height: 200px
D) Other (please specify dimensions after [Answer]: tag below)

[Answer]: A

#### Question 4: Wall Scroll Speed
How fast should walls scroll from right to left?

A) 2 pixels per frame (120 pixels/second at 60 FPS)
B) 3 pixels per frame (180 pixels/second)
C) 4 pixels per frame (240 pixels/second)
D) Other (please specify speed after [Answer]: tag below)

[Answer]: A

#### Question 5: Player (Ghosty) Dimensions
What should be the player sprite dimensions for collision detection?

A) 40x40 pixels (square)
B) 50x50 pixels (square)
C) Match actual sprite dimensions from ghosty.png
D) Other (please specify dimensions after [Answer]: tag below)

[Answer]: A


### Collision Detection

#### Question 6: Collision Detection Precision
Should collision detection use exact bounding boxes or have a small tolerance?

A) Exact bounding box (pixel-perfect)
B) Slight tolerance (reduce hitbox by 5px on each side for forgiveness)
C) Moderate tolerance (reduce hitbox by 10px on each side)
D) Other (please specify approach after [Answer]: tag below)

[Answer]: B

### Scoring Logic

#### Question 7: Score Increment Timing
When exactly should the score increment?

A) When player's center passes wall's right edge
B) When player's left edge passes wall's right edge
C) When player's right edge passes wall's right edge
D) Other (please specify timing after [Answer]: tag below)

[Answer]: A


### Game State and Boundaries

#### Question 8: Canvas Dimensions
What should be the game canvas size?

A) 800x600 pixels
B) 1000x600 pixels
C) 1200x800 pixels
D) Other (please specify dimensions after [Answer]: tag below)

[Answer]: C

#### Question 9: Ground and Ceiling
Should there be visible ground and ceiling, or just collision boundaries?

A) Visible ground at bottom, no ceiling (collision at y=0)
B) Visible ground and ceiling
C) No visible boundaries, just collision detection
D) Other (please specify approach after [Answer]: tag below)

[Answer]: B

#### Question 10: Wall Gap Position Randomization
How should the gap vertical position be randomized?

A) Completely random within safe bounds (gap fully visible)
B) Random with bias toward center
C) Random from predefined positions (easy, medium, hard heights)
D) Other (please specify approach after [Answer]: tag below)

[Answer]: A


---

## Design Artifacts Checklist

### Business Logic Model
- [x] Define game loop algorithm and frame timing
- [x] Define player physics algorithm (gravity, jump, velocity)
- [x] Define wall generation algorithm
- [x] Define wall movement algorithm
- [x] Define collision detection algorithm
- [x] Define scoring logic algorithm
- [x] Define state transition logic
- [x] Create business-logic-model.md artifact

### Domain Entities
- [x] Define Player entity (position, velocity, dimensions)
- [x] Define Wall entity (position, dimensions, gap position)
- [x] Define GameState entity (state, score, high score)
- [x] Define entity relationships and data flow
- [x] Create domain-entities.md artifact

### Business Rules
- [x] Define physics rules (gravity constant, jump velocity, terminal velocity)
- [x] Define wall generation rules (timing, spacing, gap size)
- [x] Define collision rules (what constitutes a collision)
- [x] Define scoring rules (when to increment, how to track)
- [x] Define state transition rules (when to change states)
- [x] Define boundary rules (canvas limits, ground/ceiling)
- [x] Create business-rules.md artifact

### Validation
- [x] Verify all game mechanics are precisely defined
- [x] Ensure algorithms support 60 FPS performance
- [x] Validate business rules are complete and unambiguous
- [x] Check that all edge cases are addressed

---

## Instructions

Please answer the functional design questions above by filling in your letter choice after each [Answer]: tag. If you choose "Other", please provide specific details. Let me know when you're done!

