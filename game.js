// Game Constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const GROUND_HEIGHT = 80;
const CEILING_HEIGHT = 50;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -10;
const WALL_WIDTH = 80;
const GAP_HEIGHT = 250;
const WALL_SPEED = 2;
const WALL_GENERATION_INTERVAL = 120;
const PLAYER_SIZE = 40;
const HITBOX_TOLERANCE = 5;

// New constants for city theme
const CAR_WIDTH = 100;
const CAR_HEIGHT = 40;
const CAR_SPEED = 3;
const CAR_SPAWN_INTERVAL = 180; // 3 seconds
const POWERUP_SIZE = 40;
const POWERUP_MIN_INTERVAL = 10; // buildings
const POWERUP_MAX_INTERVAL = 30; // buildings
const DOUBLE_POINTS_DURATION = 300; // 5 seconds at 60 FPS

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
        
        // Game Objects
        this.player = null;
        this.walls = [];
        this.cars = [];
        this.powerUps = [];
        this.doublePointsActive = false;
        this.doublePointsTimer = 0;
        
        // Audio
        this.jumpSound = new Audio('assets/jump.wav');
        this.gameOverSound = new Audio('assets/game_over.wav');
        
        // Load player sprite
        this.playerSprite = new Image();
        this.playerSprite.src = 'assets/ghosty.png';
        
        this.init();
    }
    
    init() {
        // Event Listeners
        this.playButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.returnToMenu());
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Start game loop
        this.gameLoop();
    }
    
    getRandomPowerUpInterval() {
        return Math.floor(Math.random() * (POWERUP_MAX_INTERVAL - POWERUP_MIN_INTERVAL + 1)) + POWERUP_MIN_INTERVAL;
    }
    
    startGame() {
        this.state = STATES.PLAYING;
        this.score = 0;
        this.frameCounter = 0;
        this.carSpawnCounter = 0;
        this.buildingCounter = 0;
        this.nextPowerUpAt = this.getRandomPowerUpInterval();
        this.walls = [];
        this.cars = [];
        this.powerUps = [];
        this.doublePointsActive = false;
        this.doublePointsTimer = 0;
        
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
        
        // Update double points timer
        if (this.doublePointsActive) {
            this.doublePointsTimer--;
            if (this.doublePointsTimer <= 0) {
                this.doublePointsActive = false;
            }
        }
        
        // Update walls (buildings)
        this.frameCounter++;
        if (this.frameCounter >= WALL_GENERATION_INTERVAL) {
            this.generateWall();
            this.frameCounter = 0;
            this.buildingCounter++;
            
            // Check if should spawn power-up
            if (this.buildingCounter >= this.nextPowerUpAt) {
                this.generatePowerUp();
                this.buildingCounter = 0;
                this.nextPowerUpAt = this.getRandomPowerUpInterval();
            }
        }
        
        for (let wall of this.walls) {
            wall.x -= WALL_SPEED;
        }
        
        // Remove off-screen walls
        this.walls = this.walls.filter(wall => wall.x > -WALL_WIDTH);
        
        // Update cars
        this.carSpawnCounter++;
        if (this.carSpawnCounter >= CAR_SPAWN_INTERVAL) {
            this.generateCar();
            this.carSpawnCounter = Math.floor(Math.random() * 60); // Random offset
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
        this.cars.push({
            x: -CAR_WIDTH,
            y: CANVAS_HEIGHT - GROUND_HEIGHT - CAR_HEIGHT,
            width: CAR_WIDTH,
            height: CAR_HEIGHT
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
            return true;
        }
        
        // Ceiling collision
        if (this.player.y <= CEILING_HEIGHT) {
            return true;
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
                return true;
            }
        }
        
        // Car collisions
        for (let car of this.cars) {
            if (this.boxesOverlap(hitbox, car)) {
                return true;
            }
        }
        
        return false;
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
        // Clear canvas - Fondo retro futurista con gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(0.5, '#1a1a3e');
        gradient.addColorStop(1, '#0f0f23');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Efecto de grid retro en el fondo
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < CANVAS_WIDTH; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, CANVAS_HEIGHT);
            this.ctx.stroke();
        }
        for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(CANVAS_WIDTH, i);
            this.ctx.stroke();
        }
        
        // Draw ceiling - Estilo neón
        const ceilingGradient = this.ctx.createLinearGradient(0, 0, 0, CEILING_HEIGHT);
        ceilingGradient.addColorStop(0, '#ff00ff');
        ceilingGradient.addColorStop(1, '#8b00ff');
        this.ctx.fillStyle = ceilingGradient;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CEILING_HEIGHT);
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, CANVAS_WIDTH, CEILING_HEIGHT);
        
        // Draw ground - Estilo neón
        const groundGradient = this.ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
        groundGradient.addColorStop(0, '#8b00ff');
        groundGradient.addColorStop(1, '#ff00ff');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
        
        if (this.state === STATES.PLAYING || this.state === STATES.PAUSED || this.state === STATES.GAME_OVER) {
            // Draw walls - Estilo tubería de Mario Bros con neón
            for (let wall of this.walls) {
                const pipeCapHeight = 30; // Altura del borde superior de la tubería
                const pipeCapWidth = WALL_WIDTH + 10; // Ancho del borde (más ancho que el cuerpo)
                const pipeCapOffset = (pipeCapWidth - WALL_WIDTH) / 2; // Centrar el borde
                
                // Gradiente para el cuerpo de la tubería
                const pipeBodyGradient = this.ctx.createLinearGradient(wall.x, 0, wall.x + WALL_WIDTH, 0);
                pipeBodyGradient.addColorStop(0, '#00cc99');
                pipeBodyGradient.addColorStop(0.3, '#00ffcc');
                pipeBodyGradient.addColorStop(0.5, '#00ff88');
                pipeBodyGradient.addColorStop(0.7, '#00ffcc');
                pipeBodyGradient.addColorStop(1, '#00cc99');
                
                // Gradiente para el borde de la tubería
                const pipeCapGradient = this.ctx.createLinearGradient(wall.x - pipeCapOffset, 0, wall.x + pipeCapWidth - pipeCapOffset, 0);
                pipeCapGradient.addColorStop(0, '#00ffff');
                pipeCapGradient.addColorStop(0.5, '#00ff88');
                pipeCapGradient.addColorStop(1, '#00ffff');
                
                // ===== TOP PIPE =====
                const topPipeBodyHeight = wall.gapY - CEILING_HEIGHT - pipeCapHeight;
                
                // Cuerpo de la tubería superior
                this.ctx.fillStyle = pipeBodyGradient;
                this.ctx.fillRect(wall.x, CEILING_HEIGHT, WALL_WIDTH, topPipeBodyHeight);
                
                // Borde neón del cuerpo
                this.ctx.strokeStyle = '#00ffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(wall.x, CEILING_HEIGHT, WALL_WIDTH, topPipeBodyHeight);
                
                // Detalles internos de la tubería (líneas verticales)
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(wall.x + WALL_WIDTH * 0.3, CEILING_HEIGHT);
                this.ctx.lineTo(wall.x + WALL_WIDTH * 0.3, CEILING_HEIGHT + topPipeBodyHeight);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(wall.x + WALL_WIDTH * 0.7, CEILING_HEIGHT);
                this.ctx.lineTo(wall.x + WALL_WIDTH * 0.7, CEILING_HEIGHT + topPipeBodyHeight);
                this.ctx.stroke();
                
                // Borde/tapa de la tubería superior (más ancho)
                this.ctx.fillStyle = pipeCapGradient;
                this.ctx.fillRect(wall.x - pipeCapOffset, wall.gapY - pipeCapHeight, pipeCapWidth, pipeCapHeight);
                
                // Borde neón de la tapa
                this.ctx.strokeStyle = '#00ffff';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(wall.x - pipeCapOffset, wall.gapY - pipeCapHeight, pipeCapWidth, pipeCapHeight);
                
                // Sombra interior de la tapa
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.fillRect(wall.x - pipeCapOffset + 3, wall.gapY - pipeCapHeight + 3, pipeCapWidth - 6, pipeCapHeight - 6);
                
                // Brillo en la tapa
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.fillRect(wall.x - pipeCapOffset + 3, wall.gapY - pipeCapHeight + 3, pipeCapWidth - 6, 8);
                
                // ===== BOTTOM PIPE =====
                const bottomPipeStart = wall.gapY + GAP_HEIGHT;
                const bottomPipeBodyHeight = CANVAS_HEIGHT - GROUND_HEIGHT - bottomPipeStart - pipeCapHeight;
                
                // Borde/tapa de la tubería inferior (más ancho)
                this.ctx.fillStyle = pipeCapGradient;
                this.ctx.fillRect(wall.x - pipeCapOffset, bottomPipeStart, pipeCapWidth, pipeCapHeight);
                
                // Borde neón de la tapa
                this.ctx.strokeStyle = '#00ffff';
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(wall.x - pipeCapOffset, bottomPipeStart, pipeCapWidth, pipeCapHeight);
                
                // Sombra interior de la tapa
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                this.ctx.fillRect(wall.x - pipeCapOffset + 3, bottomPipeStart + 3, pipeCapWidth - 6, pipeCapHeight - 6);
                
                // Brillo en la tapa
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.fillRect(wall.x - pipeCapOffset + 3, bottomPipeStart + 3, pipeCapWidth - 6, 8);
                
                // Cuerpo de la tubería inferior
                this.ctx.fillStyle = pipeBodyGradient;
                this.ctx.fillRect(wall.x, bottomPipeStart + pipeCapHeight, WALL_WIDTH, bottomPipeBodyHeight);
                
                // Borde neón del cuerpo
                this.ctx.strokeStyle = '#00ffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(wall.x, bottomPipeStart + pipeCapHeight, WALL_WIDTH, bottomPipeBodyHeight);
                
                // Detalles internos de la tubería (líneas verticales)
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(wall.x + WALL_WIDTH * 0.3, bottomPipeStart + pipeCapHeight);
                this.ctx.lineTo(wall.x + WALL_WIDTH * 0.3, CANVAS_HEIGHT - GROUND_HEIGHT);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(wall.x + WALL_WIDTH * 0.7, bottomPipeStart + pipeCapHeight);
                this.ctx.lineTo(wall.x + WALL_WIDTH * 0.7, CANVAS_HEIGHT - GROUND_HEIGHT);
                this.ctx.stroke();
                
                // Efecto de brillo en el gap (líneas punteadas)
                this.ctx.strokeStyle = '#ff00ff';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([10, 10]);
                this.ctx.beginPath();
                this.ctx.moveTo(wall.x - pipeCapOffset, wall.gapY);
                this.ctx.lineTo(wall.x + pipeCapWidth - pipeCapOffset, wall.gapY);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(wall.x - pipeCapOffset, wall.gapY + GAP_HEIGHT);
                this.ctx.lineTo(wall.x + pipeCapWidth - pipeCapOffset, wall.gapY + GAP_HEIGHT);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
            
            // Draw player con efecto de brillo
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#00ffff';
            
            if (this.playerSprite.complete) {
                this.ctx.drawImage(this.playerSprite, this.player.x, this.player.y, 
                    this.player.width, this.player.height);
            } else {
                // Fallback con estilo retro
                const playerGradient = this.ctx.createRadialGradient(
                    this.player.x + this.player.width/2, 
                    this.player.y + this.player.height/2, 
                    0,
                    this.player.x + this.player.width/2, 
                    this.player.y + this.player.height/2, 
                    this.player.width
                );
                playerGradient.addColorStop(0, '#ffffff');
                playerGradient.addColorStop(0.5, '#00ffff');
                playerGradient.addColorStop(1, '#ff00ff');
                this.ctx.fillStyle = playerGradient;
                this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            }
            
            this.ctx.shadowBlur = 0;
        }
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

    
    drawBuilding(wall) {
        // Building body gradient
        const buildingGradient = this.ctx.createLinearGradient(wall.x, 0, wall.x + WALL_WIDTH, 0);
        buildingGradient.addColorStop(0, '#5A5A5A');
        buildingGradient.addColorStop(0.5, '#7A7A7A');
        buildingGradient.addColorStop(1, '#5A5A5A');
        
        // Top building
        const topHeight = wall.gapY - CEILING_HEIGHT;
        this.ctx.fillStyle = buildingGradient;
        this.ctx.fillRect(wall.x, CEILING_HEIGHT, WALL_WIDTH, topHeight);
        
        // Windows for top building
        this.ctx.fillStyle = '#FFD700';
        for (let row = 0; row < Math.floor(topHeight / 25); row++) {
            for (let col = 0; col < 3; col++) {
                this.ctx.fillRect(wall.x + 10 + col * 20, CEILING_HEIGHT + row * 25 + 5, 12, 15);
            }
        }
        
        // Building outline
        this.ctx.strokeStyle = '#3A3A3A';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(wall.x, CEILING_HEIGHT, WALL_WIDTH, topHeight);
        
        // Bottom building
        const bottomStart = wall.gapY + GAP_HEIGHT;
        const bottomHeight = CANVAS_HEIGHT - GROUND_HEIGHT - bottomStart;
        this.ctx.fillStyle = buildingGradient;
        this.ctx.fillRect(wall.x, bottomStart, WALL_WIDTH, bottomHeight);
        
        // Windows for bottom building
        this.ctx.fillStyle = '#FFD700';
        for (let row = 0; row < Math.floor(bottomHeight / 25); row++) {
            for (let col = 0; col < 3; col++) {
                this.ctx.fillRect(wall.x + 10 + col * 20, bottomStart + row * 25 + 5, 12, 15);
            }
        }
        
        // Building outline
        this.ctx.strokeStyle = '#3A3A3A';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(wall.x, bottomStart, WALL_WIDTH, bottomHeight);
    }
    
    drawBMWCar(car) {
        // Car body
        const carGradient = this.ctx.createLinearGradient(car.x, car.y, car.x, car.y + car.height);
        carGradient.addColorStop(0, '#0066CC');
        carGradient.addColorStop(0.5, '#0052A3');
        carGradient.addColorStop(1, '#003D7A');
        this.ctx.fillStyle = carGradient;
        
        // Main body
        this.ctx.fillRect(car.x + 10, car.y + 10, car.width - 20, car.height - 20);
        
        // Roof
        this.ctx.fillRect(car.x + 25, car.y, car.width - 50, 15);
        
        // Windows
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(car.x + 30, car.y + 3, 15, 10);
        this.ctx.fillRect(car.x + car.width - 45, car.y + 3, 15, 10);
        
        // Wheels
        this.ctx.fillStyle = '#1A1A1A';
        this.ctx.beginPath();
        this.ctx.arc(car.x + 25, car.y + car.height - 5, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(car.x + car.width - 25, car.y + car.height - 5, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // BMW logo on hood
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(car.x + car.width / 2, car.y + 20, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#0066CC';
        this.ctx.beginPath();
        this.ctx.arc(car.x + car.width / 2, car.y + 20, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Outline
        this.ctx.strokeStyle = '#003D7A';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(car.x + 10, car.y + 10, car.width - 20, car.height - 20);
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
    
    getRandomPowerUpInterval() {
        return Math.floor(Math.random() * (POWERUP_MAX_INTERVAL - POWERUP_MIN_INTERVAL + 1)) + POWERUP_MIN_INTERVAL;
    }
