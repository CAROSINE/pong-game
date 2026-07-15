// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleHeight = 80;
const paddleWidth = 10;
const ballSize = 7;
const paddleSpeed = 5;
const ballSpeed = 5;
const computerAI = 3.5; // Computer paddle speed

// Player paddle (left)
let playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Computer paddle (right)
let computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: ballSpeed,
    vy: ballSpeed,
    size: ballSize
};

// Score
let playerScore = 0;
let computerScore = 0;

// Keyboard input
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse input for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerPaddle.y = mouseY - paddleHeight / 2;
});

// Reset game
document.getElementById('resetBtn').addEventListener('click', resetGame);

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    ball.vy = (Math.random() - 0.5) * ballSpeed * 2;
}

// Update player paddle position based on arrow keys
function updatePlayerPaddle() {
    if (keys['ArrowUp'] && playerPaddle.y > 0) {
        playerPaddle.y -= paddleSpeed;
    }
    if (keys['ArrowDown'] && playerPaddle.y < canvas.height - paddleHeight) {
        playerPaddle.y += paddleSpeed;
    }
    // Clamp paddle position
    playerPaddle.y = Math.max(0, Math.min(playerPaddle.y, canvas.height - paddleHeight));
}

// Update computer AI
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + paddleHeight / 2;
    const ballCenter = ball.y;
    const difference = ballCenter - computerCenter;
    
    // AI follows the ball with some lag
    if (difference < -10) {
        computerPaddle.y -= computerAI;
    } else if (difference > 10) {
        computerPaddle.y += computerAI;
    }
    
    // Clamp paddle position
    computerPaddle.y = Math.max(0, Math.min(computerPaddle.y, canvas.height - paddleHeight));
}

// Collision detection for paddles
function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.size < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y - ball.size < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    ) {
        // Reflect the ball
        ball.vx = -ball.vx * 1.05; // Slight speed increase on paddle hit
        
        // Add spin based on where ball hits the paddle
        const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        ball.vy += hitPos * ballSpeed * 0.5;
        
        // Prevent ball from getting stuck
        if (paddle === playerPaddle) {
            ball.x = paddle.x + paddle.width + ball.size;
        } else {
            ball.x = paddle.x - ball.size;
        }
        
        return true;
    }
    return false;
}

// Update ball position
function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Wall collision (top and bottom)
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.vy = -ball.vy;
        ball.y = Math.max(ball.size, Math.min(ball.y, canvas.height - ball.size));
    }
    
    // Paddle collisions
    checkPaddleCollision(playerPaddle);
    checkPaddleCollision(computerPaddle);
    
    // Score points
    if (ball.x - ball.size < 0) {
        computerScore++;
        updateScore();
        resetBall();
    } else if (ball.x + ball.size > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = '#00ff00';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawCenterLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
}

// Game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();