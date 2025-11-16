import { getState, setEventActive, setEventMessage, incrementProgress, decrementTimeLeft } from '../state/gameState.js';
import { updateUI, getElement } from '../ui/uiManager.js';
import { switchVideo } from '../utils/videoManager.js';
import { VIDEOS } from '../config/constants.js';

const beatSound = new Audio('./assets/sounds/beat.wav');
beatSound.volume = 0.8;
let beatTimeouts = [];

// Challenge types configuration
const CHALLENGE_TYPES = {
    // BUTTON_SPAM: {
    //     type: 'spam',
    //     title: 'ШВИДКІСТЬ!',
    //     description: 'Натискай кнопку максимально швидко!',
    //     targetClicks: 25,
    //     timeLimit: 8000, // 8 seconds
    //     reward: { progress: 15, time: 10 },
    //     penalty: { progress: 0, time: -15 },
    // },
    KEY_COMBO: {
        type: 'combo',
        title: 'КОМБІНАЦІЯ!',
        description: 'Повтори послідовність клавіш:',
        sequence: null, // Will be generated
        timeLimit: 12000, // 12 seconds
        reward: { progress: 20, time: 15 },
        penalty: { progress: 0, time: -20 },
    },
    RHYTHM: {
        type: 'rhythm',
        title: 'РИТМ!',
        description: 'Натискай Space в ритм!',
        targetHits: 8,
        timeLimit: 10000, // 10 seconds
        reward: { progress: 18, time: 12 },
        penalty: { progress: 0, time: -18 },
    },
};

// State
let activeChallengeData = null;
let challengeTriggered = false; // Track if challenge was triggered this game

/**
 * Reset challenge tracker (call when starting new game)
 */
export const resetChallengeTracker = () => {
    challengeTriggered = false;
};

export const wasChallengeTriggered = () => challengeTriggered;

export const shouldTriggerChallenge = () => {
    const state = getState();

    // Don't trigger if already triggered this game
    // if (challengeTriggered) return false;

    // Don't trigger if event active or game is paused
    if (state.isEventActive || state.isPaused) return false;

    // Trigger when progress is between 30% and 70%
    if (state.progress >= 10 && state.progress <= 70) {
        // 3% chance per game loop tick (every second)
        return Math.random() < 0.3;
    }

    return false;
};

export const triggerRandomChallenge = () => {
    const challenges = Object.values(CHALLENGE_TYPES);
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    startMiniChallenge(randomChallenge);
    challengeTriggered = true;
};

export const startMiniChallenge = (challengeDef) => {
    const state = getState();
    if (state.isEventActive) return;

    // Clone and prepare challenge
    const challenge = { ...challengeDef };

    // Generate sequence for combo challenge
    if (challenge.type === 'combo') {
        challenge.sequence = generateKeySequence(5);
        challenge.description = `Повтори послідовність клавіш: ${challenge.sequence.join(' → ')}`;
    }

    // Generate rhythm pattern
    if (challenge.type === 'rhythm') {
        challenge.rhythmPattern = generateRhythmPattern(challenge.targetHits);
        challenge.currentBeat = 0;
        scheduleRhythmBeats(challenge.rhythmPattern);    }

    // Initialize challenge data
    activeChallengeData = {
        challenge,
        startTime: Date.now(),
        clickCount: 0,
        keyInput: [],
        rhythmHits: 0,
        rhythmMisses: 0,
        timeoutId: null,
    };

    setEventActive(true);
    setEventMessage(challenge.title);

    const workButton = getElement('workButton');
    if (workButton) {
        workButton.disabled = true;
    }

    switchVideo(VIDEOS.WORKING);
    showChallengeUI();

    // Set timeout for challenge
    activeChallengeData.timeoutId = setTimeout(() => {
        endChallenge(false);
    }, challenge.timeLimit);

    updateUI();
};

/**
 * Handle button spam challenge click
 */
export const onChallengeClick = () => {
    if (!activeChallengeData) return;

    const { challenge } = activeChallengeData;

    if (challenge.type === 'spam') {
        activeChallengeData.clickCount += 1;
        updateChallengeDisplay();

        if (activeChallengeData.clickCount >= challenge.targetClicks) {
            endChallenge(true);
        }
    }
};

/**
 * Handle key input for challenges
 */
export const onKeyInput = (key) => {
    if (!activeChallengeData) return;

    const { challenge } = activeChallengeData;

    if (challenge.type === 'combo') {
        handleComboInput(key);
    } else if (challenge.type === 'rhythm') {
        handleRhythmInput(key);
    }
};

/**
 * Handle combo challenge key input
 */
const handleComboInput = (key) => {
    const { challenge } = activeChallengeData;
    const expectedKey = challenge.sequence[activeChallengeData.keyInput.length];

    if (key.toUpperCase() === expectedKey.toUpperCase()) {
        activeChallengeData.keyInput.push(key.toUpperCase());
        updateChallengeDisplay();

        if (activeChallengeData.keyInput.length >= challenge.sequence.length) {
            endChallenge(true);
        }
    } else {
        // Wrong key - fail challenge
        endChallenge(false);
    }
};

/**
 * Handle rhythm challenge key input
 */
