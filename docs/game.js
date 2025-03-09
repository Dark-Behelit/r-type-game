class Resources {
    static async load() {
        const statusElement = document.getElementById('resourceStatus');
        try {
            statusElement.textContent = 'Cargando imágenes...';
            
            this.images = {};
            this.sounds = {};

            // Cargar imágenes desde archivos
            const imagesToLoad = {
                player: 'assets/images/player-ship.png',
                enemy1: 'assets/images/enemy1.png',
                enemy2: 'assets/images/enemy2.png',
                enemy3: 'assets/images/enemy3.png',
                boss1: 'assets/images/boss1.png',
                boss2: 'assets/images/boss2.png',
                boss3: 'assets/images/boss3.png',
                boss4: 'assets/images/boss4.png',
                boss5: 'assets/images/boss5.png'
            };

            // Solo intentar cargar la imagen del jefe si existe
            try {
                const bossImage = new Image();
                bossImage.src = 'assets/images/boss.png';
                await new Promise((resolve, reject) => {
                    bossImage.onload = () => {
                        imagesToLoad.enemy4 = 'assets/images/boss.png';
                        resolve();
                    };
                    bossImage.onerror = () => {
                        console.warn('Imagen del jefe no encontrada, usando imagen generada');
                        // Generar una imagen temporal para el jefe
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = 150;
                        canvas.height = 150;
                        
                        // Dibujar una forma básica para el jefe
                        ctx.fillStyle = '#ff0000';
                        ctx.beginPath();
                        ctx.moveTo(75, 0);
                        ctx.lineTo(150, 75);
                        ctx.lineTo(75, 150);
                        ctx.lineTo(0, 75);
                        ctx.closePath();
                        ctx.fill();
                        
                        // Añadir detalles
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(75, 75, 30, 0, Math.PI * 2);
                        ctx.fill();
                        
                        this.images.enemy4 = new Image();
                        this.images.enemy4.src = canvas.toDataURL();
                        resolve();
                    };
                });
            } catch (error) {
                console.warn('Error al cargar la imagen del jefe:', error);
            }

            // Generar fondo espacial
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Fondo espacial
            canvas.width = 3200;
            canvas.height = 600;
            
            // Función para crear capa de estrellas
            const createStarLayer = (numStars, size, alpha, color) => {
                const layerCanvas = document.createElement('canvas');
                layerCanvas.width = canvas.width;
                layerCanvas.height = canvas.height;
                const layerCtx = layerCanvas.getContext('2d');
                
                layerCtx.fillStyle = '#000033';
                layerCtx.fillRect(0, 0, layerCanvas.width, layerCanvas.height);
                
                for (let i = 0; i < numStars; i++) {
                    layerCtx.fillStyle = `rgba(${color}, ${color}, ${color}, ${alpha})`;
                    layerCtx.fillRect(
                        Math.random() * layerCanvas.width,
                        Math.random() * layerCanvas.height,
                        size,
                        size
                    );
                }
                
                return layerCanvas;
            };
            
            // Crear las dos capas de estrellas
            const backgroundLayer = createStarLayer(600, 1, 0.5, 200);
            const foregroundLayer = createStarLayer(200, 2, 0.8, 255);
            
            // Guardar las capas del fondo
            this.images.backgroundLayer = new Image();
            this.images.backgroundLayer.src = backgroundLayer.toDataURL();
            this.images.foregroundLayer = new Image();
            this.images.foregroundLayer.src = foregroundLayer.toDataURL();

            // Cargar las imágenes de las naves
            const loadImage = (key, src) => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        this.images[key] = img;
                        resolve();
                    };
                    img.onerror = () => reject(new Error(`Error cargando imagen: ${src}`));
                    img.src = src;
                });
            };

            // Cargar todas las imágenes
            await Promise.all(
                Object.entries(imagesToLoad).map(([key, src]) => loadImage(key, src))
            );

            // Generar disparo
            canvas.width = 20;
            canvas.height = 8;
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.lineTo(15, 0);
            ctx.lineTo(20, 4);
            ctx.lineTo(15, 8);
            ctx.closePath();
            ctx.fill();
            this.images.bullet = new Image();
            this.images.bullet.src = canvas.toDataURL();

            // Explosión
            canvas.width = 40;
            canvas.height = 40;
            const gradient = ctx.createRadialGradient(20, 20, 0, 20, 20, 20);
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.5, '#ff4400');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 40, 40);
            this.images.explosion = new Image();
            this.images.explosion.src = canvas.toDataURL();

            // Esperar a que todas las imágenes se carguen
            await Promise.all(Object.values(this.images).map(img => {
                if (img instanceof Image && !img.complete) {
                    return new Promise((resolve) => {
                        img.onload = resolve;
                    });
                }
                return Promise.resolve();
            }));

            statusElement.textContent = 'Generando sonidos...';

            // Generar sonidos
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Función para generar sonidos
            const generateSound = async (options) => {
                const offlineContext = new OfflineAudioContext(
                    1,
                    audioContext.sampleRate * options.duration,
                    audioContext.sampleRate
                );

                const oscillator = offlineContext.createOscillator();
                const gainNode = offlineContext.createGain();

                oscillator.type = options.type;
                oscillator.frequency.setValueAtTime(options.frequency, 0);

                if (options.slide) {
                    oscillator.frequency.exponentialRampToValueAtTime(
                        options.slideFrequency,
                        options.duration
                    );
                }

                gainNode.gain.setValueAtTime(0.3, 0);
                gainNode.gain.exponentialRampToValueAtTime(0.01, options.duration);

                if (options.noise) {
                    const noiseBuffer = offlineContext.createBuffer(
                        1, offlineContext.sampleRate * options.duration, offlineContext.sampleRate
                    );
                    const data = noiseBuffer.getChannelData(0);
                    for (let i = 0; i < data.length; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    const noise = offlineContext.createBufferSource();
                    noise.buffer = noiseBuffer;
                    noise.connect(gainNode);
                    noise.start();
                }

                oscillator.connect(gainNode);
                gainNode.connect(offlineContext.destination);

                oscillator.start();
                oscillator.stop(options.duration);

                return await offlineContext.startRendering();
            };

            // Generar cada sonido
            this.sounds.shoot = await generateSound({
                type: 'square',
                frequency: 880,
                duration: 0.1,
                slide: true,
                slideFrequency: 440
            });

            this.sounds.explosion = await generateSound({
                type: 'sawtooth',
                frequency: 100,
                duration: 0.3,
                noise: true
            });

            this.sounds.gameOver = await generateSound({
                type: 'sine',
                frequency: 440,
                duration: 1,
                slide: true,
                slideFrequency: 220
            });

            // Generar música de fondo
            const musicDuration = 30;
            const musicContext = new OfflineAudioContext(
                2,
                audioContext.sampleRate * musicDuration,
                audioContext.sampleRate
            );

            const frequencies = [220, 165, 196, 147];
            const noteLength = 0.25;

            const musicOsc = musicContext.createOscillator();
            const musicGain = musicContext.createGain();
            
            musicOsc.type = 'square';
            musicOsc.connect(musicGain);
            
            let time = 0;
            while (time < musicDuration) {
                frequencies.forEach((freq, index) => {
                    musicOsc.frequency.setValueAtTime(freq, time + index * noteLength);
                    musicGain.gain.setValueAtTime(0.3, time + index * noteLength);
                    musicGain.gain.setValueAtTime(0.0, time + (index + 0.8) * noteLength);
                });
                time += frequencies.length * noteLength;
            }

            musicGain.connect(musicContext.destination);
            musicOsc.start();
            musicOsc.stop(musicDuration);

            this.sounds.background = await musicContext.startRendering();

            statusElement.textContent = '¡Recursos generados!';
            statusElement.style.display = 'none';
        } catch (error) {
            console.error('Error cargando recursos:', error);
            statusElement.textContent = 'Error generando recursos. Por favor, recarga la página.';
            throw error;
        }
    }

    static playSound(name) {
        if (this.sounds[name]) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createBufferSource();
            source.buffer = this.sounds[name];
            source.connect(audioContext.destination);
            source.start();
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Sistema de niveles
        this.currentLevel = 1;
        this.maxLevel = 5;
        this.levelColors = {
            1: '#000033', // Azul oscuro original
            2: '#330000', // Rojo oscuro
            3: '#003300', // Verde oscuro
            4: '#330033', // Púrpura oscuro
            5: '#333300'  // Dorado oscuro
        };
        this.enemySpawnIntervals = {
            1: 2000,    // Cada 2 segundos
            2: 1800,    // Cada 1.8 segundos
            3: 1600,    // Cada 1.6 segundos
            4: 1400,    // Cada 1.4 segundos
            5: 1200     // Cada 1.2 segundos
        };
        
        // Posiciones de las capas del fondo
        this.backgroundX1 = 0;
        this.backgroundX2 = 0;
        this.backgroundSpeed1 = 0.5;
        this.backgroundSpeed2 = 1;
        
        this.enemyBullets = [];
        this.powerUps = [];
        this.powerUpInterval = null;
        this.extraLifeInterval = null;
        this.currentPowerUp = null;
        this.powerUpEndTime = 0;
        this.gameStartTime = Date.now();
        this.levelStartTime = Date.now();
        this.bossSpawned = false;
        this.showingLevelText = false;
        this.levelTextTimer = null;
        this.backgroundMusic = null;
        this.musicVolume = 0.3; // Volumen más bajo por defecto
        this.audioInitialized = false;
        this.init();
    }

    async init() {
        await Resources.load();
        
        this.player = new Player(50, this.canvas.height / 2);
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        
        this.keys = {};
        this.setupEventListeners();
        
        // Iniciar música de fondo
        this.backgroundMusic = new Audio('assets/sounds/background-music.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.musicVolume;
        
        // Intentar reproducir la música al primer clic
        const startAudio = () => {
            this.backgroundMusic.play().catch(e => console.warn('Error al reproducir música:', e));
            document.removeEventListener('click', startAudio);
        };
        document.addEventListener('click', startAudio);
        
        // Generar enemigos cada 2 segundos
        this.enemyInterval = setInterval(() => this.spawnEnemy(), 2000);
        
        // Generar power-ups cada 10 segundos
        this.powerUpInterval = setInterval(() => this.spawnPowerUp(false), 10000);
        
        // Generar vidas extra cada 30 segundos
        this.extraLifeInterval = setInterval(() => this.spawnPowerUp(true), 30000);
        
        // Iniciar el bucle del juego
        this.gameLoop();
    }

    fadeOutMusic(duration = 1000) {
        if (!this.backgroundMusic) return;
        
        const originalVolume = this.backgroundMusic.volume;
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = originalVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
                return;
            }
            this.backgroundMusic.volume = Math.max(0, originalVolume - (volumeStep * currentStep));
            currentStep++;
        }, stepTime);
    }

    fadeInMusic(duration = 1000) {
        if (!this.backgroundMusic) return;
        
        this.backgroundMusic.volume = 0;
        this.backgroundMusic.play();
        
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = this.musicVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                return;
            }
            this.backgroundMusic.volume = Math.min(this.musicVolume, volumeStep * currentStep);
            currentStep++;
        }, stepTime);
    }

    setupEventListeners() {
        // Event listeners para controles
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        window.addEventListener('keypress', (e) => {
            if (e.key === ' ' && !this.gameOver) {
                this.shoot();
            }
        });
    }

    spawnEnemy() {
        if (this.gameOver) return;
        
        const y = Math.random() * (this.canvas.height - 40);
        const type = Math.floor(Math.random() * 3) + 1;
        this.enemies.push(new Enemy(this.canvas.width, y, type));
    }

    spawnPowerUp(isExtraLife) {
        if (this.gameOver) return;
        
        const x = this.canvas.width;
        const y = Math.random() * (this.canvas.height - 30);
        
        if (isExtraLife) {
            this.powerUps.push(new PowerUp(x, y, 'extraLife'));
        } else {
            const types = ['laserBeam', 'tripleShot', 'superShot'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerUps.push(new PowerUp(x, y, type));
        }
    }

    update() {
        if (this.gameOver) return;

        // Comprobar si es tiempo de aparecer el jefe
        if (!this.bossSpawned && Date.now() - this.levelStartTime >= 60000) {
            this.spawnBoss();
            this.bossSpawned = true;
            clearInterval(this.enemyInterval);
        }

        // Actualizar jugador
        if (this.keys['ArrowUp']) this.player.y -= 5;
        if (this.keys['ArrowDown']) this.player.y += 5;
        if (this.keys['ArrowLeft']) this.player.x -= 5;
        if (this.keys['ArrowRight']) this.player.x += 5;

        // Mantener al jugador dentro del canvas
        this.player.y = Math.max(0, Math.min(this.canvas.height - 30, this.player.y));
        this.player.x = Math.max(0, Math.min(this.canvas.width - 30, this.player.x));

        // Actualizar balas
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.x < this.canvas.width;
        });

        // Actualizar balas enemigas
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update();
            return bullet.x > 0 && bullet.x < this.canvas.width && 
                   bullet.y > 0 && bullet.y < this.canvas.height;
        });

        // Actualizar enemigos y sus disparos
        this.enemies = this.enemies.filter(enemy => {
            enemy.update();
            
            // Probabilidad de disparo según el tipo
            if (Math.random() < enemy.shootProbability) {
                enemy.shoot(this.enemyBullets);
                Resources.playSound('shoot');
            }
            
            return enemy.x > 0;
        });

        // Actualizar power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();
            return powerUp.x > 0;
        });

        // Verificar si el power-up actual ha expirado
        if (this.currentPowerUp && Date.now() > this.powerUpEndTime) {
            this.currentPowerUp = null;
        }

        // Detectar colisiones
        this.detectCollisions();
    }

    detectCollisions() {
        for (let enemy of this.enemies) {
            // Colisión con balas
            for (let bullet of this.bullets) {
                if (this.checkCollision(bullet, enemy)) {
                    if (enemy.takeDamage(bullet.damage, bullet.isSuperShot)) {
                        enemy.isDestroyed = true;
                        this.score += enemy.points;
                        document.getElementById('score').textContent = this.score;
                        Resources.playSound('explosion');
                    }
                    
                    if (bullet.type !== 'laser') {
                        bullet.isDestroyed = true;
                    }
                }
            }

            // Colisión con jugador
            if (this.checkCollision(this.player, enemy)) {
                enemy.isDestroyed = true;
                this.lives--;
                document.getElementById('lives').textContent = this.lives;
                Resources.playSound('explosion');

                if (this.lives <= 0) {
                    this.gameOver = true;
                    Resources.playSound('gameOver');
                    if (this.backgroundMusic) {
                        this.fadeOutMusic();
                    }
                    clearInterval(this.enemyInterval);
                    this.showGameOver();
                }
            }
        }

        this.bullets = this.bullets.filter(bullet => !bullet.isDestroyed);
        this.enemyBullets = this.enemyBullets.filter(bullet => !bullet.isDestroyed);
        this.enemies = this.enemies.filter(enemy => !enemy.isDestroyed);

        // Colisión de balas enemigas con jugador
        for (let bullet of this.enemyBullets) {
            if (this.checkCollision(this.player, bullet)) {
                bullet.isDestroyed = true;
                this.lives--;
                document.getElementById('lives').textContent = this.lives;
                Resources.playSound('explosion');

                if (this.lives <= 0) {
                    this.gameOver = true;
                    Resources.playSound('gameOver');
                    if (this.backgroundMusic) {
                        this.fadeOutMusic();
                    }
                    clearInterval(this.enemyInterval);
                    this.showGameOver();
                }
            }
        }

        // Colisión con power-ups (jugador o balas)
        for (let powerUp of this.powerUps) {
            // Colisión con jugador
            if (this.checkCollisionCircle(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
            }
            
            // Colisión con balas del jugador
            for (let bullet of this.bullets) {
                if (this.checkCollisionCircle(bullet, powerUp)) {
                    this.collectPowerUp(powerUp);
                    if (bullet.type !== 'laser') {
                        bullet.isDestroyed = true;
                    }
                }
            }
        }

        this.powerUps = this.powerUps.filter(powerUp => !powerUp.isCollected);
    }

    collectPowerUp(powerUp) {
        powerUp.isCollected = true;
        
        if (powerUp.type === 'extraLife') {
            this.lives++;
            document.getElementById('lives').textContent = this.lives;
        } else {
            this.currentPowerUp = powerUp.type;
            this.powerUpEndTime = Date.now() + 15000; // 15 segundos
        }
        
        Resources.playSound('powerUp');
    }

    checkCollision(rect1, rect2) {
        // Reducir el área de colisión para mayor precisión
        const margin = 5;
        return (rect1.x + margin) < (rect2.x + rect2.width - margin) &&
               (rect1.x + rect1.width - margin) > (rect2.x + margin) &&
               (rect1.y + margin) < (rect2.y + rect2.height - margin) &&
               (rect1.y + rect1.height - margin) > (rect2.y + margin);
    }

    checkCollisionCircle(rect, circle) {
        // Encuentra el punto más cercano del rectángulo al centro del círculo
        const closestX = Math.max(rect.x, Math.min(circle.x + circle.width/2, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y + circle.height/2, rect.y + rect.height));
        
        // Calcula la distancia entre el punto más cercano y el centro del círculo
        const distanceX = circle.x + circle.width/2 - closestX;
        const distanceY = circle.y + circle.height/2 - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        
        // Compara con el radio al cuadrado
        return distanceSquared <= (circle.width/2 * circle.width/2);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Aplicar color de fondo según el nivel actual
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = this.levelColors[this.currentLevel] || '#000033';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar capas de fondo con transparencia
        this.ctx.globalCompositeOperation = 'lighter';
        
        // Actualizar posiciones de las capas
        this.backgroundX1 = (this.backgroundX1 + this.backgroundSpeed1) % 3200;
        this.backgroundX2 = (this.backgroundX2 + this.backgroundSpeed2) % 3200;
        
        // Dibujar capa lejana con transparencia
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(
            Resources.images.backgroundLayer,
            this.backgroundX1, 0, 3200, 600,
            0, 0, this.canvas.width, this.canvas.height
        );
        this.ctx.drawImage(
            Resources.images.backgroundLayer,
            this.backgroundX1 - 3200, 0, 3200, 600,
            0, 0, this.canvas.width, this.canvas.height
        );
        
        // Dibujar capa cercana con transparencia
        this.ctx.globalAlpha = 0.7;
        this.ctx.drawImage(
            Resources.images.foregroundLayer,
            this.backgroundX2, 0, 3200, 600,
            0, 0, this.canvas.width, this.canvas.height
        );
        this.ctx.drawImage(
            Resources.images.foregroundLayer,
            this.backgroundX2 - 3200, 0, 3200, 600,
            0, 0, this.canvas.width, this.canvas.height
        );
        
        // Restaurar configuración de dibujo
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
        
        // Dibujar jugador
        if (!this.gameOver) {
            this.ctx.drawImage(Resources.images.player, this.player.x, this.player.y, this.player.width, this.player.height);
        }

        // Dibujar balas
        this.bullets.forEach(bullet => {
            this.ctx.save();
            
            switch(bullet.type) {
                case 'laser':
                    this.ctx.fillStyle = '#00ff00';
                    this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                    break;
                case 'super':
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.beginPath();
                    this.ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                default:
                    this.ctx.translate(bullet.x + bullet.width/2, bullet.y + bullet.height/2);
                    this.ctx.rotate(bullet.angleOffset);
                    this.ctx.translate(-(bullet.x + bullet.width/2), -(bullet.y + bullet.height/2));
                    this.ctx.drawImage(Resources.images.bullet, bullet.x, bullet.y, bullet.width, bullet.height);
            }
            
            this.ctx.restore();
        });

        // Dibujar balas enemigas
        this.enemyBullets.forEach(bullet => {
            this.ctx.save();
            this.ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
            this.ctx.rotate(bullet.angle || 0);
            this.ctx.translate(-(bullet.x + bullet.width / 2), -(bullet.y + bullet.height / 2));
            
            if (bullet.isLarge) {
                // Bala grande para enemigo tipo 3
                this.ctx.fillStyle = '#ff4400';
                this.ctx.beginPath();
                this.ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.drawImage(Resources.images.bullet, bullet.x, bullet.y, bullet.width, bullet.height);
            }
            
            this.ctx.restore();
        });

        // Dibujar enemigos
        this.enemies.forEach(enemy => {
            let enemyImage;
            if (enemy instanceof BossFight) {
                enemyImage = Resources.images[`boss${this.currentLevel}`];
            } else {
                enemyImage = Resources.images[`enemy${enemy.type}`];
            }
            if (enemyImage) {
                this.ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
            }
        });

        // Dibujar power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            this.ctx.fillStyle = powerUp.color;
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Dibujar icono
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(powerUp.icon, powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2);
            this.ctx.restore();
        });

        // Mostrar tiempo restante del power-up
        if (this.currentPowerUp) {
            const timeLeft = Math.ceil((this.powerUpEndTime - Date.now()) / 1000);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`Power-up: ${timeLeft}s`, this.canvas.width - 10, 30);
        }

        // Mostrar Game Over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Puntuación final: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.fillText('Presiona F5 para reiniciar', this.canvas.width / 2, this.canvas.height / 2 + 100);
        }

        // Mostrar texto de nivel
        if (this.showingLevelText) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`NIVEL ${this.currentLevel}`, this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    showGameOver() {
        this.fadeOutMusic();
        const gameOverScreen = document.createElement('div');
        gameOverScreen.style.position = 'absolute';
        gameOverScreen.style.top = '50%';
        gameOverScreen.style.left = '50%';
        gameOverScreen.style.transform = 'translate(-50%, -50%)';
        gameOverScreen.style.textAlign = 'center';
        gameOverScreen.style.color = 'white';
        gameOverScreen.style.fontSize = '24px';
        gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverScreen.style.padding = '20px';
        gameOverScreen.style.borderRadius = '10px';
        gameOverScreen.style.zIndex = '1000';
        gameOverScreen.innerHTML = `
            <h2>GAME OVER</h2>
            <p>Puntuación final: ${this.score}</p>
            <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px; font-size: 18px; cursor: pointer;">
                Reiniciar Juego
            </button>
        `;
        document.body.appendChild(gameOverScreen);
    }

    showVictoryScreen() {
        this.gameOver = true;
        this.fadeOutMusic();
        clearInterval(this.enemyInterval);
        
        const victoryScreen = document.createElement('div');
        victoryScreen.style.position = 'absolute';
        victoryScreen.style.top = '50%';
        victoryScreen.style.left = '50%';
        victoryScreen.style.transform = 'translate(-50%, -50%)';
        victoryScreen.style.textAlign = 'center';
        victoryScreen.style.color = 'white';
        victoryScreen.style.fontSize = '24px';
        victoryScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        victoryScreen.style.padding = '20px';
        victoryScreen.style.borderRadius = '10px';
        victoryScreen.style.zIndex = '1000';
        victoryScreen.innerHTML = `
            <h2>¡VICTORIA!</h2>
            <p>¡Has completado todos los niveles!</p>
            <p>Puntuación final: ${this.score}</p>
            <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 10px; font-size: 18px; cursor: pointer;">
                Jugar de nuevo
            </button>
        `;
        document.body.appendChild(victoryScreen);
    }

    shoot() {
        if (this.currentPowerUp) {
            switch (this.currentPowerUp) {
                case 'laserBeam':
                    // Tres rayos láser paralelos
                    this.bullets.push(
                        new Bullet(this.player.x + 30, this.player.y + 5, 'laser'),  // Rayo superior
                        new Bullet(this.player.x + 30, this.player.y + 15, 'laser'), // Rayo central
                        new Bullet(this.player.x + 30, this.player.y + 25, 'laser')  // Rayo inferior
                    );
                    break;
                case 'tripleShot':
                    this.bullets.push(
                        new Bullet(this.player.x + 30, this.player.y + 15),
                        new Bullet(this.player.x + 30, this.player.y + 15, 'normal', -0.2),
                        new Bullet(this.player.x + 30, this.player.y + 15, 'normal', 0.2)
                    );
                    break;
                case 'superShot':
                    this.bullets.push(new Bullet(
                        this.player.x + 30,
                        this.player.y + 15,
                        'super'
                    ));
                    break;
                default:
                    this.bullets.push(new Bullet(
                        this.player.x + 30,
                        this.player.y + 15
                    ));
            }
        } else {
            this.bullets.push(new Bullet(
                this.player.x + 30,
                this.player.y + 15
            ));
        }
        Resources.playSound('shoot');
    }

    spawnBoss() {
        const boss = new BossFight(
            this.canvas.width - 100,
            this.canvas.height / 2,
            this.currentLevel
        );
        this.enemies.push(boss);
        Resources.playSound('explosion');
    }

    startNextLevel() {
        if (this.currentLevel < this.maxLevel) {
            // Bajar volumen durante la transición
            this.fadeOutMusic(1000);
            
            this.currentLevel++;
            this.levelStartTime = Date.now();
            this.bossSpawned = false;
            
            // Limpiar enemigos y balas existentes
            this.enemies = [];
            this.enemyBullets = [];
            
            // Mostrar texto de nivel
            this.showLevelText();
            
            // Reiniciar generación de enemigos con nuevo intervalo
            clearInterval(this.enemyInterval);
            this.enemyInterval = setInterval(
                () => this.spawnEnemy(), 
                this.enemySpawnIntervals[this.currentLevel]
            );
            
            // Restaurar volumen después de 3 segundos
            setTimeout(() => {
                this.fadeInMusic(1000);
            }, 3000);
        } else {
            // Victoria final del juego (solo después del nivel 5)
            this.fadeOutMusic(2000);
            this.showVictoryScreen();
        }
    }

    showLevelText() {
        this.showingLevelText = true;
        clearTimeout(this.levelTextTimer);
        this.levelTextTimer = setTimeout(() => {
            this.showingLevelText = false;
        }, 3000); // Mostrar durante 3 segundos
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 30;
    }
}

