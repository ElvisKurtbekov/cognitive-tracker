import { getPatientKey } from './utils.js';

export let patient = null;
export let patientsDatabase = {};
export let results = [];

export let currentSession = {
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

export let memorizeInterval = null;
export let animalsInterval = null;
export let globalTimerInterval = null;

export let chart = null;

export function setPatient(newPatient) {
    patient = newPatient;
}

export function setResults(newResults) {
    results = newResults;
}

export function setCurrentSession(session) {
    currentSession = session;
}