const handleRhythmInput = (key) => {
    if (key !== ' ') return;

    const { challenge } = activeChallengeData;
    const currentTime = Date.now() - activeChallengeData.startTime;
    const expectedTime = challenge.rhythmPattern[challenge.currentBeat];
    const tolerance = 500; // 300ms tolerance

    if (Math.abs(currentTime - expectedTime) < tolerance) {
        activeChallengeData.rhythmHits += 1;
        challenge.currentBeat += 1;
        updateChallengeDisplay();

        if (activeChallengeData.rhythmHits >= challenge.targetHits) {
            endChallenge(true);
        }
    } else {
        activeChallengeData.rhythmMisses += 1;

        if (activeChallengeData.rhythmMisses >= 3) {
            endChallenge(false);
        }
    }
};

const scheduleRhythmBeats = (pattern) => {
    const startTime = Date.now();

    beatTimeouts.forEach(id => clearTimeout(id));
    beatTimeouts = [];

    pattern.forEach((beatTime) => {
        const id = setTimeout(() => {
            beatSound.currentTime = 0;
            beatSound.play();

            // flashBeatIndicator();
        }, beatTime);

        beatTimeouts.push(id);
    });
};

const stopRhythmAudio = () => {
    // Зупинити звук, якщо він грає
    beatSound.pause();
    beatSound.currentTime = 0;

    // Скасувати всі заплановані удари
    beatTimeouts.forEach(id => clearTimeout(id));
    beatTimeouts = [];
};

/**
 * End the challenge
 */
const endChallenge = (success) => {
    if (!activeChallengeData) return;

    clearTimeout(activeChallengeData.timeoutId);

    const { challenge } = activeChallengeData;
    const result = success ? challenge.reward : challenge.penalty;

    if (activeChallengeData.challenge.type === 'rhythm') {
        stopRhythmAudio();
    }

    // Apply rewards/penalties
    if (result.progress > 0) {
        incrementProgress(result.progress);
    }
    if (result.time !== 0) {
        decrementTimeLeft(-result.time); // Negative to add time
    }
    if (activeChallengeData.challenge.type === 'rhythm') {
        stopRhythmAudio();
    }

    // Show result message
    const resultMessage = success
        ? `✅ Успіх! +${result.progress}% прогресу, +${result.time} секунд!`
        : `❌ Не вдалося... ${result.time} секунд штрафу!`;

    setEventMessage(resultMessage);
    hideChallengeUI();

    setTimeout(() => {
        setEventActive(false);
        setEventMessage(null);

        const state = getState();
        const workButton = getElement('workButton');
        if (workButton) {
            workButton.disabled = state.progress >= 100 || state.isPaused;
        }

        switchVideo(VIDEOS.IDLE, true);
        activeChallengeData = null;
        updateUI();
    }, 2000);

    updateUI();
};

/**
 * Generate random key sequence
 */
const generateKeySequence = (length) => {
    const keys = ['W', 'A', 'S', 'D', 'Q', 'E'];
    const sequence = [];

    for (let i = 0; i < length; i++) {
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        sequence.push(randomKey);
    }

    return sequence;
};

/**
 * Generate rhythm pattern (timestamps in ms)
 */
const generateRhythmPattern = (beats) => {
    const pattern = [];
    let currentTime = 1000; // Start after 1 second

    for (let i = 0; i < beats; i++) {
        pattern.push(currentTime);
        currentTime += 800 + Math.random() * 400; // 800-1200ms between beats
    }

    return pattern;
};

/**
 * Show challenge UI overlay
 */
const showChallengeUI = () => {
    const challengeOverlay = document.getElementById('challenge-overlay');
    if (challengeOverlay) {
        challengeOverlay.classList.remove('hidden');
        updateChallengeDisplay();
    }
};

/**
 * Hide challenge UI overlay
 */
const hideChallengeUI = () => {
    const challengeOverlay = document.getElementById('challenge-overlay');
    if (challengeOverlay) {
        challengeOverlay.classList.add('hidden');
    }
};

/**
 * Update challenge display
 */
const updateChallengeDisplay = () => {
    if (!activeChallengeData) return;

    const { challenge } = activeChallengeData;
    const challengeTitle = document.getElementById('challenge-title');
    const challengeDesc = document.getElementById('challenge-description');
    const challengeProgress = document.getElementById('challenge-progress');
    const timeLeft = Math.max(0, challenge.timeLimit - (Date.now() - activeChallengeData.startTime));

    if (challengeTitle) {
        challengeTitle.textContent = challenge.title;
    }

    if (challengeDesc) {
        challengeDesc.textContent = challenge.description;
    }

    if (challengeProgress) {
        if (challenge.type === 'spam') {
            challengeProgress.textContent = `${activeChallengeData.clickCount} / ${challenge.targetClicks} кліків | ${Math.ceil(timeLeft / 1000)}s`;
        } else if (challenge.type === 'combo') {
            const input = activeChallengeData.keyInput.join(' ');
            const expected = challenge.sequence.join(' ');
            challengeProgress.textContent = `${input} | Треба: ${expected} | ${Math.ceil(timeLeft / 1000)}s`;
        } else if (challenge.type === 'rhythm') {
            challengeProgress.textContent = `Влучень: ${activeChallengeData.rhythmHits} / ${challenge.targetHits} | Промахів: ${activeChallengeData.rhythmMisses} | ${Math.ceil(timeLeft / 1000)}s`;
        }
    }
};