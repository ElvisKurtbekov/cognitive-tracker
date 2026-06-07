import { patientsDatabase, results, patient, setResults } from './state.js';
import { getPatientKey } from './utils.js';
import { updatePatientSelector } from './ui.js';
import { updateStats } from './statistics.js';

export function loadData() {
    const db = localStorage.getItem("cognitive_database");
    if (db) {
        Object.assign(patientsDatabase, JSON.parse(db));
    }
    updatePatientSelector();
}

export function saveAll() {
    if (!patient) return;
    const key = getPatientKey(patient);
    patientsDatabase[key] = {
        patient: { ...patient },
        results: results
    };
    localStorage.setItem("cognitive_database", JSON.stringify(patientsDatabase));
    updatePatientSelector();
    updateStats();
}

export function loadPatientData(key) {
    const data = patientsDatabase[key];
    if (data) {
        patient = data.patient;
        setResults(data.results || []);
    }
}