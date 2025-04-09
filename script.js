const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let balloons = [];
let particles = [];
const initialRadius = 30;

// Generates a random  color.
function getRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

// Create shuffled alphabet array
const alphabet = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));
let shuffledAlphabet = [...alphabet].sort(() => Math.random() - 0.5);
let currentLetterIndex = 0;

// balloon creation with unique letters
document.getElementById("pumpBtn").addEventListener("click", () => {
  const newBalloon = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    radius: initialRadius,
    color: getRandomColor(),
    isFlying: true,
    burst: false,
    letter: shuffledAlphabet[currentLetterIndex++ % 26],
    dx: Math.random() * 2 - 1,
    dy: Math.random() * 2 - 1
  };
  if (balloons.length >= 5) {
    balloons.shift();
  }
  balloons.push(newBalloon);
});

// Reset all balloons and redraw empty canvas
document.getElementById("resetBtn").addEventListener("click", () => {
  balloons = [];
  draw();
});

// Detect canvas clicks and burst balloons on collision
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  balloons.forEach(balloon => {
    const dist = Math.sqrt((mx - balloon.x) ** 2 + (my - balloon.y) ** 2);
    
    if (dist <= balloon.radius && balloon.isFlying && !balloon.burst) {
      balloon.burst = true;
      drawBurst(balloon);
    }
  });
});

// text drawing in balloon
function drawBalloon(balloon) {
  if (balloon.burst) return;

  ctx.beginPath();
  ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
  ctx.fillStyle = balloon.color;
  ctx.fill();
  ctx.closePath();
  
  // Text styling with gradient and shadow
  ctx.font = `bold ${balloon.radius * 0.8}px Impact`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Enhanced shadow effect
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  
  // Create gradient fill
  const gradient = ctx.createLinearGradient(
    balloon.x - balloon.radius/2, balloon.y,
    balloon.x + balloon.radius/2, balloon.y
  );
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#e0e0e0');
  
  // Draw text with stronger contrast
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.strokeText(balloon.letter, balloon.x, balloon.y);
  ctx.fillStyle = gradient;
  ctx.fillText(balloon.letter, balloon.x, balloon.y);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
}

// physics simulation for both particles and balloons
function update() {
  particles = particles.filter(p => p.life > 0);
  
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;
    p.life -= p.decay;
  });
  
  balloons.forEach(balloon => {
    if (!balloon.burst) {
      balloon.x += balloon.dx;
      balloon.y += balloon.dy;

      // Bounce off walls
      if (balloon.x + balloon.radius > canvas.width || balloon.x - balloon.radius < 0) {
        balloon.dx *= -1;
      }
      if (balloon.y - balloon.radius < 0 || balloon.y + balloon.radius > canvas.height) {
        balloon.dy *= -1;
      }
    }
  });
}

// Create burst particle effect when balloon is popped
function drawBurst(balloon) {
  if (balloon.burst) {
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2) * (i / 30);
      const speed = Math.random() * 3 + 3;
      particles.push({
        x: balloon.x,
        y: balloon.y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color: balloon.color,
        size: Math.random() * 3 + 2,
        life: Math.random() * 0.5 + 0.5,
        decay: Math.random() * 0.02 + 0.02
      });
    }
  }
}

// Render particles with fading alpha and rotation effects
function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.life * Math.PI * 2);
    ctx.scale(p.life, p.life);
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  });
  ctx.globalAlpha = 1.0;
}

// Main draw loop - Clears canvas and updates animations
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  balloons.forEach(balloon => {
    drawBalloon(balloon);
  });
  drawParticles();
  update();
  requestAnimationFrame(draw);
}

draw();