class Bullet {
    constructor(x, y, type = 'normal', angleOffset = 0) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.angleOffset = angleOffset;
        
        switch(type) {
            case 'laser':
                this.width = 100;
                this.height = 3;
                this.speed = 10;
                this.damage = 0.1;
                break;
            case 'super':
                this.width = 40;
                this.height = 40;
                this.speed = 5;
                this.damage = 20;
                this.isSuperShot = true;
                break;
            default:
                this.width = 20;
                this.height = 8;
                this.speed = 7;
                this.damage = 1;
        }
    }

    update() {
        this.x += this.speed * Math.cos(this.angleOffset);
        this.y += this.speed * Math.sin(this.angleOffset);
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 40;
        this.height = 40;
        this.lastShot = 0;
        
        // Configuración según el tipo
        switch(type) {
            case 1: // Enemigo básico - disparo recto
                this.speed = 3;
                this.health = 1;
                this.points = 100;
                this.shootProbability = 0.02;
                break;
            case 2: // Enemigo medio - disparo doble diagonal
                this.speed = 4;
                this.health = 2;
                this.points = 200;
                this.shootProbability = 0.015;
                break;
            case 3: // Enemigo fuerte - disparo grande
                this.speed = 2;
                this.health = 3;
                this.points = 300;
                this.shootProbability = 0.01;
                break;
        }
    }

    shoot(bulletArray) {
        const now = Date.now();
        if (now - this.lastShot < 1000) return; // Cooldown de 1 segundo entre disparos
        
        switch(this.type) {
            case 1: // Disparo recto
                bulletArray.push(new EnemyBullet(
                    this.x,
                    this.y + this.height/2,
                    -5, // velocidad X
                    0,  // velocidad Y
                    false // no es bala grande
                ));
                break;
                
            case 2: // Disparo doble diagonal
                bulletArray.push(
                    new EnemyBullet(
                        this.x,
                        this.y + this.height/2,
                        -5, // velocidad X
                        -2, // velocidad Y hacia arriba
                        false
                    ),
                    new EnemyBullet(
                        this.x,
                        this.y + this.height/2,
                        -5, // velocidad X
                        2,  // velocidad Y hacia abajo
                        false
                    )
                );
                break;
                
            case 3: // Disparo grande
                bulletArray.push(new EnemyBullet(
                    this.x,
                    this.y + this.height/2 - 15,
                    -4, // velocidad X más lenta
                    0,  // velocidad Y
                    true // es bala grande
                ));
                break;
        }
        
        this.lastShot = now;
    }

    update() {
        this.x -= this.speed;
    }

    takeDamage(damage, isSuperShot = false) {
        if (isSuperShot && !(this instanceof BossFight)) {
            this.health = 0;
            return true;
        }
        this.health -= damage;
        return this.health <= 0;
    }
}

