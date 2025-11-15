import { getState, setEventActive, setEventMessage, decrementTimeLeft, adjustFocus } from '../state/gameState.js';
import { RANDOM_EVENTS } from '../config/constants.js';
import { randomElement } from '../utils/helpers.js';
import { switchVideo, playVideo } from '../utils/videoManager.js';
import { VIDEOS } from '../config/constants.js';
import { updateUI, getElement } from '../ui/uiManager.js';

/**
 * Trigger a random event (cat, phone call, etc.)
 */
export const triggerRandomEvent = () => {
    const state = getState();

    // Don't trigger if event already active, working, or paused
    if (state.isEventActive || state.isWorking || state.isPaused) {
        return;
    }

    const eventData = randomElement(RANDOM_EVENTS);

    setEventActive(true);
    setEventMessage(eventData.text);

    const workButton = getElement('workButton');
    if (workButton) {
        workButton.disabled = true;
    }

    // Apply penalties
    decrementTimeLeft(eventData.penalty);
    adjustFocus(-eventData.focusLoss);

    // Switch to distraction video
    switchVideo(eventData.video);

    updateUI();

    // End event after duration
    setTimeout(() => {
        endEvent();
    }, eventData.duration);
};

const endEvent = () => {
    const state = getState();

    switchVideo(VIDEOS.IDLE, true);
    setEventActive(false);
    setEventMessage(null);

    const workButton = getElement('workButton');
    if (workButton) {
        workButton.disabled = state.progress >= 100 || state.isPaused || state.isPhoneDistracted;
    }

    updateUI();
};