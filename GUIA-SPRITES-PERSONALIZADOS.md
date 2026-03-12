# Guía para Agregar Sprites Personalizados a Flappy Kiro

## 📋 Resumen
Esta guía te explica cómo reemplazar los gráficos dibujados con código por imágenes personalizadas (sprites).

---

## 🎨 Paso 1: Preparar tus Imágenes

### Formatos Recomendados
- **PNG** (recomendado) - Soporta transparencia
- **JPG** - Para imágenes sin transparencia
- **SVG** - Gráficos vectoriales

### Tamaños Recomendados
- **Fantasma (jugador)**: 40x40 px (ya existe: `assets/ghosty.png`)
- **Coches BMW**: 100x40 px
- **Power-up BMW**: 40x40 px
- **Edificios**: Variable (80x200 px aprox)
- **Nubes**: Variable (80-140 x 40-70 px)

### Ubicación
Coloca todas tus imágenes en la carpeta: `assets/`

Ejemplo:
```
assets/
├── ghosty.png          (ya existe)
├── coche-azul.png      (nuevo)
├── coche-rojo.png      (nuevo)
├── coche-negro.png     (nuevo)
├── coche-blanco.png    (nuevo)
├── powerup-bmw.png     (nuevo)
├── edificio-1.png      (nuevo)
├── nube.png            (nuevo)
```

---

## 💻 Paso 2: Cargar las Imágenes en el Código

### En el Constructor de la Clase Game

Busca esta sección en `game.js` (línea ~85):

```javascript
// Load player sprite
this.playerSprite = new Image();
this.playerSprite.src = 'assets/ghosty.png';
```

**Agrega tus nuevos sprites después:**

```javascript
// Load player sprite
this.playerSprite = new Image();
this.playerSprite.src = 'assets/ghosty.png';

// Load car sprites (NUEVO)
this.carSprites = {
    blue: new Image(),
    red: new Image(),
    black: new Image(),
    white: new Image()
};
this.carSprites.blue.src = 'assets/coche-azul.png';
this.carSprites.red.src = 'assets/coche-rojo.png';
this.carSprites.black.src = 'assets/coche-negro.png';
this.carSprites.white.src = 'assets/coche-blanco.png';

// Load power-up sprite (NUEVO)
this.powerUpSprite = new Image();
this.powerUpSprite.src = 'assets/powerup-bmw.png';

// Load building sprites (NUEVO - opcional)
this.buildingSprites = [];
for (let i = 1; i <= 3; i++) {
    const sprite = new Image();
    sprite.src = `assets/edificio-${i}.png`;
    this.buildingSprites.push(sprite);
}

// Load cloud sprite (NUEVO - opcional)
this.cloudSprite = new Image();
this.cloudSprite.src = 'assets/nube.png';
```

---

## 🖼️ Paso 3: Usar las Imágenes en el Render

### Ejemplo 1: Coches con Sprites

Busca el método `drawBMWCar()` (línea ~450 aprox) y reemplázalo:

```javascript
drawBMWCar(car) {
    // Verificar si el sprite está cargado
    const sprite = this.carSprites[car.color.name];
    
    if (sprite && sprite.complete) {
        // Dibujar sprite
        this.ctx.drawImage(sprite, car.x, car.y, car.width, car.height);
    } else {
        // Fallback: dibujar con código (el código actual)
        const carGradient = this.ctx.createLinearGradient(car.x, car.y, car.x, car.y + car.height);
        // ... resto del código actual ...
    }
}
```

### Ejemplo 2: Power-up con Sprite

Busca el método `drawBMWPowerUp()` (línea ~500 aprox) y reemplázalo:

```javascript
drawBMWPowerUp(powerUp) {
    if (this.powerUpSprite && this.powerUpSprite.complete) {
        // Rotación del sprite
        const rotation = (Date.now() / 1000) % (Math.PI * 2);
        
        this.ctx.save();
        this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        this.ctx.rotate(rotation);
        
        // Dibujar sprite centrado
        this.ctx.drawImage(
            this.powerUpSprite, 
            -powerUp.width / 2, 
            -powerUp.height / 2, 
            powerUp.width, 
            powerUp.height
        );
        
        this.ctx.restore();
    } else {
        // Fallback: código actual con círculos
        // ... código actual ...
    }
}
```