class EnemyBullet {
    constructor(x, y, speedX, speedY, isLarge = false) {
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.width = isLarge ? 30 : 20;
        this.height = isLarge ? 30 : 8;
        this.isLarge = isLarge;
        this.angle = Math.atan2(speedY, speedX);
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Ajustar tamaño según el tipo
        if (type === 'extraLife') {
            this.width = 40;  // Vida extra más grande
            this.height = 40;
        } else {
            this.width = 30;
            this.height = 30;
        }
        
        this.speed = 2;
        
        // Configurar color e icono según el tipo
        switch(type) {
            case 'extraLife':
                this.color = '#ff0000';
                this.icon = '❤️';
                break;
            case 'laserBeam':
                this.color = '#00ff00';
                this.icon = '↔️';
                break;
            case 'tripleShot':
                this.color = '#0000ff';
                this.icon = '⋔';
                break;
            case 'superShot':
                this.color = '#ffff00';
                this.icon = '★';
                break;
        }
    }

    update() {
        this.x -= this.speed;
    }
}

class BossFight extends Enemy {
    constructor(x, y, level = 1) {
        super(x, y, 4);
        this.level = level;
        this.width = 120;
        this.height = 120;
        
        // Escalar estadísticas según el nivel de manera más suave
        const levelMultiplier = 1 + (level - 1) * 0.2; // Reducido de 0.5 a 0.2
        this.health = Math.floor(500 * levelMultiplier);
        this.maxHealth = this.health;
        this.points = 5000 * level;
        this.speed = 1 + (level - 1) * 0.1; // Reducido de 0.2 a 0.1
        this.shootProbability = 0.03 + (level - 1) * 0.005; // Reducido de 0.01 a 0.005
        
        this.movementPhase = 0;
        this.lastPhaseChange = Date.now();
        this.phaseInterval = Math.max(4000 - (level - 1) * 300, 2500); // Ajustado para ser menos agresivo
        this.rightLimit = x - 100;
        this.shootPattern = 0;
        this.isDead = false;
        this.initialX = x - 100;
    }

