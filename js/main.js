import { DOM_IDS } from './config/constants.js';
import { initVideoManager, getVideoPlayer } from './utils/videoManager.js';
import { initUIManager, updateUI } from './ui/uiManager.js';
import {
    handleWorkClick,
    handleStartClick,
    handleRestartClick,
    handlePauseClick
} from './controllers/buttonHandlers.js';
import { setupAutoPause } from './controllers/pauseManager.js';

/**
 * Initialize the game when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get all DOM elements
    const elements = gatherDOMElements();

    // Initialize managers
    initVideoManager(elements.videoPlayer);
    initUIManager(elements);

    // Set up event listeners
    setupEventListeners(elements);

    // Set up auto-pause on tab change
    setupAutoPause();

    // Set up video error handling
    setupVideoErrorHandling(elements.videoPlayer);

    // Initial UI update
    updateUI();
});

/**
 * Gather all DOM elements
 */
function gatherDOMElements() {
    const videoPlayer = document.getElementById(DOM_IDS.VIDEO_PLAYER);
    const startScreen = document.getElementById(DOM_IDS.START_SCREEN);
    const endScreen = document.getElementById(DOM_IDS.END_SCREEN);
    const gameShell = document.getElementById(DOM_IDS.GAME_SHELL);

    const startButton = document.getElementById(DOM_IDS.START_BUTTON);
    const workButton = document.getElementById(DOM_IDS.WORK_BUTTON);
    const restartButton = document.getElementById(DOM_IDS.RESTART_BUTTON);
    const pauseButton = document.getElementById(DOM_IDS.PAUSE_BUTTON);

    const timerDisplay = document.getElementById(DOM_IDS.TIMER_DISPLAY);
    const progressDisplay = document.getElementById(DOM_IDS.PROGRESS_DISPLAY);
    const progressBarFill = document.getElementById(DOM_IDS.PROGRESS_BAR_FILL);
    const deadlineBar = document.getElementById(DOM_IDS.DEADLINE_BAR);
    const focusDisplay = document.getElementById(DOM_IDS.FOCUS_DISPLAY);
    const focusBarFill = document.getElementById(DOM_IDS.FOCUS_BAR_FILL);

    const taskBox = document.getElementById(DOM_IDS.TASK_BOX);
    const eventPopup = document.getElementById(DOM_IDS.EVENT_POPUP);
    const eventText = document.getElementById(DOM_IDS.EVENT_TEXT);
    const endMessage = document.getElementById(DOM_IDS.END_MESSAGE);
    const endDetails = document.getElementById(DOM_IDS.END_DETAILS);

    const thoughtElements = DOM_IDS.THOUGHTS
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    return {
        videoPlayer,
        startScreen,
        endScreen,
        gameShell,
        startButton,
        workButton,
        restartButton,
        pauseButton,
        timerDisplay,
        progressDisplay,
        progressBarFill,
        deadlineBar,
        focusDisplay,
        focusBarFill,
        taskBox,
        eventPopup,
        eventText,
        endMessage,
        endDetails,
        thoughtElements,
    };
}

/**
 * Set up all event listeners
 */
function setupEventListeners(elements) {
    if (elements.workButton) {
        elements.workButton.addEventListener('click', handleWorkClick);
    }

    if (elements.startButton) {
        elements.startButton.addEventListener('click', handleStartClick);
    }

    if (elements.restartButton) {
        elements.restartButton.addEventListener('click', handleRestartClick);
    }

    if (elements.pauseButton) {
        elements.pauseButton.addEventListener('click', handlePauseClick);
    }
}

/**
 * Set up video error handling
 */
function setupVideoErrorHandling(videoPlayer) {
    if (!videoPlayer) return;

    videoPlayer.addEventListener('error', (error) => {
        console.error('Помилка завантаження відео:', error);
    });
}