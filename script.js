const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
const scoreElement = document.getElementById('score');

let currentLevel = 0;
let currentPath = [];
let hoveredCircle = null;

const circleRadius = 50;
const margin = 25;
const equations = [
    { numbers: [100, '+', 200, '-', 10, '+', 10, '=', 300], solution: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
    { numbers: [10, '+', '-', 5, 20, 15, '+', '=', 10], solution: [0, 1, 3, 2, 4, 6, 5, 7, 8] },
    { numbers: [100, '+', 100, '-', 10, '+', 10, '=', 200], solution: [0, 1, 2, 3, 4, 5, 6, 7, 8] }
];

let circles = [];

function resizeCanvas() {
    const minSize = Math.min(window.innerWidth * 1.2, window.innerHeight * 0.7);
    canvas.width = minSize - margin * 2;
    canvas.height = minSize - margin * 2;
    canvas.style.margin = 'auto';
    canvas.style.display = 'block';
    positionCircles();
    drawGame();
}

function positionCircles() {
    const cols = 3;
    const rows = 3;
    const gridSize = Math.min(canvas.width, canvas.height) / (cols + 1);
    
    circles = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            circles.push({
                x: (col + 1) * gridSize,
                y: (row + 1) * gridSize
            });
        }
    }
}

function getEdgePoint(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    const ratio = circleRadius / distance;
    return {
        x: from.x + dx * ratio,
        y: from.y + dy * ratio
    };
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    if (currentPath.length > 1) {
        for (let i = 1; i < currentPath.length; i++) {
            let from = circles[currentPath[i - 1]];
            let to = circles[currentPath[i]];
            let start = getEdgePoint(from, to);
            let end = getEdgePoint(to, from);
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
        }
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    if (hoveredCircle !== null && currentPath.length > 0 && !currentPath.includes(hoveredCircle)) {
        let lastCircle = circles[currentPath[currentPath.length - 1]];
        let hoverCircle = circles[hoveredCircle];
        let start = getEdgePoint(lastCircle, hoverCircle);
        let end = getEdgePoint(hoverCircle, lastCircle);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.5)';
        ctx.lineWidth = 10;
        ctx.stroke();
    }

    circles.forEach((circle, index) => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = currentPath.includes(index) ? '#357ABD' : hoveredCircle === index ? '#5A9CE3' : '#4a90e2';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(equations[currentLevel].numbers[index], circle.x, circle.y);
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    let newHoveredCircle = null;
    for (let i = 0; i < circles.length; i++) {
        if (Math.hypot(circles[i].x - mousePos.x, circles[i].y - mousePos.y) < circleRadius) {
            newHoveredCircle = i;
            break;
        }
    }
    if (newHoveredCircle !== hoveredCircle) {
        hoveredCircle = newHoveredCircle;
        requestAnimationFrame(drawGame);
    }
});

canvas.addEventListener('click', () => {
    if (hoveredCircle !== null && !currentPath.includes(hoveredCircle)) {
        currentPath.push(hoveredCircle);
        drawGame();
        if (currentPath.length === equations[currentLevel].solution.length) checkSolution();
    }
});

function checkSolution() {
    if (JSON.stringify(currentPath) === JSON.stringify(equations[currentLevel].solution)) {
        score++;
        scoreElement.textContent = score;
        alert('Correct! Moving to next level.');
        currentLevel = (currentLevel + 1) % equations.length;
    } else {
        alert('Incorrect. Try again.');
    }
    currentPath = [];
    drawGame();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
