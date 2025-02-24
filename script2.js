const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
const scoreElement = document.getElementById('score');

let currentLevel = 0;
let currentPath = [];
let isDragging = false;

const circleRadius = 30;
const spacing = 15;
const equations = [
    { numbers: [1, '+', 2, '-', 3, '+', 4, '=', 4, 5, '-', 1, '+', 6, '=', 10, 7, 'x', 2, '=', 14, 8, '/', 2, '=', 4, 9], solutions: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]] }
];

let circles = [];

function resizeCanvas() {
    const minSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6);
    canvas.width = minSize;
    canvas.height = minSize;

    canvas.style.position = 'absolute';
    canvas.style.left = `${(window.innerWidth - canvas.width) / 2}px`;
    canvas.style.top = `${(window.innerHeight - canvas.height) / 2}px`;

    positionCircles();
    drawGame();
}

function positionCircles() {
    const cols = 5;
    const rows = 5;
    const gridSize = (canvas.width - spacing * (cols - 1)) / cols;

    circles = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            circles.push({
                x: col * (gridSize + spacing) + gridSize / 2,
                y: row * (gridSize + spacing) + gridSize / 2
            });
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    if (currentPath.length > 1) {
        for (let i = 1; i < currentPath.length; i++) {
            let from = circles[currentPath[i - 1]];
            let to = circles[currentPath[i]];
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
        }
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    circles.forEach((circle, index) => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = currentPath.includes(index) ? '#357ABD' : '#4a90e2';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(equations[currentLevel].numbers[index] || '', circle.x, circle.y);
    });
}

function getCircleIndex(x, y) {
    for (let i = 0; i < circles.length; i++) {
        if (Math.hypot(circles[i].x - x, circles[i].y - y) < circleRadius) {
            return i;
        }
    }
    return null;
}

canvas.addEventListener('mousedown', () => { isDragging = true; currentPath = []; });
canvas.addEventListener('mouseup', () => { isDragging = false; checkSolution(); });
canvas.addEventListener('mouseleave', () => { isDragging = false; });
canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    let index = getCircleIndex(e.clientX - rect.left, e.clientY - rect.top);
    if (index !== null && !currentPath.includes(index)) {
        currentPath.push(index);
        drawGame();
    }
});

canvas.addEventListener('touchstart', (e) => { 
    isDragging = true; 
    currentPath = []; 
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    let index = getCircleIndex(touch.clientX - rect.left, touch.clientY - rect.top);
    if (index !== null && !currentPath.includes(index)) {
        currentPath.push(index);
        drawGame();
    }
    e.preventDefault();
});

canvas.addEventListener('touchend', () => { isDragging = false; checkSolution(); });

function checkSolution() {
    const validSolutions = equations[currentLevel].solutions;
    
    const isCorrect = validSolutions.some(solution => JSON.stringify(currentPath) === JSON.stringify(solution));

    if (isCorrect) {
        score++;
        scoreElement.textContent = score;
        alert('Correct! Moving to next level.');
        currentLevel = (currentLevel + 1) % equations.length;
    } 
    currentPath = [];
    drawGame();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
