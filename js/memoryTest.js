import { currentSession, memorizeInterval, setCurrentSession } from './state.js';
import { shuffleArray } from './utils.js';
import { startGlobalTimer, updateGlobalTimerDisplay } from './app.js';

const BASE_WORDS = ["яблоко", "стул", "монета", "дерево", "машина", "солнце", "книга", "дом", "ручка", "стол"];

export function startMemoryTest() {
    setCurrentSession({
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
    });
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

export function finishMemorize() {
    clearInterval(memorizeInterval);
    document.getElementById("memorizeBlock").style.display = "none";
    document.getElementById("recallBlock").style.display = "block";
}

export function checkRecall() {
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