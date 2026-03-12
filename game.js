// Game Constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const GROUND_HEIGHT = 80;
const CEILING_HEIGHT = 50;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -10;
const WALL_WIDTH = 80;
let GAP_HEIGHT = 300; // Will be set based on difficulty
const WALL_SPEED = 2;
const WALL_GENERATION_INTERVAL = 150; // Increased from 120 for more spacing
const PLAYER_SIZE = 120;
const HITBOX_TOLERANCE = 12;

// Difficulty settings
const DIFFICULTY_SETTINGS = {
    easy: { gap: 350, name: 'Easy' },
    medium: { gap: 280, name: 'Medium' },
    hard: { gap: 220, name: 'Hard' }
};

// New constants for city theme
const CAR_WIDTH = 100;
const CAR_HEIGHT = 40;
const CAR_SPEED = 3;
const CAR_MIN_SPAWN_INTERVAL = 240; // 4 seconds
const CAR_MAX_SPAWN_INTERVAL = 420; // 7 seconds
const POWERUP_SIZE = 40;
const POWERUP_MIN_INTERVAL = 5; // buildings (más frecuente)
const POWERUP_MAX_INTERVAL = 12; // buildings (más frecuente)
const DOUBLE_POINTS_DURATION = 300; // 5 seconds at 60 FPS

// Car colors
const CAR_COLORS = [
    { body: ['#0066CC', '#0052A3', '#003D7A'], name: 'blue' },
    { body: ['#CC0000', '#A30000', '#7A0000'], name: 'red' },
    { body: ['#1A1A1A', '#0A0A0A', '#000000'], name: 'black' },
    { body: ['#FFFFFF', '#E0E0E0', '#C0C0C0'], name: 'white' }
];

// Game States
const STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

// Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // UI Elements
        this.menuScreen = document.getElementById('menu');
        this.gameOverScreen = document.getElementById('gameOver');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.scoreDisplay = document.getElementById('score');
        this.playButton = document.getElementById('playButton');
        this.restartButton = document.getElementById('restartButton');
        
        // Game State
        this.state = STATES.MENU;
        this.score = 0;
        this.highScore = 0;
        this.personalBest = 0;
        this.frameCounter = 0;
        this.carSpawnCounter = 0;
        this.buildingCounter = 0;
        this.nextPowerUpAt = this.getRandomPowerUpInterval();
        this.difficulty = 'easy'; // Default difficulty
        
        // Game Objects
        this.player = null;
        this.walls = [];
        this.cars = [];
        this.powerUps = [];
        this.doublePointsActive = false;
        this.doublePointsTimer = 0;
        this.lives = 0; // Lives system for power-up
        this.maxLives = 3;
        
        // Power-up animation
        this.powerUpAnimation = {
            active: false,
            timer: 0,
            duration: 120, // 2 seconds
            scale: 0
        };
        
        // Background parallax
        this.backgroundOffset = 0;
        this.backgroundBuildings = this.generateBackgroundBuildings();
        
        // Clouds
        this.clouds = this.generateClouds();
        this.cloudOffset = 0;
        
        // Trees
        this.trees = this.generateTrees();
        this.treeOffset = 0;
        
        // Street animation
        this.streetOffset = 0;
        
        // Particle effects
        this.particles = [];
        
        // Car spawn timing
        this.nextCarSpawn = this.getRandomCarSpawnInterval();
        
        // Audio
        this.jumpSound = new Audio('assets/jump.wav');
        this.gameOverSound = new Audio('assets/game_over.wav');
        
        // Load player sprite
        this.playerSprite = new Image();
        this.playerSprite.src = 'assets/ghosty.png';
        
        // Load alternate player sprite (unlocked at 5 points)
        this.playerSpriteAlt = new Image();
        this.playerSpriteAlt.src = 'assets/player.png';
        
        // Load power-up player sprite
        this.playerSpritePowerUp = new Image();
        this.playerSpritePowerUp.src = 'assets/power_up.png';
        
        // Load game over sprite
        this.playerSpriteLose = new Image();
        this.playerSpriteLose.src = 'assets/lose.png';
        
        this.init();
    }
    
    init() {
        // Event Listeners
        this.playButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.returnToMenu());
        
        // Difficulty selector
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                difficultyButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                // Set difficulty
                this.difficulty = e.target.dataset.difficulty;
            });
        });
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Start game loop
        this.gameLoop();
    }
    
    getRandomPowerUpInterval() {
        return Math.floor(Math.random() * (POWERUP_MAX_INTERVAL - POWERUP_MIN_INTERVAL + 1)) + POWERUP_MIN_INTERVAL;
    }
    
    generateBackgroundBuildings() {
        const buildings = [];
        const buildingTypes = [
            { color: '#3A3A4A', windowColor: 'rgba(255, 215, 0, 0.3)' },
            { color: '#4A4A5A', windowColor: 'rgba(255, 215, 0, 0.35)' },
            { color: '#2A2A3A', windowColor: 'rgba(255, 215, 0, 0.25)' },
            { color: '#5A5A6A', windowColor: 'rgba(255, 200, 100, 0.3)' },
            { color: '#4A3A2A', windowColor: 'rgba(255, 180, 80, 0.4)' } // Edificio amarillento
        ];
        
        for (let i = 0; i < 15; i++) {
            const type = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
            
            // Pre-generate static window pattern for this building
            const windowPattern = [];
            const rows = Math.floor((100 + Math.random() * 200) / 25);
            const cols = Math.floor((80 + Math.random() * 40) / 25);
            
            for (let row = 0; row < rows; row++) {
                windowPattern[row] = [];
                for (let col = 0; col < cols; col++) {
                    windowPattern[row][col] = Math.random() > 0.25; // 75% lit
                }
            }
            
            buildings.push({
                x: i * 100,
                width: 80 + Math.random() * 40,
                height: 100 + Math.random() * 200,
                color: type.color,
                windowColor: type.windowColor,
                windowPattern: windowPattern
            });
        }
        return buildings;
    }
    
    generateClouds() {
        const clouds = [];
        for (let i = 0; i < 8; i++) {
            clouds.push({
                x: i * 200 + Math.random() * 100,
                y: 50 + Math.random() * 150,
                width: 80 + Math.random() * 60,
                height: 40 + Math.random() * 30
            });
        }
        return clouds;
    }
    
    generateTrees() {
        const trees = [];
        for (let i = 0; i < 12; i++) {
            trees.push({
                x: i * 100 + 50, // Offset to place between buildings
                width: 30 + Math.random() * 20,
                height: 60 + Math.random() * 40,
                type: Math.floor(Math.random() * 2) // 2 tree types
            });
        }
        return trees;
    }
    
    drawTree(x, y, width, height, type) {
        // Tree trunk with more natural shape
        const trunkWidth = width * 0.25;
        const trunkHeight = height * 0.45;
        const trunkX = x + (width - trunkWidth) / 2;
        const trunkY = y + height - trunkHeight;
        
        // Trunk gradient
        const trunkGradient = this.ctx.createLinearGradient(trunkX, trunkY, trunkX + trunkWidth, trunkY);
        trunkGradient.addColorStop(0, '#4A3728');
        trunkGradient.addColorStop(0.3, '#5D4037');
        trunkGradient.addColorStop(0.7, '#6D4C41');
        trunkGradient.addColorStop(1, '#4A3728');
        this.ctx.fillStyle = trunkGradient;
        
        // Draw trunk with slight curve
        this.ctx.beginPath();
        this.ctx.moveTo(trunkX + trunkWidth * 0.3, trunkY);
        this.ctx.quadraticCurveTo(trunkX + trunkWidth / 2, trunkY + trunkHeight / 2, trunkX + trunkWidth * 0.4, trunkY + trunkHeight);
        this.ctx.lineTo(trunkX + trunkWidth * 0.6, trunkY + trunkHeight);
        this.ctx.quadraticCurveTo(trunkX + trunkWidth / 2, trunkY + trunkHeight / 2, trunkX + trunkWidth * 0.7, trunkY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Tree foliage with organic shapes
        const foliageY = y;
        const foliageHeight = height * 0.65;
        
        if (type === 0) {
            // Organic round tree with multiple circles
            const centerX = x + width / 2;
            const centerY = foliageY + foliageHeight / 2;
            
            // Main foliage blob
            this.ctx.fillStyle = '#2E7D32';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, width * 0.45, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Additional organic blobs
            this.ctx.fillStyle = '#388E3C';
            this.ctx.beginPath();
            this.ctx.arc(centerX - width * 0.25, centerY - height * 0.1, width * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(centerX + width * 0.25, centerY - height * 0.05, width * 0.28, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(centerX - width * 0.15, centerY + height * 0.15, width * 0.32, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(centerX + width * 0.2, centerY + height * 0.12, width * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Highlights for depth
            this.ctx.fillStyle = '#66BB6A';
            this.ctx.beginPath();
            this.ctx.arc(centerX - width * 0.15, centerY - height * 0.15, width * 0.2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#81C784';
            this.ctx.beginPath();
            this.ctx.arc(centerX + width * 0.1, centerY - height * 0.1, width * 0.15, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Organic pine tree with layered triangles
            const centerX = x + width / 2;
            
            // Bottom layer
            this.ctx.fillStyle = '#1B5E20';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, foliageY + foliageHeight * 0.3);
            this.ctx.lineTo(centerX - width * 0.55, foliageY + foliageHeight);
            this.ctx.lineTo(centerX + width * 0.55, foliageY + foliageHeight);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Middle layer
            this.ctx.fillStyle = '#2E7D32';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, foliageY + foliageHeight * 0.15);
            this.ctx.lineTo(centerX - width * 0.45, foliageY + foliageHeight * 0.7);
            this.ctx.lineTo(centerX + width * 0.45, foliageY + foliageHeight * 0.7);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Top layer
            this.ctx.fillStyle = '#388E3C';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, foliageY);
            this.ctx.lineTo(centerX - width * 0.35, foliageY + foliageHeight * 0.5);
            this.ctx.lineTo(centerX + width * 0.35, foliageY + foliageHeight * 0.5);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Highlights
            this.ctx.fillStyle = '#66BB6A';
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - width * 0.05, foliageY + foliageHeight * 0.2);
            this.ctx.lineTo(centerX - width * 0.2, foliageY + foliageHeight * 0.45);
            this.ctx.lineTo(centerX + width * 0.1, foliageY + foliageHeight * 0.45);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Soft shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + width / 2, y + height + 2, width * 0.4, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawCloud(x, y, width, height) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // Cloud made of circles
        this.ctx.beginPath();
        this.ctx.arc(x + width * 0.25, y + height * 0.6, height * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.5, y + height * 0.4, height * 0.6, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.75, y + height * 0.6, height * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    getRandomCarSpawnInterval() {
        return Math.floor(Math.random() * (CAR_MAX_SPAWN_INTERVAL - CAR_MIN_SPAWN_INTERVAL + 1)) + CAR_MIN_SPAWN_INTERVAL;
    }
    
    startGame() {
        // Set gap height based on difficulty
        GAP_HEIGHT = DIFFICULTY_SETTINGS[this.difficulty].gap;
        
        this.state = STATES.PLAYING;
        this.score = 0;
        this.frameCounter = 0;
        this.carSpawnCounter = 0;
        this.buildingCounter = 0;
        this.nextPowerUpAt = this.getRandomPowerUpInterval();
        this.nextCarSpawn = this.getRandomCarSpawnInterval();
        this.walls = [];
        this.cars = [];
        this.powerUps = [];
        this.particles = [];
        this.doublePointsActive = false;
        this.doublePointsTimer = 0;
        this.lives = 0;
        this.backgroundOffset = 0;
        this.cloudOffset = 0;
        this.treeOffset = 0;
        this.streetOffset = 0;
        this.powerUpAnimation.active = false;
        this.powerUpAnimation.timer = 0;
        
        // Create player
        this.player = {
            x: 200,
            y: 400,
            velocity: 0,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE
        };
        
        // Update UI
        this.menuScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.scoreDisplay.classList.remove('hidden');
        this.scoreDisplay.textContent = '0';
    }
    
    returnToMenu() {
        this.state = STATES.MENU;
        this.gameOverScreen.classList.add('hidden');
        this.menuScreen.classList.remove('hidden');
        this.scoreDisplay.classList.add('hidden');
    }
    
    handleKeyDown(e) {
        if (e.key === ' ' && this.state === STATES.PLAYING) {
            e.preventDefault();
            this.player.velocity = JUMP_VELOCITY;
            this.jumpSound.currentTime = 0;
            this.jumpSound.play().catch(() => {});
            
            // Create jump particles
            this.createJumpParticles();
        }
        
        if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && 
            (this.state === STATES.PLAYING || this.state === STATES.PAUSED)) {
            e.preventDefault();
            this.togglePause();
        }
        
        if (e.key === 'Enter' && this.state === STATES.MENU) {
            this.startGame();
        }
        
        if (e.key === 'Enter' && this.state === STATES.GAME_OVER) {
            this.returnToMenu();
        }
    }
    
    togglePause() {
        if (this.state === STATES.PLAYING) {
            this.state = STATES.PAUSED;
            this.pauseScreen.classList.remove('hidden');
        } else if (this.state === STATES.PAUSED) {
            this.state = STATES.PLAYING;
            this.pauseScreen.classList.add('hidden');
        }
    }
    
    update() {
        if (this.state !== STATES.PLAYING) return;
        
        // Update player physics
        this.player.velocity += GRAVITY;
        this.player.y += this.player.velocity;
        
        // Update background parallax (slower than foreground)
        this.backgroundOffset -= WALL_SPEED * 0.3;
        if (this.backgroundOffset <= -100) {
            this.backgroundOffset = 0;
        }
        
        // Update clouds (even slower)
        this.cloudOffset -= WALL_SPEED * 0.15;
        if (this.cloudOffset <= -200) {
            this.cloudOffset = 0;
        }
        
        // Update trees (same speed as background buildings)
        this.treeOffset -= WALL_SPEED * 0.3;
        if (this.treeOffset <= -100) {
            this.treeOffset = 0;
        }
        
        // Update street animation
        this.streetOffset += WALL_SPEED;
        if (this.streetOffset >= 35) { // Reset when pattern completes (20 + 15)
            this.streetOffset = 0;
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravity on particles
            particle.life--;
            particle.alpha -= 0.02;
            
            if (particle.life <= 0 || particle.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update power-up animation
        if (this.powerUpAnimation.active) {
            this.powerUpAnimation.timer--;
            
            // Scale animation (grow then shrink)
            if (this.powerUpAnimation.timer > this.powerUpAnimation.duration * 0.7) {
                this.powerUpAnimation.scale += 0.1;
            } else {
                this.powerUpAnimation.scale -= 0.05;
            }
            
            if (this.powerUpAnimation.timer <= 0) {
                this.powerUpAnimation.active = false;
            }
        }
        
        // Update double points timer
        if (this.doublePointsActive) {
            this.doublePointsTimer--;
            if (this.doublePointsTimer <= 0) {
                this.doublePointsActive = false;
                this.lives = 0; // Reset lives when power-up expires
            }
        }
        
        // Update walls (buildings)
        this.frameCounter++;
        if (this.frameCounter >= WALL_GENERATION_INTERVAL) {
            this.generateWall();
            this.frameCounter = 0;
            this.buildingCounter++;
            
            // Guaranteed power-up on building 2
            if (this.buildingCounter === 2) {
                this.generatePowerUp();
            }
            // Random power-ups after building 2
            else if (this.buildingCounter >= this.nextPowerUpAt && this.buildingCounter > 2) {
                this.generatePowerUp();
                this.buildingCounter = 2; // Reset counter but keep building 2 as base
                this.nextPowerUpAt = this.getRandomPowerUpInterval() + 2;
            }
        }
        
        for (let wall of this.walls) {
            wall.x -= WALL_SPEED;
        }
        
        // Remove off-screen walls
        this.walls = this.walls.filter(wall => wall.x > -WALL_WIDTH);
        
        // Update cars
        this.carSpawnCounter++;
        if (this.carSpawnCounter >= this.nextCarSpawn) {
            this.generateCar();
            this.carSpawnCounter = 0;
            this.nextCarSpawn = this.getRandomCarSpawnInterval();
        }
        
        for (let car of this.cars) {
            car.x += CAR_SPEED;
        }
        
        // Remove off-screen cars
        this.cars = this.cars.filter(car => car.x < CANVAS_WIDTH + CAR_WIDTH);
        
        // Update power-ups
        for (let powerUp of this.powerUps) {
            powerUp.x -= WALL_SPEED;
        }
        
        // Remove off-screen power-ups
        this.powerUps = this.powerUps.filter(powerUp => powerUp.x > -POWERUP_SIZE);
        
        // Check power-up collection
        this.checkPowerUpCollection();
        
        // Check collisions
        if (this.checkCollisions()) {
            this.gameOver();
            return;
        }
        
        // Check scoring
        this.checkScoring();
    }
    
    generateCar() {
        const colorScheme = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
        
        this.cars.push({
            x: -CAR_WIDTH,
            y: CANVAS_HEIGHT - GROUND_HEIGHT - CAR_HEIGHT,
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
            color: colorScheme
        });
    }
    
    generatePowerUp() {
        if (this.walls.length > 0) {
            const lastWall = this.walls[this.walls.length - 1];
            const gapCenterY = lastWall.gapY + (GAP_HEIGHT / 2) - (POWERUP_SIZE / 2);
            
            this.powerUps.push({
                x: lastWall.x + WALL_WIDTH / 2 - POWERUP_SIZE / 2,
                y: gapCenterY,
                width: POWERUP_SIZE,
                height: POWERUP_SIZE,
                collected: false
            });
        }
    }
    
    checkPowerUpCollection() {
        for (let powerUp of this.powerUps) {
            if (!powerUp.collected && this.boxesOverlap(this.player, powerUp)) {
                powerUp.collected = true;
                this.doublePointsActive = true;
                this.doublePointsTimer = DOUBLE_POINTS_DURATION;
                this.lives = this.maxLives; // Grant 3 lives
                
                // Trigger power-up animation
                this.powerUpAnimation.active = true;
                this.powerUpAnimation.timer = this.powerUpAnimation.duration;
                this.powerUpAnimation.scale = 0;
                
                // Remove collected power-up
                this.powerUps = this.powerUps.filter(p => p !== powerUp);
            }
        }
    }
    
    checkCollisions() {
        // Player hitbox with tolerance
        const hitbox = {
            x: this.player.x + HITBOX_TOLERANCE,
            y: this.player.y + HITBOX_TOLERANCE,
            width: this.player.width - (HITBOX_TOLERANCE * 2),
            height: this.player.height - (HITBOX_TOLERANCE * 2)
        };
        
        // Ground collision
        if (this.player.y + this.player.height >= CANVAS_HEIGHT - GROUND_HEIGHT) {
            return this.handleCollision();
        }
        
        // Ceiling collision
        if (this.player.y <= CEILING_HEIGHT) {
            return this.handleCollision();
        }
        
        // Wall collisions (buildings)
        for (let wall of this.walls) {
            const topWall = {
                x: wall.x,
                y: CEILING_HEIGHT,
                width: WALL_WIDTH,
                height: wall.gapY - CEILING_HEIGHT
            };
            
            const bottomWall = {
                x: wall.x,
                y: wall.gapY + GAP_HEIGHT,
                width: WALL_WIDTH,
                height: CANVAS_HEIGHT - GROUND_HEIGHT - (wall.gapY + GAP_HEIGHT)
            };
            
            if (this.boxesOverlap(hitbox, topWall) || this.boxesOverlap(hitbox, bottomWall)) {
                return this.handleCollision();
            }
        }
        
        // Car collisions
        for (let car of this.cars) {
            if (this.boxesOverlap(hitbox, car)) {
                return this.handleCollision();
            }
        }
        
        return false;
    }
    
    handleCollision() {
        // If player has lives (power-up active), lose one life instead of dying
        if (this.lives > 0) {
            this.lives--;
            
            // Create damage particles
            this.createDamageParticles();
            
            // If no lives left, deactivate power-up
            if (this.lives <= 0) {
                this.doublePointsActive = false;
                this.doublePointsTimer = 0;
            }
            
            return false; // Don't end game
        }
        
        return true; // End game
    }
    
    createDamageParticles() {
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 2;
            
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 3,
                color: `rgba(255, 100, 100, ${0.8 + Math.random() * 0.2})`,
                life: 25 + Math.random() * 15,
                alpha: 1
            });
        }
    }
    
    boxesOverlap(box1, box2) {
        return (
            box1.x < box2.x + box2.width &&
            box1.x + box1.width > box2.x &&
            box1.y < box2.y + box2.height &&
            box1.y + box1.height > box2.y
        );
    }
    
    checkScoring() {
        const playerCenterX = this.player.x + (this.player.width / 2);
        
        for (let wall of this.walls) {
            if (!wall.passed && playerCenterX > wall.x + WALL_WIDTH) {
                const points = this.doublePointsActive ? 2 : 1;
                this.score += points;
                wall.passed = true;
                this.scoreDisplay.textContent = this.score;
                
                // Update personal best
                if (this.score > this.personalBest) {
                    this.personalBest = this.score;
                }
            }
        }
    }
    
    generateWall() {
        const minGapY = CEILING_HEIGHT + 50;
        const maxGapY = CANVAS_HEIGHT - GROUND_HEIGHT - GAP_HEIGHT - 50;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        
        this.walls.push({
            x: CANVAS_WIDTH,
            gapY: gapY,
            passed: false
        });
    }
    
    createJumpParticles() {
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.PI + (Math.random() - 0.5) * Math.PI; // Downward spread
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: `rgba(255, 255, 255, ${0.8 + Math.random() * 0.2})`,
                life: 30 + Math.random() * 20,
                alpha: 1
            });
        }
    }
    
    gameOver() {
        this.state = STATES.GAME_OVER;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        
        // Play game over sound
        this.gameOverSound.currentTime = 0;
        this.gameOverSound.play().catch(() => {});
        
        // Update UI
        document.getElementById('finalScore').textContent = `Score: ${this.score}`;
        document.getElementById('highScore').textContent = `High Score: ${this.highScore}`;
        this.gameOverScreen.classList.remove('hidden');
        this.scoreDisplay.classList.add('hidden');
    }
    
    render() {
        // Clear canvas - Vibrant city sky background with gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        skyGradient.addColorStop(0, '#4A90E2');      // Bright blue at top
        skyGradient.addColorStop(0.3, '#87CEEB');    // Sky blue
        skyGradient.addColorStop(0.6, '#B0D8F0');    // Light blue
        skyGradient.addColorStop(0.8, '#E6F3FF');    // Very light blue
        skyGradient.addColorStop(1, '#FFF8DC');      // Warm cream at horizon
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw clouds with parallax
        for (let cloud of this.clouds) {
            const x = cloud.x + this.cloudOffset;
            
            // Wrap clouds around
            let drawX = x % (CANVAS_WIDTH + 400);
            if (drawX < -cloud.width) {
                drawX += CANVAS_WIDTH + 400;
            }
            
            this.drawCloud(drawX, cloud.y, cloud.width, cloud.height);
            
            // Draw second instance for seamless loop
            if (drawX > CANVAS_WIDTH - 200) {
                this.drawCloud(drawX - (CANVAS_WIDTH + 400), cloud.y, cloud.width, cloud.height);
            }
        }
        
        // Background city skyline with parallax
        for (let building of this.backgroundBuildings) {
            const x = building.x + this.backgroundOffset;
            
            // Wrap buildings around
            let drawX = x % (this.backgroundBuildings.length * 100);
            if (drawX < -building.width) {
                drawX += this.backgroundBuildings.length * 100;
            }
            
            // Draw building
            this.ctx.fillStyle = building.color;
            this.ctx.fillRect(
                drawX, 
                CANVAS_HEIGHT - GROUND_HEIGHT - building.height, 
                building.width, 
                building.height
            );
            
            // Add depth with gradient overlay
            const depthGradient = this.ctx.createLinearGradient(drawX, 0, drawX + building.width, 0);
            depthGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
            depthGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
            depthGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            this.ctx.fillStyle = depthGradient;
            this.ctx.fillRect(
                drawX, 
                CANVAS_HEIGHT - GROUND_HEIGHT - building.height, 
                building.width, 
                building.height
            );
            
            // Draw windows on background buildings (more detailed)
            const bgWindowRows = Math.floor(building.height / 25);
            const bgWindowCols = Math.floor(building.width / 25);
            for (let row = 0; row < bgWindowRows; row++) {
                for (let col = 0; col < bgWindowCols; col++) {
                    const wx = drawX + col * 25 + 8;
                    const wy = CANVAS_HEIGHT - GROUND_HEIGHT - building.height + row * 25 + 8;
                    
                    // Window frame
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    this.ctx.fillRect(wx - 1, wy - 1, 11, 13);
                    
                    // Use pre-generated static window pattern
                    const isLit = building.windowPattern[row] && building.windowPattern[row][col];
                    if (isLit) {
                        this.ctx.fillStyle = building.windowColor;
                        this.ctx.fillRect(wx, wy, 9, 11);
                        
                        // Window reflection
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                        this.ctx.fillRect(wx + 1, wy + 1, 7, 4);
                    } else {
                        this.ctx.fillStyle = 'rgba(20, 40, 60, 0.4)';
                        this.ctx.fillRect(wx, wy, 9, 11);
                    }
                }
            }
            
            // Add building top detail
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.fillRect(drawX, CANVAS_HEIGHT - GROUND_HEIGHT - building.height, building.width, 3);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(drawX, CANVAS_HEIGHT - GROUND_HEIGHT - building.height, building.width, 1);
            
            // Subtle outline to buildings
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                drawX, 
                CANVAS_HEIGHT - GROUND_HEIGHT - building.height, 
                building.width, 
                building.height
            );
            
            // Draw second instance for seamless loop
            if (drawX < CANVAS_WIDTH && drawX + building.width > 0) {
                const drawX2 = drawX + this.backgroundBuildings.length * 100;
                if (drawX2 < CANVAS_WIDTH) {
                    this.ctx.fillStyle = building.color;
                    this.ctx.fillRect(
                        drawX2, 
                        CANVAS_HEIGHT - GROUND_HEIGHT - building.height, 
                        building.width, 
                        building.height
                    );
                    
                    // Add depth with gradient overlay
                    const depthGradient2 = this.ctx.createLinearGradient(drawX2, 0, drawX2 + building.width, 0);
                    depthGradient2.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
                    depthGradient2.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
                    depthGradient2.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
                    this.ctx.fillStyle = depthGradient2;
                    this.ctx.fillRect(
                        drawX2, 
                        CANVAS_HEIGHT - GROUND_HEIGHT - building.height, 
                        building.width, 
                        building.height
                    );
                    
                    // Windows for second instance
                    const bgWindowRows2 = Math.floor(building.height / 25);
                    const bgWindowCols2 = Math.floor(building.width / 25);
                    for (let row = 0; row < bgWindowRows2; row++) {
                        for (let col = 0; col < bgWindowCols2; col++) {
                            const wx = drawX2 + col * 25 + 8;
                            const wy = CANVAS_HEIGHT - GROUND_HEIGHT - building.height + row * 25 + 8;
                            
                            // Window frame
                            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                            this.ctx.fillRect(wx - 1, wy - 1, 11, 13);
                            
                            // Use same static window pattern
                            const isLit = building.windowPattern[row] && building.windowPattern[row][col];
                            if (isLit) {
                                this.ctx.fillStyle = building.windowColor;
                                this.ctx.fillRect(wx, wy, 9, 11);
                                
                                // Window reflection
                                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                                this.ctx.fillRect(wx + 1, wy + 1, 7, 4);
                            } else {
                                this.ctx.fillStyle = 'rgba(20, 40, 60, 0.4)';
                                this.ctx.fillRect(wx, wy, 9, 11);
                            }
                        }
                    }
                    
                    // Add building top detail
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    this.ctx.fillRect(drawX2, CANVAS_HEIGHT - GROUND_HEIGHT - building.height, building.width, 3);
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    this.ctx.fillRect(drawX2, CANVAS_HEIGHT - GROUND_HEIGHT - building.height, building.width, 1);
                    
                    // Outline for second instance
                    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(
                        drawX2, 
                        CANVAS_HEIGHT - GROUND_HEIGHT - building.height, 
                        building.width, 
                        building.height
                    );
                }
            }
        }
        
        // Draw trees between buildings with parallax
        for (let tree of this.trees) {
            const x = tree.x + this.treeOffset;
            
            // Wrap trees around
            let drawX = x % (this.trees.length * 100);
            if (drawX < -tree.width) {
                drawX += this.trees.length * 100;
            }
            
            this.drawTree(drawX, CANVAS_HEIGHT - GROUND_HEIGHT - tree.height, tree.width, tree.height, tree.type);
            
            // Draw second instance for seamless loop
            if (drawX > CANVAS_WIDTH - 200) {
                this.drawTree(drawX - (this.trees.length * 100), CANVAS_HEIGHT - GROUND_HEIGHT - tree.height, tree.width, tree.height, tree.type);
            }
        }
        
        // Draw ceiling - Sky border
        this.ctx.fillStyle = '#4A90A4';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CEILING_HEIGHT);
        
        // Draw ground - Street
        const streetGradient = this.ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
        streetGradient.addColorStop(0, '#4A4A4A');
        streetGradient.addColorStop(1, '#2A2A2A');
        this.ctx.fillStyle = streetGradient;
        this.ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
        
        // Street markings with animation (moving with game)
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 15]);
        this.ctx.lineDashOffset = -this.streetOffset; // Animate the dashes
        this.ctx.beginPath();
        this.ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT + 20);
        this.ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT + 20);
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset dash pattern
        this.ctx.lineDashOffset = 0; // Reset offset
        
        if (this.state === STATES.PLAYING || this.state === STATES.PAUSED || this.state === STATES.GAME_OVER) {
            // Draw buildings (walls)
            for (let wall of this.walls) {
                this.drawBuilding(wall);
            }
            
            // Draw BMW cars
            for (let car of this.cars) {
                this.drawBMWCar(car);
            }
            
            // Draw power-ups
            for (let powerUp of this.powerUps) {
                if (!powerUp.collected) {
                    this.drawBMWPowerUp(powerUp);
                }
            }
            
            // Draw particles
            for (let particle of this.particles) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
            
            // Draw player with power-up aura if active
            if (this.doublePointsActive) {
                this.drawPowerUpAura();
            }
            
            // Draw player with appropriate sprite based on state
            let currentSprite;
            let spriteSize = this.player.width; // Default size
            
            if (this.state === STATES.GAME_OVER) {
                currentSprite = this.playerSpriteLose;
            } else if (this.doublePointsActive) {
                currentSprite = this.playerSpritePowerUp;
                spriteSize = this.player.width * 0.85; // 15% smaller for power-up sprite
            } else {
                currentSprite = this.playerSprite;
            }
            
            if (currentSprite && currentSprite.complete) {
                // Center the sprite if it's smaller
                const offsetX = (this.player.width - spriteSize) / 2;
                const offsetY = (this.player.height - spriteSize) / 2;
                
                this.ctx.drawImage(
                    currentSprite, 
                    this.player.x + offsetX, 
                    this.player.y + offsetY, 
                    spriteSize, 
                    spriteSize
                );
            } else {
                // Fallback
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            }
            
            // Draw personal best
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText(`Personal Best: ${this.personalBest}`, 20, 30);
            
            // Draw lives indicator when power-up is active
            if (this.doublePointsActive && this.lives > 0) {
                this.drawLivesIndicator();
            }
            
            // Draw power-up animation
            if (this.powerUpAnimation.active) {
                this.drawPowerUpAnimation();
            }
            
            // Draw double points indicator
            if (this.doublePointsActive) {
                this.ctx.fillStyle = '#0066CC';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.fillText('2X POINTS!', CANVAS_WIDTH / 2 - 60, 50);
            }
        }
    }
    
    drawPowerUpAnimation() {
        const centerX = CANVAS_WIDTH / 2;
        const centerY = CANVAS_HEIGHT / 2;
        
        // Calculate alpha based on timer
        const progress = this.powerUpAnimation.timer / this.powerUpAnimation.duration;
        const alpha = Math.min(1, progress * 2);
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(this.powerUpAnimation.scale, this.powerUpAnimation.scale);
        
        // Neon glow effect
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = '#00FFFF';
        
        // Main text with gradient
        const gradient = this.ctx.createLinearGradient(-150, -30, 150, 30);
        gradient.addColorStop(0, '#FF00FF');
        gradient.addColorStop(0.5, '#00FFFF');
        gradient.addColorStop(1, '#FF00FF');
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = gradient;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PUNTUACIÓN DOBLE', 0, 0);
        
        // Outline for extra neon effect
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText('PUNTUACIÓN DOBLE', 0, 0);
        
        // Secondary glow
        this.ctx.shadowBlur = 50;
        this.ctx.shadowColor = '#FF00FF';
        this.ctx.strokeText('PUNTUACIÓN DOBLE', 0, 0);
        
        this.ctx.restore();
    }
    
    drawPowerUpAura() {
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        const time = Date.now() / 1000;
        
        // Pulsating aura effect
        const pulseScale = 1 + Math.sin(time * 8) * 0.15;
        const auraRadius = (this.player.width / 2 + 15) * pulseScale;
        
        // Outer glow (large, faint)
        const outerGradient = this.ctx.createRadialGradient(
            centerX, centerY, this.player.width / 2,
            centerX, centerY, auraRadius + 20
        );
        outerGradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
        outerGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
        outerGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        this.ctx.fillStyle = outerGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, auraRadius + 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Middle glow (medium, brighter)
        const middleGradient = this.ctx.createRadialGradient(
            centerX, centerY, this.player.width / 2,
            centerX, centerY, auraRadius
        );
        middleGradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
        middleGradient.addColorStop(0.7, 'rgba(255, 165, 0, 0.3)');
        middleGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        this.ctx.fillStyle = middleGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner glow (small, brightest)
        const innerGradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, this.player.width / 2 + 5
        );
        innerGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        innerGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.5)');
        innerGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        this.ctx.fillStyle = innerGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.player.width / 2 + 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rotating sparkles
        for (let i = 0; i < 8; i++) {
            const angle = (time * 2 + i * Math.PI / 4) % (Math.PI * 2);
            const sparkleX = centerX + Math.cos(angle) * (auraRadius - 5);
            const sparkleY = centerY + Math.sin(angle) * (auraRadius - 5);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Sparkle glow
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(sparkleX, sparkleY, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawLivesIndicator() {
        const startX = 20;
        const startY = 60;
        const heartSize = 30;
        const spacing = 40;
        
        for (let i = 0; i < this.maxLives; i++) {
            const x = startX + i * spacing;
            const y = startY;
            const isFilled = i < this.lives;
            
            this.drawHeart(x, y, heartSize, isFilled);
        }
        
        // Lives text
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Lives:', startX, startY - 10);
    }
    
    drawHeart(x, y, size, filled) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Heart shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, size * 0.3);
        
        // Left curve
        this.ctx.bezierCurveTo(
            -size * 0.5, -size * 0.2,
            -size * 0.5, size * 0.3,
            0, size * 0.7
        );
        
        // Right curve
        this.ctx.bezierCurveTo(
            size * 0.5, size * 0.3,
            size * 0.5, -size * 0.2,
            0, size * 0.3
        );
        
        this.ctx.closePath();
        
        if (filled) {
            // Filled heart (red gradient)
            const gradient = this.ctx.createLinearGradient(0, -size * 0.2, 0, size * 0.7);
            gradient.addColorStop(0, '#FF6B6B');
            gradient.addColorStop(1, '#C92A2A');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(-size * 0.15, size * 0.1, size * 0.15, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Empty heart (gray outline)
            this.ctx.strokeStyle = '#999';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            this.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
            this.ctx.fill();
        }
        
        // Heart outline
        this.ctx.strokeStyle = filled ? '#8B0000' : '#666';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawBuilding(wall) {
        // Building body with more detailed gradient
        const buildingGradient = this.ctx.createLinearGradient(wall.x, 0, wall.x + WALL_WIDTH, 0);
        buildingGradient.addColorStop(0, '#4A4A4A');
        buildingGradient.addColorStop(0.3, '#5A5A5A');
        buildingGradient.addColorStop(0.5, '#6A6A6A');
        buildingGradient.addColorStop(0.7, '#5A5A5A');
        buildingGradient.addColorStop(1, '#4A4A4A');
        
        // Top building
        const topHeight = wall.gapY - CEILING_HEIGHT;
        
        // Main building body
        this.ctx.fillStyle = buildingGradient;
        this.ctx.fillRect(wall.x, CEILING_HEIGHT, WALL_WIDTH, topHeight);
        
        // Building edge highlights (3D effect)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(wall.x, CEILING_HEIGHT, 3, topHeight);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(wall.x + WALL_WIDTH - 3, CEILING_HEIGHT, 3, topHeight);
        
        // Windows for top building (more detailed)
        const windowRows = Math.floor(topHeight / 30);
        const windowCols = 3;
        const windowWidth = 18;
        const windowHeight = 22;
        const windowSpacingX = (WALL_WIDTH - (windowCols * windowWidth)) / (windowCols + 1);
        const windowSpacingY = 30;
        
        // Generate static window pattern for this wall if not exists
        if (!wall.windowPattern) {
            wall.windowPattern = [];
            for (let row = 0; row < windowRows; row++) {
                wall.windowPattern[row] = [];
                for (let col = 0; col < windowCols; col++) {
                    wall.windowPattern[row][col] = Math.random() > 0.2; // 80% lit
                }
            }
        }
        
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const wx = wall.x + windowSpacingX + col * (windowWidth + windowSpacingX);
                const wy = CEILING_HEIGHT + windowSpacingY * (row + 0.5);
                
                // Window frame (dark)
                this.ctx.fillStyle = '#2A2A2A';
                this.ctx.fillRect(wx - 1, wy - 1, windowWidth + 2, windowHeight + 2);
                
                // Window glass (lit or dark) - use static pattern
                const isLit = wall.windowPattern[row][col];
                if (isLit) {
                    const windowGradient = this.ctx.createLinearGradient(wx, wy, wx, wy + windowHeight);
                    windowGradient.addColorStop(0, '#FFE680');
                    windowGradient.addColorStop(0.5, '#FFD700');
                    windowGradient.addColorStop(1, '#FFA500');
                    this.ctx.fillStyle = windowGradient;
                } else {
                    this.ctx.fillStyle = '#1A3A4A';
                }
                this.ctx.fillRect(wx, wy, windowWidth, windowHeight);
                
                // Window reflection
                if (isLit) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(wx + 2, wy + 2, windowWidth - 4, windowHeight / 3);
                }
                
                // Window divider
                this.ctx.strokeStyle = '#2A2A2A';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(wx + windowWidth / 2, wy);
                this.ctx.lineTo(wx + windowWidth / 2, wy + windowHeight);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(wx, wy + windowHeight / 2);
                this.ctx.lineTo(wx + windowWidth, wy + windowHeight / 2);
                this.ctx.stroke();
            }
        }
        
        // Building top edge detail
        this.ctx.fillStyle = '#3A3A3A';
        this.ctx.fillRect(wall.x, CEILING_HEIGHT, WALL_WIDTH, 4);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(wall.x, CEILING_HEIGHT, WALL_WIDTH, 1);
        
        // Building outline
        this.ctx.strokeStyle = '#2A2A2A';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(wall.x, CEILING_HEIGHT, WALL_WIDTH, topHeight);
        
        // Bottom building (same detailed treatment)
        const bottomStart = wall.gapY + GAP_HEIGHT;
        const bottomHeight = CANVAS_HEIGHT - GROUND_HEIGHT - bottomStart;
        
        // Main building body
        this.ctx.fillStyle = buildingGradient;
        this.ctx.fillRect(wall.x, bottomStart, WALL_WIDTH, bottomHeight);
        
        // Building edge highlights (3D effect)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(wall.x, bottomStart, 3, bottomHeight);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(wall.x + WALL_WIDTH - 3, bottomStart, 3, bottomHeight);
        
        // Windows for bottom building
        const bottomWindowRows = Math.floor(bottomHeight / 30);
        for (let row = 0; row < bottomWindowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const wx = wall.x + windowSpacingX + col * (windowWidth + windowSpacingX);
                const wy = bottomStart + windowSpacingY * (row + 0.5);
                
                // Window frame
                this.ctx.fillStyle = '#2A2A2A';
                this.ctx.fillRect(wx - 1, wy - 1, windowWidth + 2, windowHeight + 2);
                
                // Window glass - use static pattern
                const isLit = wall.windowPattern[row] && wall.windowPattern[row][col];
                if (isLit) {
                    const windowGradient = this.ctx.createLinearGradient(wx, wy, wx, wy + windowHeight);
                    windowGradient.addColorStop(0, '#FFE680');
                    windowGradient.addColorStop(0.5, '#FFD700');
                    windowGradient.addColorStop(1, '#FFA500');
                    this.ctx.fillStyle = windowGradient;
                } else {
                    this.ctx.fillStyle = '#1A3A4A';
                }
                this.ctx.fillRect(wx, wy, windowWidth, windowHeight);
                
                // Window reflection
                if (isLit) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(wx + 2, wy + 2, windowWidth - 4, windowHeight / 3);
                }
                
                // Window divider
                this.ctx.strokeStyle = '#2A2A2A';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(wx + windowWidth / 2, wy);
                this.ctx.lineTo(wx + windowWidth / 2, wy + windowHeight);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(wx, wy + windowHeight / 2);
                this.ctx.lineTo(wx + windowWidth, wy + windowHeight / 2);
                this.ctx.stroke();
            }
        }
        
        // Building bottom edge detail
        this.ctx.fillStyle = '#3A3A3A';
        this.ctx.fillRect(wall.x, bottomStart, WALL_WIDTH, 4);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(wall.x, bottomStart, WALL_WIDTH, 1);
        
        // Building outline
        this.ctx.strokeStyle = '#2A2A2A';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(wall.x, bottomStart, WALL_WIDTH, bottomHeight);
    }
    
    drawBMWCar(car) {
        // Shadow under car
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.ellipse(car.x + car.width / 2, car.y + car.height - 2, car.width / 2 - 5, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Car body with detailed gradient
        const carGradient = this.ctx.createLinearGradient(car.x, car.y, car.x, car.y + car.height);
        carGradient.addColorStop(0, car.color.body[0]);
        carGradient.addColorStop(0.3, car.color.body[1]);
        carGradient.addColorStop(0.7, car.color.body[2]);
        carGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        this.ctx.fillStyle = carGradient;
        
        // Main body with rounded corners
        this.ctx.beginPath();
        this.ctx.roundRect(car.x + 10, car.y + 10, car.width - 20, car.height - 20, 4);
        this.ctx.fill();
        
        // Car body highlight (glossy effect)
        const highlightGradient = this.ctx.createLinearGradient(car.x, car.y + 10, car.x, car.y + 20);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = highlightGradient;
        this.ctx.beginPath();
        this.ctx.roundRect(car.x + 12, car.y + 11, car.width - 24, 8, 3);
        this.ctx.fill();
        
        // Roof with gradient
        const roofGradient = this.ctx.createLinearGradient(car.x, car.y, car.x, car.y + 15);
        roofGradient.addColorStop(0, car.color.body[0]);
        roofGradient.addColorStop(1, car.color.body[1]);
        this.ctx.fillStyle = roofGradient;
        this.ctx.beginPath();
        this.ctx.roundRect(car.x + 25, car.y, car.width - 50, 15, [4, 4, 0, 0]);
        this.ctx.fill();
        
        // Roof highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(car.x + 27, car.y + 2, car.width - 54, 3);
        
        // Windows with reflection
        const windowGradient = this.ctx.createLinearGradient(car.x, car.y + 3, car.x, car.y + 13);
        windowGradient.addColorStop(0, '#A0D8F0');
        windowGradient.addColorStop(0.5, '#87CEEB');
        windowGradient.addColorStop(1, '#6BA8CC');
        this.ctx.fillStyle = windowGradient;
        
        // Front window
        this.ctx.beginPath();
        this.ctx.roundRect(car.x + 30, car.y + 3, 15, 10, 2);
        this.ctx.fill();
        
        // Back window
        this.ctx.beginPath();
        this.ctx.roundRect(car.x + car.width - 45, car.y + 3, 15, 10, 2);
        this.ctx.fill();
        
        // Window reflections
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillRect(car.x + 31, car.y + 4, 6, 3);
        this.ctx.fillRect(car.x + car.width - 44, car.y + 4, 6, 3);
        
        // Window frames
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(car.x + 30, car.y + 3, 15, 10, 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.roundRect(car.x + car.width - 45, car.y + 3, 15, 10, 2);
        this.ctx.stroke();
        
        // Wheels with detail
        const wheelY = car.y + car.height - 5;
        
        // Front wheel
        this.drawDetailedWheel(car.x + 25, wheelY, 9);
        
        // Back wheel
        this.drawDetailedWheel(car.x + car.width - 25, wheelY, 9);
        
        // Headlights
        this.ctx.fillStyle = '#FFE680';
        this.ctx.beginPath();
        this.ctx.ellipse(car.x + 15, car.y + 18, 3, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Taillights
        this.ctx.fillStyle = '#FF4444';
        this.ctx.beginPath();
        this.ctx.ellipse(car.x + car.width - 15, car.y + 18, 3, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#CC0000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // BMW logo on hood (detailed)
        this.ctx.save();
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        
        // Logo outer circle
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(car.x + car.width / 2, car.y + 20, 9, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Logo inner circle
        this.ctx.fillStyle = car.color.body[0];
        this.ctx.beginPath();
        this.ctx.arc(car.x + car.width / 2, car.y + 20, 7, 0, Math.PI * 2);
        this.ctx.fill();
        
        // BMW quadrants
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(car.x + car.width / 2, car.y + 20);
        this.ctx.arc(car.x + car.width / 2, car.y + 20, 7, 0, Math.PI / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(car.x + car.width / 2, car.y + 20);
        this.ctx.arc(car.x + car.width / 2, car.y + 20, 7, Math.PI, Math.PI * 1.5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Logo outline
        this.ctx.strokeStyle = '#CCCCCC';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(car.x + car.width / 2, car.y + 20, 9, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Car body outline
        this.ctx.strokeStyle = car.color.body[2];
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(car.x + 10, car.y + 10, car.width - 20, car.height - 20, 4);
        this.ctx.stroke();
        
        // Door lines
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(car.x + car.width / 2, car.y + 12);
        this.ctx.lineTo(car.x + car.width / 2, car.y + car.height - 10);
        this.ctx.stroke();
    }
    
    drawDetailedWheel(x, y, radius) {
        // Tire (black)
        this.ctx.fillStyle = '#1A1A1A';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tire highlight
        this.ctx.strokeStyle = '#3A3A3A';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 1, -Math.PI * 0.7, -Math.PI * 0.3);
        this.ctx.stroke();
        
        // Rim (silver)
        const rimGradient = this.ctx.createRadialGradient(x - 1, y - 1, 0, x, y, radius - 2);
        rimGradient.addColorStop(0, '#E0E0E0');
        rimGradient.addColorStop(0.5, '#B0B0B0');
        rimGradient.addColorStop(1, '#808080');
        this.ctx.fillStyle = rimGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rim spokes
        this.ctx.strokeStyle = '#606060';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + Math.cos(angle) * (radius - 2), y + Math.sin(angle) * (radius - 2));
            this.ctx.stroke();
        }
        
        // Center cap
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Center cap highlight
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x - 1, y - 1, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawBMWPowerUp(powerUp) {
        // Rotating effect
        const rotation = (Date.now() / 1000) % (Math.PI * 2);
        
        this.ctx.save();
        this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        this.ctx.rotate(rotation);
        
        // BMW shield/logo
        // Outer circle
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, powerUp.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner circle with BMW colors
        this.ctx.fillStyle = '#0066CC';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, powerUp.width / 2 - 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Quadrants
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, powerUp.width / 2 - 3, 0, Math.PI / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, powerUp.width / 2 - 3, Math.PI, Math.PI * 1.5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#0066CC';
        this.ctx.strokeStyle = '#0066CC';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, powerUp.width / 2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    new Game();
});
