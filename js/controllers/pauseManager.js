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
        
        // Pause phone TikTok video if visible
        const phoneVideo = document.getElementById('phone-tiktok-video');
        if (phoneVideo && !phoneVideo.paused) {
            phoneVideo.pause();
        }
        
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
        
        // Resume phone TikTok video if visible and phone distraction is active
        if (state.isPhoneDistracted) {
            const phoneVideo = document.getElementById('phone-tiktok-video');
            const phoneMockup = document.getElementById('phone-mockup');
            if (phoneVideo && phoneMockup && !phoneMockup.classList.contains('hidden')) {
                phoneVideo.play().catch(() => {});
            }
        }
        if (workButton) {
            // During phone distraction, button should be enabled (for escape clicks)
            // unless work is disabled by effect
            if (state.isPhoneDistracted) {
                workButton.disabled = state.workDisabled;
            }
            // During regular events, button should be disabled
            else if (state.isEventActive) {
                workButton.disabled = true;
            }
            // Normal state: enable if game not finished and work not disabled
            else if (state.progress < 100) {
                workButton.disabled = state.workDisabled;
            }
            // Game finished
            else {
                workButton.disabled = true;
            }
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