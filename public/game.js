const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const players = {};
const bullets = [];
const socket = io.connect('http://localhost:3000');

let isDead = false;
let mousePos = { x: 0, y: 0 };

const movement = {
    up: false,
    down: false,
    left: false,
    right: false
};

socket.on('currentPlayers', (currentPlayers) => {
    Object.assign(players, currentPlayers);
    drawAllPlayers();
});

socket.on('newPlayer', (playerData) => {
    players[playerData.id] = playerData;
    drawAllPlayers();
});

socket.on('playerMoved', (data) => {
    players[data.id] = data;
    drawAllPlayers();
});

socket.on('playerDisconnected', (id) => {
    delete players[id];
    drawAllPlayers();
});

socket.on('bulletShot', (bullet) => {
    bullets.push(bullet);
});

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'W':
        case 'w':
            movement.up = true;
            break;
        case 'ArrowDown':
        case 'S':
        case 's':
            movement.down = true;
            break;
        case 'ArrowLeft':
        case 'A':
        case 'a':
            movement.left = true;
            break;
        case 'ArrowRight':
        case 'D':
        case 'd':
            movement.right = true;
            break;
        case 'R':
        case 'r':
            if (isDead) {
                isDead = false;
                socket.emit('respawn');
                init();
            }
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'W':
        case 'w':
            movement.up = false;
            break;
        case 'ArrowDown':
        case 'S':
        case 's':
            movement.down = false;
            break;
        case 'ArrowLeft':
        case 'A':
        case 'a':
            movement.left = false;
            break;
        case 'ArrowRight':
        case 'D':
        case 'd':
            movement.right = false;
            break;
    }
});

canvas.addEventListener('mousedown', shoot);
canvas.addEventListener('mousemove', (event) => {
    mousePos.x = event.clientX;
    mousePos.y = event.clientY;
});

function shoot() {
    if (!isDead) {
        const myPlayer = players[socket.id];
        const dx = mousePos.x - myPlayer.x;
        const dy = mousePos.y - myPlayer.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        const bullet = {
            x: myPlayer.x,
            y: myPlayer.y,
            dx: (dx / magnitude) * 5,
            dy: (dy / magnitude) * 5,
            owner: socket.id
        };

        bullets.push(bullet);
        socket.emit('bulletShot', bullet);
    }
}

function update() {
    const speed = 5;
    const myPlayer = players[socket.id];
    if (!myPlayer) return;

    if (movement.up) myPlayer.y -= speed;
    if (movement.down) myPlayer.y += speed;
    if (movement.left) myPlayer.x -= speed;
    if (movement.right) myPlayer.x += speed;

    // Update bullet positions
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        for (let id in players) {
            const player = players[id];
            if (bullet.owner !== id && isColliding(bullet, player)) {
                if (socket.id === id) {
                    displayDeathScreen();
                }
                socket.emit('playerHit', id);
                bullets.splice(index, 1);
            }
        }
    });

    socket.emit('playerMovement', { x: myPlayer.x, y: myPlayer.y });
    drawAllPlayers();

    requestAnimationFrame(update);
}

function isColliding(bullet, player) {
    const dist = Math.sqrt((bullet.x - player.x) ** 2 + (bullet.y - player.y) ** 2);
    return dist <= 25;
}

function displayDeathScreen() {
    isDead = true;
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'red';
    context.font = '30px Arial';
    context.fillText('You Died!', canvas.width / 2 - 70, canvas.height / 2 - 15);
    context.font = '20px Arial';
    context.fillText('Press R to respawn', canvas.width / 2 - 85, canvas.height / 2 + 20);
}

function drawAllPlayers() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {
        const player = players[id];
        context.fillStyle = player.color;
        context.fillRect(player.x, player.y, 50, 50);
    }

    bullets.forEach(bullet => {
        context.fillStyle = 'black';
        context.beginPath();
        context.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
        context.fill();
    });
}

function init() {
    drawAllPlayers();
    update();
}

init();