    update() {
        // Mantener la posición X fija
        this.x = this.initialX;
        
        // Actualizar fase de movimiento
        const now = Date.now();
        if (now - this.lastPhaseChange > this.phaseInterval) {
            this.movementPhase = (this.movementPhase + 1) % 2;
            this.lastPhaseChange = now;
        }
        
        // Movimiento vertical
        const amplitude = 100; // Rango de movimiento vertical
        const speed = this.speed;
        
        if (this.movementPhase === 0) {
            this.y += speed;
            if (this.y > window.game.canvas.height - this.height - 10) {
                this.y = window.game.canvas.height - this.height - 10;
                this.movementPhase = 1;
            }
        } else {
            this.y -= speed;
            if (this.y < 10) {
                this.y = 10;
                this.movementPhase = 0;
            }
        }
    }

    shoot(bulletArray) {
        const now = Date.now();
        if (now - this.lastShot < Math.max(1000 - (this.level - 1) * 100, 500)) return;

        this.shootPattern = (this.shootPattern + 1) % (this.level + 1);

        switch(this.shootPattern) {
            case 0:
                // Patrón 1: Tres balas en abanico
                const angles = [-0.3, 0, 0.3];
                angles.forEach(angle => {
                    bulletArray.push(new EnemyBullet(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        Math.cos(angle) * (3 + this.level),
                        Math.sin(angle) * (3 + this.level),
                        false
                    ));
                });
                break;
            case 1:
                // Patrón 2: Bala dirigida al jugador
                if (window.game?.player) {
                    const dx = window.game.player.x - this.x;
                    const dy = window.game.player.y - this.y;
                    const angle = Math.atan2(dy, dx);
                    bulletArray.push(new EnemyBullet(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        Math.cos(angle) * (4 + this.level),
                        Math.sin(angle) * (4 + this.level),
                        true
                    ));
                }
                break;
            default:
                // Patrones adicionales para niveles superiores
                if (this.level >= 3) {
                    // Patrón circular
                    const numBullets = 4 + this.level;
                    for (let i = 0; i < numBullets; i++) {
                        const angle = (Math.PI * 2 * i) / numBullets;
                        bulletArray.push(new EnemyBullet(
                            this.x + this.width/2,
                            this.y + this.height/2,
                            Math.cos(angle) * 3,
                            Math.sin(angle) * 3,
                            false
                        ));
                    }
                }
                break;
        }

        this.lastShot = now;
    }

