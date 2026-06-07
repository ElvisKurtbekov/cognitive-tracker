import { patient, results, setPatient, setResults } from './state.js';
import { saveAll, loadPatientData } from './storage.js';

export function savePatient() {
    const name = document.getElementById("patientName").value;
    const birth = document.getElementById("patientBirth").value;
    setPatient({ name, birth });
    setResults([]);
    displayPatientInfo();
    saveAll();
}

export function displayPatientInfo() {
    const infoDiv = document.getElementById("patientInfo");
    if (!infoDiv) return;
    if (patient && patient.name) {
        infoDiv.innerHTML = `
            ✅ Пациент: <strong>${patient.name}</strong><br>
            📅 Дата рождения: ${patient.birth || "не указана"}
        `;
    } else {
        infoDiv.innerHTML = "⚠️ Данные пациента не сохранены.";
    }
}

export function selectPatient(key) {
    if (!key) return;
    loadPatientData(key);
    document.getElementById("patientName").value = patient.name;
    document.getElementById("patientBirth").value = patient.birth;
    displayPatientInfo();
}