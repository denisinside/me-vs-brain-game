import {
    getState,
    decrementTimeLeft,
    adjustFocus,
    setGameLoopInterval,
    getGameLoopInterval
} from '../state/gameState.js';
import {
    FOCUS_DECAY_RATE,
    FOCUS_RECOVERY_RATE,
    PHONE_DISTRACTION_THRESHOLD,
    PHONE_TRIGGER_CHANCE,
    EVENT_CHANCE_PER_SECOND
} from '../config/constants.js';
import { shouldTrigger } from '../utils/helpers.js';
import { updateUI } from '../ui/uiManager.js';
import { triggerRandomEvent } from './events.js';
import { triggerPhoneDistraction } from './phoneDistraction.js';
import { endGame } from './endGame.js';
import { shouldTriggerChallenge, triggerRandomChallenge } from './miniChallenges.js';

/**
 * Main game loop - runs every second
 */
export const gameLoop = () => {
    const state = getState();

    if (state.isPaused) {
        updateUI();
        return;
    }

    // Decrease time
    decrementTimeLeft(1);

    // Update focus based on phone distraction
    if (!state.isPhoneDistracted) {
        adjustFocus(-FOCUS_DECAY_RATE);

        // Check if should trigger phone distraction
        if (state.focus <= PHONE_DISTRACTION_THRESHOLD && shouldTrigger(PHONE_TRIGGER_CHANCE)) {
            triggerPhoneDistraction();
        }
    } else {
        adjustFocus(FOCUS_RECOVERY_RATE);
    }

    updateUI();

    // Check lose condition
    if (state.timeLeft <= 0) {
        endGame(false);
        return;
    }

    // Check for mini-challenge trigger
    if (shouldTriggerChallenge()) {
        triggerRandomChallenge();
        return;
    }

    // Random events
    if (!state.isPhoneDistracted && shouldTrigger(EVENT_CHANCE_PER_SECOND)) {
        triggerRandomEvent();
    }
};

export const startGameLoop = () => {
    stopGameLoop(); // Clear any existing interval

    const interval = setInterval(gameLoop, 1000);
    setGameLoopInterval(interval);
};

export const stopGameLoop = () => {
    const interval = getGameLoopInterval();
    if (interval) {
        clearInterval(interval);
        setGameLoopInterval(null);
    }
};