    takeDamage(damage, isSuperShot = false) {
        this.health -= damage;
        
        // Efectos visuales al recibir daño
        if (window.game && Math.random() < 0.3) {
            const angle = Math.random() * Math.PI * 2;
            const explosion = new EnemyBullet(
                this.x + Math.random() * this.width,
                this.y + Math.random() * this.height,
                Math.cos(angle),
                Math.sin(angle),
                false
            );
            window.game.enemyBullets.push(explosion);
        }

        // Si el jefe es derrotado
        if (this.health <= 0 && !this.isDead) {
            this.isDead = true;
            
            // Explosión final más grande y duradera
            const createExplosion = (delay) => {
                setTimeout(() => {
                    for (let i = 0; i < 15; i++) {
                        const angle = (Math.PI * 2 * i) / 15;
                        const distance = Math.random() * 100;
                        const explosion = new EnemyBullet(
                            this.x + this.width/2 + Math.cos(angle) * distance,
                            this.y + this.height/2 + Math.sin(angle) * distance,
                            Math.cos(angle) * 3,
                            Math.sin(angle) * 3,
                            true
                        );
                        if (window.game) {
                            window.game.enemyBullets.push(explosion);
                        }
                    }
                    Resources.playSound('explosion');
                }, delay);
            };
            
            // Crear múltiples explosiones en secuencia
            for (let i = 0; i < 5; i++) {
                createExplosion(i * 500); // Una explosión cada 500ms
            }
            
            // Esperar más tiempo antes de iniciar el siguiente nivel
            if (window.game) {
                setTimeout(() => {
                    if (window.game.currentLevel < window.game.maxLevel) {
                        window.game.startNextLevel();
                    } else {
                        window.game.showVictoryScreen();
                    }
                }, 3000); // Esperar 3 segundos antes de cambiar de nivel
            }
        }
        return this.health <= 0;
    }
}

// Modificar la inicialización del juego para hacerlo accesible globalmente
window.onload = async () => {
    try {
        window.game = new Game();
    } catch (error) {
        console.error('Error al iniciar el juego:', error);
        document.getElementById('resourceStatus').textContent = 'Error al iniciar el juego. Por favor, recarga la página.';
    }
}; 