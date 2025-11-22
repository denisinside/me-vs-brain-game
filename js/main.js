import { DOM_IDS } from './config/constants.js';
import { initVideoManager } from './utils/videoManager.js';
import { initUIManager, updateUI } from './ui/uiManager.js';
import {
    handleWorkClick,
    handleStartClick,
    handleRestartClick,
    handlePauseClick
} from './controllers/buttonHandlers.js';
import { setupAutoPause, bindTimerControl } from './controllers/pauseManager.js';
import { TimerManager } from './managers/timerManager.js';
import { ProgressManager } from './managers/progressManager.js';
import { EventManager, setGlobalEventManager } from './managers/eventManager.js';
import { InputHandler } from './managers/inputHandler.js';
import { AudioManager } from './managers/audioManager.js';
import { SaveManager } from './managers/saveManager.js';
import { Analytics } from './managers/analytics.js';
import { initGameController } from './core/gameController.js';

/**
 * Initialize the game when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Get all DOM elements
    const elements = gatherDOMElements();

    // Initialize managers
    initVideoManager(elements.videoPlayer, elements.videoFallback);
    initUIManager(elements);

    const audioManager = new AudioManager();
    const timerManager = new TimerManager({});
    const progressManager = new ProgressManager();
    const inputHandler = new InputHandler({ elements, timerManager });
    const eventManager = new EventManager({ timerManager, progressManager, audioManager, inputHandler });
    setGlobalEventManager(eventManager);
    const saveManager = new SaveManager();
    const analytics = new Analytics();
    bindTimerControl(timerManager);

    try {
        await eventManager.loadEventsFromJson();
    } catch (error) {
        console.error('Failed to load events', error);
    }

    initGameController({
        timerManager,
        progressManager,
        eventManager,
        inputHandler,
        audioManager,
        saveManager,
        analytics,
    });

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
    const eventTitle = document.getElementById(DOM_IDS.EVENT_TITLE);
    const eventDescription = document.getElementById(DOM_IDS.EVENT_DESCRIPTION);
    const sidebarTitle = document.getElementById(DOM_IDS.SIDEBAR_TITLE);
    const choiceContainer = document.getElementById(DOM_IDS.CHOICE_CONTAINER);
    const thoughtsContainer = document.getElementById(DOM_IDS.THOUGHTS_CONTAINER);
    const avatarCard = document.getElementById(DOM_IDS.AVATAR_CARD);
    const qteContainer = document.getElementById(DOM_IDS.QTE_CONTAINER);
    const qteKey = document.getElementById(DOM_IDS.QTE_KEY);
    const qteCounter = document.getElementById(DOM_IDS.QTE_COUNTER);
    const challengeOverlay = document.getElementById(DOM_IDS.CHALLENGE_OVERLAY);
    const challengeTitle = document.getElementById(DOM_IDS.CHALLENGE_TITLE);
    const challengeInstructions = document.getElementById(DOM_IDS.CHALLENGE_INSTRUCTIONS);
    const challengeBody = document.getElementById(DOM_IDS.CHALLENGE_BODY);
    const challengeSequence = document.getElementById(DOM_IDS.CHALLENGE_SEQUENCE);
    const challengeInput = document.getElementById(DOM_IDS.CHALLENGE_INPUT);
    const challengeProgressTrack = document.getElementById(DOM_IDS.CHALLENGE_PROGRESS_TRACK);
    const challengeProgressFill = document.getElementById(DOM_IDS.CHALLENGE_PROGRESS_FILL);
    const challengeTimer = document.getElementById(DOM_IDS.CHALLENGE_TIMER);
    const videoFallback = document.getElementById(DOM_IDS.VIDEO_FALLBACK);
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
        eventTitle,
        eventDescription,
        sidebarTitle,
        choiceContainer,
        thoughtsContainer,
        avatarCard,
        qteContainer,
        qteKey,
        qteCounter,
        challengeOverlay,
        challengeTitle,
        challengeInstructions,
        challengeBody,
        challengeSequence,
        challengeInput,
        challengeProgressTrack,
        challengeProgressFill,
        challengeTimer,
        videoFallback,
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

    // ESC key to pause/unpause
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const gameShell = elements.gameShell;
            const startScreen = elements.startScreen;
            const endScreen = elements.endScreen;
            
            // Only toggle pause if game is running (not on start or end screen)
            if (gameShell && !gameShell.classList.contains('hidden') &&
                startScreen && startScreen.classList.contains('hidden') &&
                endScreen && endScreen.classList.contains('hidden')) {
                handlePauseClick();
            }
        }
    });
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