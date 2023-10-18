const dino = document.getElementById('dino');
const obstacle = document.getElementById('obstacle');
let isJumping = false;
let obstacleInterval;

document.addEventListener('keydown', function (event) {
    if (event.code === 'Space' && !isJumping) {
        jump();
    }
});

function jump() {
    isJumping = true;
    let jumpCount = 0;
    const jumpInterval = setInterval(() => {
        // Changed the range of jumpCount to 40 (doubled from 20) for a higher jump.
        if (jumpCount > 40) {
            clearInterval(jumpInterval);
            let fallCount = jumpCount;
            const fallInterval = setInterval(() => {
                if (fallCount < 0) {
                    clearInterval(fallInterval);
                    isJumping = false;
                } else {
                    // Adjust the downward movement to -6px (doubled from -3px).
                    dino.style.bottom = (fallCount * 3) + 'px';
                    fallCount--;
                }
            }, 10);
        } else {
            // Adjust the upward movement to 6px (doubled from 3px).
            dino.style.bottom = (jumpCount * 3) + 'px';
            jumpCount++;
        }
    }, 10);
}

function moveObstacle() {
    const obstaclePosition = parseInt(window.getComputedStyle(obstacle).right);
    obstacle.style.right = obstaclePosition + 2 + 'px';

    if (obstaclePosition > 600) {
        obstacle.style.right = '0px';
    }

    if (isColliding(dino, obstacle)) {
        endGame();
    }
}

function isColliding(div1, div2) {
    const dinoRect = div1.getBoundingClientRect();
    const obstacleRect = div2.getBoundingClientRect();

    return !(dinoRect.top > obstacleRect.bottom ||
        dinoRect.bottom < obstacleRect.top ||
        dinoRect.right < obstacleRect.left ||
        dinoRect.left > obstacleRect.right);
}

function endGame() {
    alert('Game Over! Reload to play again.');
    clearInterval(obstacleInterval);
}

obstacleInterval = setInterval(moveObstacle, 5);