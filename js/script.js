let patient = null;

let patientsDatabase = {};

let results = [];

let currentSession = {
    startTime: null,
    wordsList: [],
    recalledWords: [],
    memoryScore: null,
    drawingScore: null,
    drawingChecklist: { circle: false, numbers: false, hands: false },
    animalsList: [],
    animalsCount: null,
    memoryCompleted: false,
    drawingCompleted: false,
    animalsCompleted: false,
    allCompleted: false
};

let memorizeInterval = null;
let animalsInterval = null;
let globalTimerInterval = null;

const BASE_WORDS = [
    "яблоко", "стул", "монета", "дерево", "машина",
    "солнце", "книга", "дом", "ручка", "стол"
];

// ---------- РИСОВАНИЕ ----------
let drawingActive = false;
let eraserMode = false;
let drawingStarted = false;

const canvas = document.getElementById("clockCanvas");
const ctx = canvas.getContext("2d");

// ---------- ВСПОМОГАТЕЛЬНЫЕ ----------
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function secondsToTenths(seconds) {
    return seconds / 10;
}

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function updateGlobalTimerDisplay() {
    if (currentSession.startTime && !currentSession.allCompleted) {
        const elapsed = Math.floor((Date.now() - currentSession.startTime) / 1000);
        document.getElementById("globalTimerDisplay").innerText = formatTime(elapsed);
    }
}

function startGlobalTimer() {
    stopGlobalTimer();
    globalTimerInterval = setInterval(updateGlobalTimerDisplay, 1000);
}

function stopGlobalTimer() {
    if (globalTimerInterval) {
        clearInterval(globalTimerInterval);
        globalTimerInterval = null;
    }
}

function getPatientKey() {
    const name = patient.name.trim().toLowerCase().replace(/\s+/g, '_');
    const birth = patient.birth;
    return `cognitive_results_${name}_${birth}`;
}
//Функция обновления списка пациентов
function updatePatientSelector(){

    const selector =
    document.getElementById("patientSelector");

    selector.innerHTML =
    '<option value="">-- выбрать пациента --</option>';

    Object.keys(patientsDatabase).forEach(key=>{

        const p =
        patientsDatabase[key].patient;

        const option =
        document.createElement("option");

        option.value=key;

        option.textContent=
        `${p.name} (${p.birth})`;

        selector.appendChild(option);

    });

}

// ---------- LOCAL STORAGE ----------
function loadData(){

    const db = localStorage.getItem("cognitive_database");

    if(db){
        patientsDatabase = JSON.parse(db);
    }

    updatePatientSelector();
}

function saveAll(){

    if(!patient) return;

    const key = getPatientKey();

    patientsDatabase[key] = {

        patient: {...patient},

        results: results
    };

    localStorage.setItem(
        "cognitive_database",
        JSON.stringify(patientsDatabase)
    );

    updatePatientSelector();

    updateStats();
}

function displayPatientInfo() {
    const infoDiv = document.getElementById("patientInfo");
    if (!infoDiv) return;
    if (patient.name) {
        infoDiv.innerHTML = `
            ✅ Пациент: <strong>${patient.name}</strong><br>
            📅 Дата рождения: ${patient.birth || "не указана"}
        `;
    } else {
        infoDiv.innerHTML = "⚠️ Данные пациента не сохранены.";
    }
}

function clearAllData() {
    if (confirm("🗑️ Удалить все данные о пациенте и результатах тестов?")) {
        const key = getPatientKey();
        localStorage.removeItem("cognitive_patient");
        localStorage.removeItem(key);
        location.reload();
    }
}

// ---------- ТЕСТ ПАМЯТИ ----------
function startMemoryTest() {
    currentSession = {
        startTime: Date.now(),
        wordsList: shuffleArray([...BASE_WORDS]),
        recalledWords: [],
        memoryScore: null,
        drawingScore: null,
        drawingChecklist: { circle: false, numbers: false, hands: false },
        animalsList: [],
        animalsCount: null,
        memoryCompleted: false,
        drawingCompleted: false,
        animalsCompleted: false,
        allCompleted: false
    };
    startGlobalTimer();
    updateGlobalTimerDisplay();
    const container = document.getElementById("wordsContainer");
    container.innerHTML = currentSession.wordsList.map(w => `<span class="word">📝 ${w.toUpperCase()}</span>`).join("");
    document.getElementById("initialBlock").style.display = "none";
    document.getElementById("memorizeBlock").style.display = "block";
    let timeLeft = 30;
    const timerSpan = document.getElementById("memorizeTimer");
    if (memorizeInterval) clearInterval(memorizeInterval);
    memorizeInterval = setInterval(() => {
        timeLeft--;
        timerSpan.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(memorizeInterval);
            finishMemorize();
        }
    }, 1000);
}

