import {
    getState,
    decrementTimeLeft,
    adjustFocus,
    setGameLoopInterval,
    getGameLoopInterval,
    isTimeFreezeOnEventsEnabled,
} from '../state/gameState.js';
import {
    FOCUS_DECAY_RATE,
    FOCUS_RECOVERY_RATE,
    PHONE_DISTRACTION_THRESHOLD,
    PHONE_TRIGGER_CHANCE,
    GAME_DURATION_SECONDS,
    AUDIO_SFX,
} from '../config/constants.js';
import { shouldTrigger } from '../utils/helpers.js';
import { updateUI } from '../ui/uiManager.js';
import { triggerPhoneDistraction } from './phoneDistraction.js';
import { endGame } from './endGame.js';
import { getGlobalEventManager } from '../managers/eventManager.js';
import { getAudioManager } from '../managers/audioManager.js';

const DEADLINE_THRESHOLD = Math.max(30, Math.round(GAME_DURATION_SECONDS * 0.25));
let deadlineMusicTriggered = false;
let lowFocusCueTriggered = false;

/**
 * Main game loop - runs every second
 */
export const gameLoop = () => {
    const state = getState();

    if (state.isPaused) {
        updateUI();
        return;
    }

    if (state.timeLeft <= 0) {
        endGame(false);
        return;
    }

    const shouldFreezeTime = isTimeFreezeOnEventsEnabled() && state.isEventActive && !state.isPhoneDistracted;
    if (shouldFreezeTime) {
        updateUI();
        return;
    }

    // Decrease time
    decrementTimeLeft(1);
    handleDeadlineMusic(state);
    handleLowFocusCue(state);

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

export const resetGameLoopAudioState = () => {
    deadlineMusicTriggered = false;
    lowFocusCueTriggered = false;
};

function handleDeadlineMusic(state) {
    if (deadlineMusicTriggered) return;
    if (state.timeLeft > DEADLINE_THRESHOLD) return;
    const audioManager = getAudioManager();
    if (!audioManager) return;
    deadlineMusicTriggered = true;
    audioManager.switchToDeadlineLoop({ fadeDuration: 800 });
}

function handleLowFocusCue(state) {
    const audioManager = getAudioManager();
    if (!audioManager) return;
    if (!lowFocusCueTriggered && state.focus <= 20) {
        lowFocusCueTriggered = true;
        audioManager.playSFX(AUDIO_SFX.PANIC);
        return;
    }

    if (lowFocusCueTriggered && state.focus >= 40) {
        lowFocusCueTriggered = false;
    }
}