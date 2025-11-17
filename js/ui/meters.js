import { getState } from '../state/gameState.js';
import { GAME_DURATION_SECONDS } from '../config/constants.js';
import { clamp, formatTime } from '../utils/helpers.js';

/**
 * Update all meter displays (progress, focus, timer, deadline)
 */
export const updateMeters = (elements) => {
    const state = getState();

    updateDeadlineBar(elements, state);
    updateTimerDisplay(elements, state);
    updateProgressDisplay(elements, state);
    updateFocusDisplay(elements, state);
};


const updateDeadlineBar = (elements, state) => {
    const deadlineBar = elements.deadlineBar;
    if (!deadlineBar) return;

    const deadlinePercent = (state.timeLeft / GAME_DURATION_SECONDS) * 100;
    deadlineBar.style.width = `${clamp(deadlinePercent, 0, 100)}%`;

    deadlineBar.classList.toggle('warning', deadlinePercent <= 35 && deadlinePercent > 15);
    deadlineBar.classList.toggle('danger', deadlinePercent <= 15);
};

const updateTimerDisplay = (elements, state) => {
    const timerDisplay = elements.timerDisplay;
    if (!timerDisplay) return;

    timerDisplay.textContent = formatTime(state.timeLeft);
};

const updateProgressDisplay = (elements, state) => {
    const progressDisplay = elements.progressDisplay;
    const progressBarFill = elements.progressBarFill;

    if (progressDisplay) {
        progressDisplay.textContent = `${state.progress.toFixed(2)}%`;
    }

    if (progressBarFill) {
        progressBarFill.style.width = `${clamp(state.progress, 0, 100)}%`;
    }
};

const updateFocusDisplay = (elements, state) => {
    const focusDisplay = elements.focusDisplay;
    const focusBarFill = elements.focusBarFill;

    if (focusDisplay) {
        focusDisplay.textContent = `${Math.round(state.focus)}%`;
    }

    if (focusBarFill) {
        focusBarFill.style.width = `${clamp(state.focus, 0, 100)}%`;
        focusBarFill.classList.toggle('warning', state.focus <= 55 && state.focus > 30);
        focusBarFill.classList.toggle('danger', state.focus <= 30);
    }
};