function finishMemorize() {
    clearInterval(memorizeInterval);
    document.getElementById("memorizeBlock").style.display = "none";
    document.getElementById("recallBlock").style.display = "block";
}

function checkRecall() {
    const input = document.getElementById("recalledWords").value.toLowerCase();
    const words = input.split(/\s+/).filter(w => w.trim().length > 0);
    const uniqueWords = [...new Set(words)];
    const correct = uniqueWords.filter(w => currentSession.wordsList.includes(w)).length;
    currentSession.memoryScore = Math.round((correct / currentSession.wordsList.length) * 10);
    currentSession.recalledWords = uniqueWords;
    currentSession.memoryCompleted = true;
    document.getElementById("recallResult").innerHTML = `
        ✅ Запомнено: ${correct}/${currentSession.wordsList.length} (${currentSession.memoryScore}/10 баллов)
    `;
    document.getElementById("checkRecallBtn").disabled = true;
    document.querySelector('.tab-btn[data-tab="tab-clock"]').click();
    checkAllCompleted();
}

// ---------- CANVAS ----------
function initCanvas() {
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

// ---------- КНОПКИ РИСОВАНИЯ ----------
const startDrawingBtn = document.getElementById("startDrawingBtn");
startDrawingBtn.addEventListener("click", () => {
    if (!drawingActive) {
        initCanvas();
        drawingActive = true;
        drawingStarted = false;
        startDrawingBtn.innerText = "✏️ Рисование активно";
        startDrawingBtn.style.background = "#10b981";
        document.getElementById("saveDrawingResult").disabled = false;
    }
});

document.getElementById("clearCanvasBtn").addEventListener("click", () => {
    initCanvas();
    drawingStarted = false;
});

document.getElementById("eraserBtn").addEventListener("click", () => {
    eraserMode = !eraserMode;
    const btn = document.getElementById("eraserBtn");
    btn.style.background = eraserMode ? "#d97706" : "#f59e0b";
    btn.innerText = eraserMode ? "✏️ Рисование" : "🧽 Ластик";
});

document
.getElementById("patientSelector")
.addEventListener("change",(e)=>{

    const key = e.target.value;

    const saveBtn = document.getElementById("savePatientBtn");

    if (!key) {
        patient = null;
        results = [];

        saveBtn.disabled = false; // можно создавать нового пациента
        saveBtn.innerText = "💾 Сохранить пациента";

        return;
    }

    const data = patientsDatabase[key];

    patient = data.patient;
    results = data.results || [];

    document.getElementById("patientName").value = patient.name;
    document.getElementById("patientBirth").value = patient.birth;

    displayPatientInfo();
    updateStats();

    // 🔒 блокируем сохранение (чтобы не перезаписать)
    saveBtn.disabled = true;
    saveBtn.innerText = "🔒 Пациент уже сохранён (выберите другого или создайте нового)";
});

function saveDrawing() {
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
    startDrawingBtn.innerText = "▶️ Начать рисование";
    startDrawingBtn.style.background = "#2c5f8a";
    document.getElementById("saveDrawingResult").disabled = true;
    document.querySelector('.tab-btn[data-tab="tab-animals"]').click();
    checkAllCompleted();
}

// ---------- ЖИВОТНЫЕ ----------
let animalsTimeLeft = 60;
let animalsTestActive = false;
const startAnimalsBtn = document.getElementById("startAnimalsBtn");
const saveAnimalsBtn = document.getElementById("saveAnimalsResult");

function startAnimalsTest() {
    animalsTimeLeft = 60;
    document.getElementById("animalsTimer").innerText = animalsTimeLeft;
    document.getElementById("animalsInput").value = "";
    document.getElementById("animalsInput").disabled = false;
    startAnimalsBtn.disabled = true;
    saveAnimalsBtn.disabled = true;
    animalsTestActive = true;
    startAnimalsBtn.innerText = "⏳ Тест идёт...";
    startAnimalsBtn.style.background = "#f59e0b";
    if (animalsInterval) clearInterval(animalsInterval);
    animalsInterval = setInterval(() => {
        animalsTimeLeft--;
        document.getElementById("animalsTimer").innerText = animalsTimeLeft;
        if (animalsTimeLeft <= 0) {
            clearInterval(animalsInterval);
            animalsTestActive = false;
            startAnimalsBtn.disabled = false;
            startAnimalsBtn.innerText = "▶️ Начать тест (60 секунд)";
            startAnimalsBtn.style.background = "#2c5f8a";
            saveAnimalsBtn.disabled = false;
            document.getElementById("animalsInput").disabled = true;
            document.getElementById("animalsInfo").innerHTML = "⏰ Время вышло! Нажмите «Сохранить результат».";
        }
    }, 1000);
    document.getElementById("animalsInput").focus();
}

function saveAnimals() {
    const text = document.getElementById("animalsInput").value.toLowerCase();
    const words = text.split(/[\s\n,;]+/).filter(w => w.trim().length > 0);
    const uniqueAnimals = [...new Set(words)];
    currentSession.animalsList = uniqueAnimals;
    currentSession.animalsCount = uniqueAnimals.length;
    currentSession.animalsCompleted = true;
    document.getElementById("animalsInfo").innerHTML = `🐾 Названо животных: ${currentSession.animalsCount}`;
    checkAllCompleted();
}

// ---------- ФИНАЛ ----------
function checkAllCompleted() {
    if (currentSession.memoryCompleted && currentSession.drawingCompleted && currentSession.animalsCompleted && !currentSession.allCompleted) {
        finishFullTest();
    }
}

function finishFullTest() {
    currentSession.allCompleted = true;
    const totalTimeSeconds = Math.floor((Date.now() - currentSession.startTime) / 1000);
    const finalResult = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: "full_test",
        totalTimeSeconds: totalTimeSeconds,
        totalTimeTenths: secondsToTenths(totalTimeSeconds),
        memoryScore: currentSession.memoryScore,
        drawingScore: currentSession.drawingScore,
        animalsCount: currentSession.animalsCount,
        details: {
            wordsList: currentSession.wordsList,
            recalledWords: currentSession.recalledWords,
            drawingChecklist: currentSession.drawingChecklist,
            animalsList: currentSession.animalsList
        }
    };
    results.push(finalResult);
    saveAll();
    stopGlobalTimer();
    document.querySelector('.tab-btn[data-tab="tab-stats"]').click();
}

