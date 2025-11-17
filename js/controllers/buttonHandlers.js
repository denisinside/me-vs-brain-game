import {
    getState,
    incrementProgress,
    adjustFocus,
    setWorking,
    resetState
} from '../state/gameState.js';
import { resetAvailableEvents } from '../game/eventLoader.js';
import {
    PROGRESS_PER_CLICK,
    FOCUS_CLICK_PENALTY,
    VIDEOS
} from '../config/constants.js';
import { clamp } from '../utils/helpers.js';
import { switchVideo, onVideoEnd } from '../utils/videoManager.js';
import { updateUI, toggleStartScreen, toggleGameShell, getElement } from '../ui/uiManager.js';
import { endGame } from '../game/endGame.js';
import { startGameLoop } from '../game/gameLoop.js';
import { togglePause } from './pauseManager.js';


export const handleWorkClick = () => {
    const state = getState();

    if (state.isEventActive || state.isPhoneDistracted || state.isPaused || state.workDisabled) {
        return;
    }

    // Calculate progress gain based on focus
    let progressGain = PROGRESS_PER_CLICK;
    if (state.focus < 25) {
        progressGain = PROGRESS_PER_CLICK * 0.25;
    } else if (state.focus < 40) {
        progressGain =  PROGRESS_PER_CLICK * 0.5;
    } else if (state.focus < 70) {
        progressGain =  PROGRESS_PER_CLICK * 0.75;
    }

    incrementProgress(progressGain);
    adjustFocus(-FOCUS_CLICK_PENALTY);
    updateUI();

    // Check win condition
    if (state.progress >= 100) {
        endGame(true);
        return;
    }

    // Play working animation (always switch to working video on click)
    setWorking(true);
    switchVideo(VIDEOS.WORKING, false);

    onVideoEnd(() => {
        switchVideo(VIDEOS.IDLE, true);
        setWorking(false);
        onVideoEnd(null);
    });
};

export const handleStartClick = () => {
    toggleStartScreen(false);
    toggleGameShell(true);
    startNewRun();
};

export const handleRestartClick = () => {
    startNewRun();
};

export const handlePauseClick = () => {
    togglePause();
};

const startNewRun = () => {
    resetState();
    resetAvailableEvents(); // Reset event pool for new game

    const workButton = getElement('workButton');
    const pauseButton = getElement('pauseButton');

    if (workButton) {
        workButton.disabled = false;
        workButton.textContent = 'Працювати (натискай!)';
        workButton.onclick = null;
    }

    if (pauseButton) {
        pauseButton.disabled = false;
        pauseButton.classList.remove('paused');
        pauseButton.classList.add('visible');
    }

    const endScreen = getElement('endScreen');
    const gameShell = getElement('gameShell');

    if (endScreen) {
        endScreen.classList.add('hidden');
    }

    if (gameShell) {
        gameShell.classList.remove('hidden');
    }

    switchVideo(VIDEOS.IDLE, true);
    
    // Start video playback
    const videoPlayer = getElement('videoPlayer');
    if (videoPlayer) {
        videoPlayer.play().catch(() => {});
    }
    
    updateUI();
    startGameLoop();
};