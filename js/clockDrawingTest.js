import { currentSession } from './state.js';
import { checkAllCompleted } from './app.js';

const canvas = document.getElementById("clockCanvas");
const ctx = canvas.getContext("2d");
let drawingActive = false;
let eraserMode = false;
let drawingStarted = false;

export function initCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
}

function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let cx, cy;
    if (e.touches) {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
        e.preventDefault();
    } else {
        cx = e.clientX;
        cy = e.clientY;
    }
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
}

function startDraw(e) {
    if (!drawingActive) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawingStarted = true;
    canvas.addEventListener("mousemove", drawMove);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("touchmove", drawMove);
    canvas.addEventListener("touchend", endDraw);
}

function drawMove(e) {
    if (!drawingActive) return;
    const { x, y } = getCoords(e);
    if (eraserMode) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 20;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.restore();
    } else {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function endDraw() {
    canvas.removeEventListener("mousemove", drawMove);
    canvas.removeEventListener("mouseup", endDraw);
    canvas.removeEventListener("touchmove", drawMove);
    canvas.removeEventListener("touchend", endDraw);
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("touchstart", startDraw);

export function startDrawing() {
    if (!drawingActive) {
        initCanvas();
        drawingActive = true;
        drawingStarted = false;
        const btn = document.getElementById("startDrawingBtn");
        btn.innerText = "✏️ Рисование активно";
        btn.style.background = "#10b981";
        document.getElementById("saveDrawingResult").disabled = false;
    }
}

export function clearCanvas() {
    initCanvas();
    drawingStarted = false;
}

export function toggleEraser() {
    eraserMode = !eraserMode;
    const btn = document.getElementById("eraserBtn");
    btn.style.background = eraserMode ? "#d97706" : "#f59e0b";
    btn.innerText = eraserMode ? "✏️ Рисование" : "🧽 Ластик";
}

export function saveDrawing() {
    const circle = document.getElementById("checkCircle").checked;
    const numbers = document.getElementById("checkNumbers").checked;
    const hands = document.getElementById("checkHands").checked;
    let score = 0;
    if (circle) score++;
    if (numbers) score++;
    if (hands) score++;
    
    currentSession.drawingScore = score;
    currentSession.drawingChecklist = { circle, numbers, hands };
    currentSession.drawingCompleted = true;
    
    document.getElementById("drawingResult").innerHTML = `✅ Рисование оценено: ${score}/3 баллов`;
    drawingActive = false;
    const startBtn = document.getElementById("startDrawingBtn");
    startBtn.innerText = "▶️ Начать рисование";
    startBtn.style.background = "#2c5f8a";
    document.getElementById("saveDrawingResult").disabled = true;
    document.querySelector('.tab-btn[data-tab="tab-animals"]').click();
    checkAllCompleted();
}