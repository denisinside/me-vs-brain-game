import { GAME_DURATION_SECONDS } from '../config/constants.js';

// Centralized game state
const state = {
    progress: 0,
    timeLeft: GAME_DURATION_SECONDS,
    focus: 100,
    gameLoopInterval: null,
    isEventActive: false,
    isWorking: false,
    isPhoneDistracted: false,
    isPaused: false,
    phoneClicksRemaining: 0,
    eventMessage: null,
    // New event system fields
    currentEvent: null,
    eventEpilogues: [], // Store completed event epilogues
    progressRateModifier: 1.0, // Multiplier for progress rate
    progressRateTimeout: null, // Timeout for temporary progress rate changes
    workDisabled: false, // Whether work button is disabled
    workDisableTimeout: null, // Timeout for temporary work disable
    activeEffectsDescription: null, // Description of currently active effects
};

// Getters
export const getState = () => state;
export const getProgress = () => state.progress;
export const getTimeLeft = () => state.timeLeft;
export const getFocus = () => state.focus;
export const isEventActive = () => state.isEventActive;
export const isWorking = () => state.isWorking;
export const isPhoneDistracted = () => state.isPhoneDistracted;
export const isPaused = () => state.isPaused;
export const getPhoneClicksRemaining = () => state.phoneClicksRemaining;
export const getEventMessage = () => state.eventMessage;
export const getGameLoopInterval = () => state.gameLoopInterval;
export const getCurrentEvent = () => state.currentEvent;
export const getEventEpilogues = () => state.eventEpilogues;
export const getProgressRateModifier = () => state.progressRateModifier;
export const isWorkDisabled = () => state.workDisabled;
export const getActiveEffectsDescription = () => state.activeEffectsDescription;

// Setters
export const setProgress = (value) => { state.progress = value; };
export const setTimeLeft = (value) => { state.timeLeft = value; };
export const setFocus = (value) => { state.focus = value; };
export const setEventActive = (value) => { state.isEventActive = value; };
export const setWorking = (value) => { state.isWorking = value; };
export const setPhoneDistracted = (value) => { state.isPhoneDistracted = value; };
export const setPaused = (value) => { state.isPaused = value; };
export const setPhoneClicksRemaining = (value) => { state.phoneClicksRemaining = value; };
export const setEventMessage = (value) => { state.eventMessage = value; };
export const setGameLoopInterval = (value) => { state.gameLoopInterval = value; };
export const setCurrentEvent = (value) => { state.currentEvent = value; };
export const setProgressRateModifier = (value) => { state.progressRateModifier = value; };
export const setWorkDisabled = (value) => { state.workDisabled = value; };
export const setActiveEffectsDescription = (value) => { state.activeEffectsDescription = value; };

// Complex state operations
export const incrementProgress = (amount) => {
    // Apply progress rate modifier
    const modifiedAmount = amount * state.progressRateModifier;
    // Round to avoid floating point precision issues
    state.progress = Math.min(100, Number((state.progress + modifiedAmount).toFixed(2)));
};

export const decrementTimeLeft = (amount) => {
    state.timeLeft = Math.max(0, state.timeLeft - amount);
};

export const adjustFocus = (amount) => {
    state.focus = Math.max(0, Math.min(100, state.focus + amount));
};

export const decrementPhoneClicks = () => {
    state.phoneClicksRemaining = Math.max(0, state.phoneClicksRemaining - 1);
};

// Event epilogue management
export const addEventEpilogue = (eventTitle, epilogueText) => {
    state.eventEpilogues.push({
        title: eventTitle,
        text: epilogueText
    });
};

export const clearEventEpilogues = () => {
    state.eventEpilogues = [];
};

// Progress rate modifier management
export const applyProgressRateModifier = (modifier, duration) => {
    // Clear existing timeout
    if (state.progressRateTimeout) {
        clearTimeout(state.progressRateTimeout);
    }
    
    state.progressRateModifier = modifier;
    
    if (duration > 0) {
        state.progressRateTimeout = setTimeout(() => {
            state.progressRateModifier = 1.0;
            state.progressRateTimeout = null;
        }, duration);
    }
};

export const resetProgressRateModifier = () => {
    if (state.progressRateTimeout) {
        clearTimeout(state.progressRateTimeout);
        state.progressRateTimeout = null;
    }
    state.progressRateModifier = 1.0;
};

// Work disable management
export const applyWorkDisable = (duration) => {
    // Clear existing timeout
    if (state.workDisableTimeout) {
        clearTimeout(state.workDisableTimeout);
    }
    
    state.workDisabled = true;
    
    if (duration > 0) {
        state.workDisableTimeout = setTimeout(() => {
            state.workDisabled = false;
            state.workDisableTimeout = null;
        }, duration);
    }
};

export const resetWorkDisable = () => {
    if (state.workDisableTimeout) {
        clearTimeout(state.workDisableTimeout);
        state.workDisableTimeout = null;
    }
    state.workDisabled = false;
};

// Reset state
export const resetState = () => {
    state.progress = 0;
    state.timeLeft = GAME_DURATION_SECONDS;
    state.focus = 100;
    state.isEventActive = false;
    state.isWorking = false;
    state.isPhoneDistracted = false;
    state.isPaused = false;
    state.phoneClicksRemaining = 0;
    state.eventMessage = null;
    state.currentEvent = null;
    state.eventEpilogues = [];
    state.activeEffectsDescription = null;

    if (state.gameLoopInterval) {
        clearInterval(state.gameLoopInterval);
        state.gameLoopInterval = null;
    }

    // Clear timeouts
    resetProgressRateModifier();
    resetWorkDisable();
};