### Ejemplo 3: Edificios con Sprites

Busca el método `drawBuilding()` y modifícalo:

```javascript
drawBuilding(wall) {
    // Seleccionar sprite aleatorio
    const spriteIndex = wall.spriteIndex || 0;
    const sprite = this.buildingSprites[spriteIndex];
    
    if (sprite && sprite.complete) {
        // Top building
        const topHeight = wall.gapY - CEILING_HEIGHT;
        this.ctx.drawImage(sprite, wall.x, CEILING_HEIGHT, WALL_WIDTH, topHeight);
        
        // Bottom building
        const bottomStart = wall.gapY + GAP_HEIGHT;
        const bottomHeight = CANVAS_HEIGHT - GROUND_HEIGHT - bottomStart;
        this.ctx.drawImage(sprite, wall.x, bottomStart, WALL_WIDTH, bottomHeight);
    } else {
        // Fallback: código actual
        // ... código actual con rectángulos y ventanas ...
    }
}
```

**Importante:** Agrega `spriteIndex` al generar walls:

```javascript
generateWall() {
    const minGapY = CEILING_HEIGHT + 50;
    const maxGapY = CANVAS_HEIGHT - GROUND_HEIGHT - GAP_HEIGHT - 50;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
    
    this.walls.push({
        x: CANVAS_WIDTH,
        gapY: gapY,
        passed: false,
        spriteIndex: Math.floor(Math.random() * this.buildingSprites.length) // NUEVO
    });
}
```

---

## 🎯 Paso 4: Enviarme tus Imágenes

### Opción A: Drag & Drop en el Chat
Simplemente arrastra tus imágenes al chat de Kiro y dime:
- "Usa esta imagen para los coches azules"
- "Esta es para el power-up"
- etc.

### Opción B: Describir lo que Necesitas
Dime qué tipo de gráficos quieres y puedo:
1. Sugerirte dónde encontrarlos
2. Ayudarte a crear sprites simples
3. Modificar el código para usar tus imágenes específicas

---

## 📝 Ejemplo Completo: Reemplazar Coches

### 1. Prepara 4 imágenes de coches BMW:
- `assets/coche-azul.png`
- `assets/coche-rojo.png`
- `assets/coche-negro.png`
- `assets/coche-blanco.png`

### 2. Carga los sprites (en constructor):
```javascript
this.carSprites = {
    blue: new Image(),
    red: new Image(),
    black: new Image(),
    white: new Image()
};
this.carSprites.blue.src = 'assets/coche-azul.png';
this.carSprites.red.src = 'assets/coche-rojo.png';
this.carSprites.black.src = 'assets/coche-negro.png';
this.carSprites.white.src = 'assets/coche-blanco.png';
```

### 3. Usa los sprites (en drawBMWCar):
```javascript
drawBMWCar(car) {
    const sprite = this.carSprites[car.color.name];
    
    if (sprite && sprite.complete) {
        this.ctx.drawImage(sprite, car.x, car.y, car.width, car.height);
    } else {
        // Código actual como fallback
    }
}
```

---

## ⚠️ Consejos Importantes

1. **Siempre incluye un fallback**: Si la imagen no carga, el código actual dibujará gráficos con formas
2. **Verifica que las imágenes cargaron**: Usa `sprite.complete` antes de dibujar
3. **Mantén las proporciones**: Ajusta width/height para que no se distorsionen
4. **Usa transparencia**: PNG con fondo transparente se ve mejor
5. **Optimiza el tamaño**: Imágenes muy grandes pueden afectar el rendimiento

---

## 🚀 Siguiente Paso

**¡Envíame tus imágenes!** Puedes:
1. Arrastrar las imágenes al chat
2. Decirme qué elementos quieres personalizar
3. Yo modificaré el código para usar tus sprites

**Ejemplo de mensaje:**
"Aquí están mis imágenes de coches BMW [arrastra 4 imágenes]. Úsalas para reemplazar los coches del juego."
