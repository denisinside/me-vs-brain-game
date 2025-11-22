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
    CHALLENGE_TRIGGER_PROBABILITY,
    STORY_EVENT_TRIGGER_PROBABILITY
} from '../config/constants.js';
import { shouldTrigger } from '../utils/helpers.js';
import { updateUI } from '../ui/uiManager.js';
import { triggerPhoneDistraction } from './phoneDistraction.js';
import { endGame } from './endGame.js';
import { getGlobalEventManager } from '../managers/eventManager.js';

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
    if (!state.isPhoneDistracted && !state.isEventActive) {
        adjustFocus(-FOCUS_DECAY_RATE);

        // Check if should trigger phone distraction (only if no event is active)
        if (state.focus <= PHONE_DISTRACTION_THRESHOLD && shouldTrigger(PHONE_TRIGGER_CHANCE)) {
            triggerPhoneDistraction();
        }
    } else if (state.isPhoneDistracted) {
        adjustFocus(FOCUS_RECOVERY_RATE);
    }

    updateUI();

    // Check lose condition
    if (state.timeLeft <= 0) {
        endGame(false);
        return;
    }

    // Random events (only if no event is active and not phone distracted)
    if (!state.isPhoneDistracted && !state.isEventActive) {
        const eventManager = getGlobalEventManager();
        const storyProbability = eventManager.calculateEventProbability(state);
        const challengeProbability = eventManager.calculateChallengeProbability(state);
        console.log('Story probability:', storyProbability);
        console.log('Challenge probability:', challengeProbability);
        if (shouldTrigger(storyProbability)) {
            eventManager.triggerRandomEvent();
        }
        else if (shouldTrigger(challengeProbability)) {
            eventManager.launchChallengeEvent();
        }
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