import { initTabs } from './ui.js';
import { loadData } from './storage.js';
import { initCanvas } from './drawingTest.js';
import { startMemoryTest, finishMemorize, checkRecall } from './memoryTest.js';
import { startDrawing, clearCanvas, toggleEraser, saveDrawing } from './drawingTest.js';
import { startAnimalsTest, saveAnimals } from './animalsTest.js';
import { savePatient, clearAllData } from './patient.js';
import { exportData } from './export.js';
import { updateGlobalTimerDisplay, startGlobalTimer, stopGlobalTimer } from './timer.js';

export function checkAllCompleted() {
    // логика проверки завершения всех тестов
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    initCanvas();
    loadData();
    initTabs();
    
    // Привязка обработчиков
    document.getElementById("startTestBtn").addEventListener("click", startMemoryTest);
    document.getElementById("finishMemorizeBtn").addEventListener("click", finishMemorize);
    document.getElementById("checkRecallBtn").addEventListener("click", checkRecall);
    document.getElementById("startDrawingBtn").addEventListener("click", startDrawing);
    document.getElementById("clearCanvasBtn").addEventListener("click", clearCanvas);
    document.getElementById("eraserBtn").addEventListener("click", toggleEraser);
    document.getElementById("saveDrawingResult").addEventListener("click", saveDrawing);
    document.getElementById("startAnimalsBtn").addEventListener("click", startAnimalsTest);
    document.getElementById("saveAnimalsResult").addEventListener("click", saveAnimals);
    document.getElementById("savePatientBtn").addEventListener("click", savePatient);
    document.getElementById("clearAllDataBtn").addEventListener("click", clearAllData);
    document.getElementById("exportDataBtn").addEventListener("click", exportData);
});