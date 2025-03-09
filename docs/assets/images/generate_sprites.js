// Función para generar sprites temporales
function generateSprites() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Fondo espacial
    canvas.width = 800;
    canvas.height = 600;
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2,
            Math.random() * 2
        );
    }
    saveCanvas(canvas, 'space-background.png');

    // Nave del jugador
    canvas.width = 50;
    canvas.height = 30;
    ctx.fillStyle = '#4488ff';
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(40, 0);
    ctx.lineTo(50, 15);
    ctx.lineTo(40, 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#22cc22';
    ctx.fillRect(35, 13, 5, 4);
    saveCanvas(canvas, 'player-ship.png');

    // Enemigos
    const enemyColors = ['#ff4444', '#ffaa44', '#ff44ff'];
    const enemyTypes = [
        // Tipo 1: Triangular
        (ctx) => {
            ctx.beginPath();
            ctx.moveTo(40, 20);
            ctx.lineTo(0, 0);
            ctx.lineTo(0, 40);
            ctx.closePath();
            ctx.fill();
        },
        // Tipo 2: Rombo
        (ctx) => {
            ctx.beginPath();
            ctx.moveTo(20, 0);
            ctx.lineTo(40, 20);
            ctx.lineTo(20, 40);
            ctx.lineTo(0, 20);
            ctx.closePath();
            ctx.fill();
        },
        // Tipo 3: Hexágono
        (ctx) => {
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(30, 0);
            ctx.lineTo(40, 20);
            ctx.lineTo(30, 40);
            ctx.lineTo(10, 40);
            ctx.lineTo(0, 20);
            ctx.closePath();
            ctx.fill();
        }
    ];

    canvas.width = 40;
    canvas.height = 40;
    enemyTypes.forEach((drawEnemy, index) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = enemyColors[index];
        drawEnemy(ctx);
        saveCanvas(canvas, `enemy${index + 1}.png`);
    });

    // Disparo
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
    saveCanvas(canvas, 'bullet.png');

    // Explosión
    canvas.width = 40;
    canvas.height = 40;
    const gradient = ctx.createRadialGradient(20, 20, 0, 20, 20, 20);
    gradient.addColorStop(0, '#ffff00');
    gradient.addColorStop(0.5, '#ff4400');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 40, 40);
    saveCanvas(canvas, 'explosion.png');
}

function saveCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Ejecutar cuando se cargue la página
window.onload = generateSprites; 