import { results, chart } from './state.js';
import { formatTime } from './utils.js';

export function updateStats() {
    const historyList = document.getElementById("historyList");
    const recommendationText = document.getElementById("recommendationText");
    const chartCanvas = document.getElementById("statsChart");
    if (!historyList || !recommendationText || !chartCanvas) return;
    
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
                    { label: "Память (0-10)", data: memoryData, borderColor: "#3b82f6", fill: true, tension: 0.3 },
                    { label: "Рисование (0-3)", data: drawingData, borderColor: "#10b981", fill: true, tension: 0.3 },
                    { label: "Животные (кол-во)", data: animalsData, borderColor: "#f59e0b", fill: true, tension: 0.3 },
                    { label: "Время теста", data: timeData, borderColor: "#ef4444", fill: true, tension: 0.3 }
                ]
            },
            options: { responsive: true }
        });
    }
    
    // История
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
    
    // Экспертная система (правила П1-П6)
    if (testResults.length === 0) {
        recommendationText.innerHTML = "Нет данных для анализа.";
        recommendationText.className = "recommendation-low";
        return;
    }
    
    const last = testResults[testResults.length - 1];
    let level = "high";
    let text = "";
    
    // П1-П3: оценка базового уровня
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
    
    // П4-П6: анализ динамики
    if (testResults.length >= 2) {
        const prev = testResults[testResults.length - 2];
        const improved = last.memoryScore > prev.memoryScore || last.drawingScore > prev.drawingScore || last.animalsCount > prev.animalsCount;
        const worsened = last.memoryScore < prev.memoryScore || last.drawingScore < prev.drawingScore || last.animalsCount < prev.animalsCount;
        
        if (improved && !worsened) {
            text += "<br><br>🟢 Есть положительная динамика.";
        }
        if (worsened && !improved) {
            text += "<br><br>⚠️ Наблюдается ухудшение.";
            level = "high";
        }
    }
    
    recommendationText.innerHTML = text;
    recommendationText.className = level === "low" ? "recommendation-low" : level === "mid" ? "recommendation-mid" : "recommendation-high";
}