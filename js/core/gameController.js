import {
    resetState,
    getState,
    adjustFocus,
    setWorking,
} from '../state/gameState.js';
import {
    PROGRESS_PER_CLICK,
    FOCUS_CLICK_PENALTY,
    FOCUS_DECAY_RATE,
    FOCUS_RECOVERY_RATE,
    PHONE_DISTRACTION_THRESHOLD,
    PHONE_TRIGGER_CHANCE,
    GAME_DURATION_SECONDS,
    VIDEOS,
} from '../config/constants.js';
import { shouldTrigger } from '../utils/helpers.js';
import { triggerPhoneDistraction } from '../game/phoneDistraction.js';
import { switchVideo, onVideoEnd } from '../utils/videoManager.js';
import {
    toggleStartScreen,
    toggleGameShell,
    toggleEndScreen,
    togglePauseVisibility,
    updateUI,
    getElement,
} from '../ui/uiManager.js';
import { setPause } from '../controllers/pauseManager.js';
import { endGame as renderEndGame } from '../game/endGame.js';

let controllerInstance = null;

export class GameController {
    constructor({
        timerManager,
        progressManager,
        eventManager,
        inputHandler,
        audioManager,
        saveManager,
        analytics,
    }) {
        this.timerManager = timerManager;
        this.progressManager = progressManager;
        this.eventManager = eventManager;
        this.inputHandler = inputHandler;
        this.audioManager = audioManager;
        this.saveManager = saveManager;
        this.analytics = analytics;
        this.seedStoryId = null;
        this.isGameActive = false;

        if (this.eventManager) {
            if (this.analytics) {
                this.eventManager.attachAnalytics(this.analytics);
            }
            this.eventManager.setProgressCompletionHandler(() => this.endGame(true));
        }

        this.timerManager.setCallbacks({
            onTick: () => this.handleTick(),
            onFinish: () => this.endGame(false),
        });
    }

    startGame(seedStoryId = null) {
        this.seedStoryId = seedStoryId;
        if (this.isGameActive) {
            this.timerManager.stop();
        }
        setPause(false);
        resetState();
        this.isGameActive = true;
        this.eventManager?.resetStoryPool();
        this.eventManager?.resetCooldown();

        const totalGameMinutes = Math.max(1, GAME_DURATION_SECONDS / 60);
        const ratio = GAME_DURATION_SECONDS / totalGameMinutes;
        this.timerManager.init(totalGameMinutes, ratio);
        this.timerManager.start();

        toggleStartScreen(false);
        toggleGameShell(true);
        toggleEndScreen(false);
        togglePauseVisibility(true);

        const workButton = getElement('workButton');
        if (workButton) {
            workButton.disabled = false;
            workButton.textContent = 'Працювати (натискай!)';
        }

        const pauseButton = getElement('pauseButton');
        if (pauseButton) {
            pauseButton.classList.add('visible');
            pauseButton.disabled = false;
        }

        switchVideo(VIDEOS.IDLE, true);
        const videoPlayer = getElement('videoPlayer');
        if (videoPlayer) {
            videoPlayer.play().catch(() => {});
        }
        updateUI();
        this.analytics?.log('start', { seedStoryId });

        if (seedStoryId) {
            this.eventManager?.startStoryEventById(seedStoryId);
        }
    }

    handleWorkAction() {
        const state = getState();
        if (state.isEventActive || state.isPhoneDistracted || state.isPaused || state.workDisabled) {
            return;
        }

        let progressGain = PROGRESS_PER_CLICK;
        if (state.focus < 25) progressGain *= 0.25;
        else if (state.focus < 40) progressGain *= 0.5;
        else if (state.focus < 70) progressGain *= 0.75;

        this.progressManager.increaseProgress(progressGain);
        adjustFocus(-FOCUS_CLICK_PENALTY);
        updateUI();

        if (getState().progress >= 100) {
            this.endGame(true);
            return;
        }

        setWorking(true);
        switchVideo(VIDEOS.WORKING, false);
        onVideoEnd(() => {
            switchVideo(VIDEOS.IDLE, true);
            setWorking(false);
            onVideoEnd(null);
        });
    }

    handleTick() {
        const state = getState();
        if (state.isPaused) {
            updateUI();
            return;
        }

        if (!state.isPhoneDistracted && !state.isEventActive) {
            adjustFocus(-FOCUS_DECAY_RATE);
            if (state.focus <= PHONE_DISTRACTION_THRESHOLD && shouldTrigger(PHONE_TRIGGER_CHANCE)) {
                triggerPhoneDistraction();
            }
        } else if (state.isPhoneDistracted) {
            adjustFocus(FOCUS_RECOVERY_RATE);
        }

        if (!state.isPhoneDistracted && !state.isEventActive) {
            this.eventManager?.triggerRandomEvent();
        }

        updateUI();
    }

    pauseGame() {
        setPause(true);
        this.analytics?.log('pause', {});
    }

    resumeGame() {
        setPause(false);
        this.analytics?.log('resume', {});
    }

    togglePause() {
        const state = getState();
        setPause(!state.isPaused);
    }

    endGame(isWin) {
        this.timerManager.stop();
        if (!this.isGameActive) {
            return;
        }
        this.isGameActive = false;
        setPause(false);
        togglePauseVisibility(false);
        switchVideo(VIDEOS.IDLE, true);
        updateUI();

        const state = getState();
        const summary = {
            progress: state.progress,
            timeLeft: state.timeLeft,
            focus: state.focus,
            isWin,
        };
        this.saveManager?.saveResult(summary);
        this.analytics?.log('finish', summary);

        renderEndGame(isWin);
    }
}

export const initGameController = (deps) => {
    controllerInstance = new GameController(deps);
    return controllerInstance;
};

export const getGameController = () => controllerInstance;
