import { updateMeters } from './meters.js';
import { updateThoughts } from './thoughts.js';
import { updateTaskBox } from './taskBox.js';

// Store DOM references
const domElements = {};


export const initUIManager = (elements) => {
    Object.assign(domElements, elements);
};

export const getElement = (key) => domElements[key];

export const updateUI = () => {
    updateMeters(domElements);
    updateThoughts(domElements);
    updateTaskBox(domElements);
};

export const toggleStartScreen = (show) => {
    const startScreen = domElements.startScreen;
    if (startScreen) {
        startScreen.classList.toggle('hidden', !show);
    }
};

export const toggleGameShell = (show) => {
    const gameShell = domElements.gameShell;
    if (gameShell) {
        gameShell.classList.toggle('hidden', !show);
    }
};

export const toggleEndScreen = (show) => {
    const endScreen = domElements.endScreen;
    if (endScreen) {
        endScreen.classList.toggle('hidden', !show);
    }
};

export const togglePauseVisibility = (show) => {
    const pauseButton = domElements.pauseButton;
    if (pauseButton) {
        if (show) {
            pauseButton.classList.add('visible');
        } else {
            pauseButton.classList.remove('visible');
            pauseButton.classList.remove('paused');
        }
    }
};