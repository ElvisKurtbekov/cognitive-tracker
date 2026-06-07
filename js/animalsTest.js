import { currentSession, animalsInterval } from './state.js';
import { checkAllCompleted } from './app.js';

let animalsTimeLeft = 60;
let animalsTestActive = false;
const startAnimalsBtn = document.getElementById("startAnimalsBtn");
const saveAnimalsBtn = document.getElementById("saveAnimalsResult");

export function startAnimalsTest() {
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

export function saveAnimals() {
    const text = document.getElementById("animalsInput").value.toLowerCase();
    const words = text.split(/[\s\n,;]+/).filter(w => w.trim().length > 0);
    const uniqueAnimals = [...new Set(words)];
    currentSession.animalsList = uniqueAnimals;
    currentSession.animalsCount = uniqueAnimals.length;
    currentSession.animalsCompleted = true;
    document.getElementById("animalsInfo").innerHTML = `🐾 Названо животных: ${currentSession.animalsCount}`;
    checkAllCompleted();
}