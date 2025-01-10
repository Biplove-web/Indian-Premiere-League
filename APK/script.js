const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const currentScoreEl = document.getElementById("current-score");
const highestScoreEl = document.getElementById("highest-score");

// Set canvas dimensions
canvas.width = 600;
canvas.height = 400;

// Game variables
const slingshotOrigin = { x: 100, y: 300 };
const ball = { x: 100, y: 300, radius: 15, isDragging: false, vx: 0, vy: 0, released: false };
let currentScore = 0;
let highestScore = 0;
const gravity = 0.5;
const drag = 0.98; // Air resistance
let targets = []; // Array for infinite targets

// Create a new target
function createTarget() {
  const radius = Math.random() > 0.5 ? 30 : 15; // Large or small ball
  return {
    x: Math.random() * 400 + 150, // Random x-position
    y: Math.random() * 200 + 100, // Random y-position
    radius: radius,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color
    points: radius === 30 ? 1 : 2, // Points based on size
  };
}

// Add a target every 2 seconds
setInterval(() => {
  targets.push(createTarget());
}, 2000);

// Mouse events
canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Check if the ball is clicked
  if (
    Math.sqrt((mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2) <= ball.radius
  ) {
    ball.isDragging = true;
    ball.released = false; // Reset release flag
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (ball.isDragging) {
    const rect = canvas.getBoundingClientRect();
    ball.x = e.clientX - rect.left;
    ball.y = e.clientY - rect.top;
  }
});

canvas.addEventListener("mouseup", () => {
  if (ball.isDragging) {
    ball.isDragging = false;
    ball.released = true; // Ball is now launched

    // Launch the ball
    ball.vx = (slingshotOrigin.x - ball.x) * 0.2;
    ball.vy = (slingshotOrigin.y - ball.y) * 0.2;
  }
});

// Update logic
function update() {
  // Apply physics if the ball is not being dragged
  if (!ball.isDragging) {
    ball.vy += gravity; // Apply gravity
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Apply drag
    ball.vx *= drag;
    ball.vy *= drag;

    // Bounce off the walls
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
      ball.vx = -ball.vx;
    }
    if (ball.y + ball.radius > canvas.height) {
      ball.vy = -ball.vy * 0.8; // Lose some energy on bounce
      ball.y = canvas.height - ball.radius;
    }
  }

  // Check for collisions with targets after ball is released
  if (ball.released) {
    targets = targets.filter((target) => {
      const dist = Math.sqrt((ball.x - target.x) ** 2 + (ball.y - target.y) ** 2);
      if (dist <= ball.radius + target.radius) {
        currentScore += target.points; // Increment score
        updateScoreboard();
        return false; // Remove target on collision
      }
      return true;
    });
  }
}

// Update scoreboard
function updateScoreboard() {
  currentScoreEl.textContent = `Score: ${currentScore}`;
  if (currentScore > highestScore) {
    highestScore = currentScore;
    highestScoreEl.textContent = `Highest: ${highestScore}`;
  }
}

// Render function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw slingshot
  ctx.beginPath();
  ctx.moveTo(slingshotOrigin.x, slingshotOrigin.y);
  ctx.lineTo(ball.x, ball.y);
  ctx.strokeStyle = "brown";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.closePath();

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();

  // Draw targets
  targets.forEach((target) => {
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fillStyle = target.color;
    ctx.fill();
    ctx.closePath();
  });
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
