import {
    getState,
    setPhoneDistracted,
    setEventActive,
    setPhoneClicksRemaining,
    setEventMessage,
    decrementPhoneClicks,
    adjustFocus
} from '../state/gameState.js';
import { PHONE_ESCAPE_CLICKS, VIDEOS } from '../config/constants.js';
import { switchVideo } from '../utils/videoManager.js';
import { updateUI, getElement } from '../ui/uiManager.js';


export const triggerPhoneDistraction = () => {
    setPhoneDistracted(true);
    setEventActive(true);
    setPhoneClicksRemaining(PHONE_ESCAPE_CLICKS);
    setEventMessage('Ти заліз у телефон! Швидко клацай, щоб вирватись!');

    const workButton = getElement('workButton');
    if (workButton) {
        workButton.textContent = 'Тікай з телефона!';
        workButton.onclick = handlePhoneEscape;
    }

    switchVideo(VIDEOS.DISTRACTION);
    updateUI();
};

/**
 * Handle click to escape from phone
 */
const handlePhoneEscape = () => {
    const state = getState();
    if (!state.isPhoneDistracted) return;

    decrementPhoneClicks();

    const clicksRemaining = state.phoneClicksRemaining;

    if (clicksRemaining <= 0) {
        endPhoneDistraction();
    } else {
        setEventMessage(`Телефон тримає! Залишилось кліків: ${clicksRemaining}`);
        updateUI();
    }
};

const endPhoneDistraction = () => {
    const state = getState();

    setPhoneClicksRemaining(0);
    adjustFocus(22); // Reward for escaping
    setPhoneDistracted(false);
    setEventActive(false);
    setEventMessage(null);

    const workButton = getElement('workButton');
    if (workButton) {
        workButton.disabled = state.progress >= 100 || state.isPaused;
        workButton.textContent = 'Працювати (натискай!)';
        workButton.onclick = null;
    }

    switchVideo(VIDEOS.IDLE, true);
    updateUI();
};