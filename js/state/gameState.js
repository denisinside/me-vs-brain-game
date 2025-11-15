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

// Complex state operations
export const incrementProgress = (amount) => {
    state.progress = Math.min(100, state.progress + amount);
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

    if (state.gameLoopInterval) {
        clearInterval(state.gameLoopInterval);
        state.gameLoopInterval = null;
    }
};