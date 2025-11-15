import { getState, setPaused } from '../state/gameState.js';
import { pauseVideo, playVideo } from '../utils/videoManager.js';
import { updateUI, getElement } from '../ui/uiManager.js';


export const setPause = (value) => {
    setPaused(value);

    const pauseButton = getElement('pauseButton');
    const workButton = getElement('workButton');
    const state = getState();

    if (value) {
        // Pausing
        pauseVideo();
        if (pauseButton) {
            pauseButton.classList.add('paused');
        }
        if (workButton) {
            workButton.disabled = true;
        }
    } else {
        // Resuming
        if (pauseButton) {
            pauseButton.classList.remove('paused');
        }
        if (workButton && !state.isEventActive && !state.isPhoneDistracted && state.progress < 100) {
            workButton.disabled = false;
        }
        playVideo();
    }

    updateUI();
};

export const togglePause = () => {
    const state = getState();
    setPause(!state.isPaused);
};

/**
 * Auto-pause when tab loses focus
 */
export const setupAutoPause = () => {
    document.addEventListener('visibilitychange', () => {
        // Only auto-pause if game is running (not on start/end screens)
        const startScreen = getElement('startScreen');
        const endScreen = getElement('endScreen');

        const gameRunning = startScreen?.classList.contains('hidden') &&
            endScreen?.classList.contains('hidden');

        if (document.hidden && gameRunning) {
            setPause(true);
        }
    });
};