// ---------- ГРАФИК / ИСТОРИЯ / РЕКОМЕНДАЦИИ ----------
let chart = null;

function updateStats() {
    const historyList = document.getElementById("historyList");
    const recommendationText = document.getElementById("recommendationText");
    const chartCanvas = document.getElementById("statsChart");
    if (!historyList || !recommendationText || !chartCanvas) {
        console.error("Элементы статистики не найдены");
        return;
    }
    const testResults = results.filter(r => r.type === "full_test").sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = testResults.map(r => new Date(r.date).toLocaleDateString());
    const memoryData = testResults.map(r => r.memoryScore);
    const drawingData = testResults.map(r => r.drawingScore);
    const animalsData = testResults.map(r => r.animalsCount);
    const timeData = testResults.map(r => r.totalTimeTenths);
    const ctxChart = chartCanvas.getContext("2d");
    if (chart) chart.destroy();
    if (labels.length > 0) {
        chart = new Chart(ctxChart, {
            type: "line",
            data: {
                labels,
                datasets: [
                    { label: "Память (0-10)", data: memoryData, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.15)", fill: true, tension: 0.3 },
                    { label: "Рисование (0-3)", data: drawingData, borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", fill: true, tension: 0.3 },
                    { label: "Животные (кол-во)", data: animalsData, borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.15)", fill: true, tension: 0.3 },
                    { label: "Время теста", data: timeData, borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.15)", fill: true, tension: 0.3 }
                ]
            },
            options: { responsive: true }
        });
    }
    if (testResults.length === 0) {
        historyList.innerHTML = "<p>Нет завершённых тестов.</p>";
    } else {
        historyList.innerHTML = testResults.slice().reverse().map(r => `
            <div class="history-item">
                📅 ${new Date(r.date).toLocaleString()}<br>
                🧠 Память: ${r.memoryScore}/10<br>
                🖌️ Рисование: ${r.drawingScore}/3<br>
                🐾 Животные: ${r.animalsCount}<br>
                ⏱️ Время: ${formatTime(r.totalTimeSeconds)}
            </div>
        `).join("");
    }
    if (testResults.length === 0) {
        recommendationText.innerHTML = "Нет данных для анализа.";
        recommendationText.className = "recommendation-low";
        return;
    }
    const last = testResults[testResults.length - 1];
    let level = "high";
    let text = "";
    if (last.memoryScore >= 8 && last.drawingScore >= 2 && last.animalsCount >= 15) {
        level = "low";
        text = "🟢 Когнитивные показатели хорошие.";
    } else if (last.memoryScore >= 4 && last.drawingScore >= 2 && last.animalsCount >= 10) {
        level = "mid";
        text = "🟡 Есть умеренные изменения, рекомендуется наблюдение.";
    } else {
        level = "high";
        text = "🔴 Показатели снижены. Желательна консультация специалиста.";
    }
    if (testResults.length >= 2) {
        const prev = testResults[testResults.length - 2];
        const improvedMemory = last.memoryScore > prev.memoryScore;
        const improvedDrawing = last.drawingScore > prev.drawingScore;
        const improvedAnimals = last.animalsCount > prev.animalsCount;
        const worsenedMemory = last.memoryScore < prev.memoryScore;
        const worsenedDrawing = last.drawingScore < prev.drawingScore;
        const worsenedAnimals = last.animalsCount < prev.animalsCount;
        if (improvedMemory && improvedDrawing && improvedAnimals) {
            level = "low";
            text = "🟢 Отмечается выраженное улучшение результатов по всем тестам.";
        } else if (improvedMemory || improvedDrawing || improvedAnimals) {
            if (level === "high") level = "mid";
            text += "<br><br>🟢 Есть положительная динамика по сравнению с предыдущим тестом.";
        }
        if (worsenedMemory && worsenedDrawing && worsenedAnimals) {
            level = "high";
            text += "<br><br>⚠️ Наблюдается ухудшение по всем параметрам. Желательно обратиться к врачу";
        }
    }
    recommendationText.innerHTML = text;
    recommendationText.className = level === "low" ? "recommendation-low" : level === "mid" ? "recommendation-mid" : "recommendation-high";
}
function createNewPatient() {

    patient = null;
    results = [];

    document.getElementById("patientName").value = "";
    document.getElementById("patientBirth").value = "";

    const saveBtn = document.getElementById("savePatientBtn");
    saveBtn.disabled = false;
    saveBtn.innerText = "💾 Сохранить пациента";

    document.getElementById("patientSelector").value = "";

    displayPatientInfo();
}
document.getElementById("newPatientBtn").addEventListener("click", createNewPatient);
// ---------- ОБРАБОТЧИКИ ----------
document.getElementById("savePatientBtn")
.addEventListener("click",()=>{

    // если кнопка заблокирована — ничего не делаем
    if (document.getElementById("savePatientBtn").disabled) return;

    patient = {
        name: document.getElementById("patientName").value,
        birth: document.getElementById("patientBirth").value
    };

    results = [];

    displayPatientInfo();
    saveAll();
});
document.getElementById("clearAllDataBtn").addEventListener("click", clearAllData);
document.getElementById("startTestBtn").addEventListener("click", startMemoryTest);
document.getElementById("finishMemorizeBtn").addEventListener("click", finishMemorize);
document.getElementById("checkRecallBtn").addEventListener("click", checkRecall);
document.getElementById("saveDrawingResult").addEventListener("click", saveDrawing);
startAnimalsBtn.addEventListener("click", startAnimalsTest);
saveAnimalsBtn.addEventListener("click", saveAnimals);
document
.getElementById("exportDataBtn")
.addEventListener("click",()=>{

const exportData=
JSON.stringify({

patient,

results

},null,2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cognitive_${patient.name || "data"}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// ---------- ТАБЫ ----------
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
        document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
    });
});

// ---------- СТАРТ ----------
window.addEventListener("DOMContentLoaded", () => {
    initCanvas();
    loadData();
});