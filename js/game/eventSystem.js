/**
 * Event System - handles choice and QTE events
 */

import { 
    setEventActive, 
    setCurrentEvent,
    getState
} from '../state/gameState.js';
import { switchVideo, onVideoEnd } from '../utils/videoManager.js';
import { updateUI, getElement } from '../ui/uiManager.js';

let currentEventData = null;
let currentOutcome = null;
let qteClicksRemaining = 0;
let qteTimeout = null;
let qteKeyListener = null;
let currentQteKey = ''; // Key code (e.g., 'KeyQ')
let currentQteDisplayKey = ''; // Display label (e.g., 'Q')
let externalHooks = {
    onChoiceSelected: null,
    onQteResolved: null,
    onOutcomeComplete: null,
};

export const registerEventHooks = (hooks = {}) => {
    externalHooks = { ...externalHooks, ...hooks };
};

/**
 * Start an event (choice or QTE)
 */
export const startEvent = (eventData) => {
    if (!eventData) return;

    currentEventData = eventData;
    setEventActive(true);
    setCurrentEvent(eventData);

    // Disable work button
    const workButton = getElement('workButton');
    if (workButton) {
        workButton.disabled = true;
    }

    // Play main event video
    const mainVideoPath = `events/${eventData.mainVideo}`;
    switchVideo(mainVideoPath, false);

    // Show event info
    showEventInfo(eventData);

    // Wait for video to end before showing choices/QTE
    onVideoEnd(() => {
        if (eventData.type === 'choice') {
            showChoices(eventData);
        } else if (eventData.type === 'qte') {
            startQTE(eventData);
        }
    });

    updateUI();
};

/**
 * Show event information
 */
const showEventInfo = (eventData) => {
    const eventPopup = getElement('eventPopup');
    const eventTitle = getElement('eventTitle');
    const eventDescription = getElement('eventDescription');
    const thoughtsContainer = getElement('thoughtsContainer');
    const sidebarTitle = getElement('sidebarTitle');

    if (eventTitle) {
        eventTitle.textContent = eventData.title;
    }

    if (eventDescription) {
        eventDescription.textContent = eventData.fullDescription;
    }

    if (eventPopup) {
        eventPopup.classList.remove('hidden');
    }

    // Change sidebar title to event title
    if (sidebarTitle) {
        sidebarTitle.textContent = eventData.title;
    }

    // Hide thoughts when event is shown
    if (thoughtsContainer) {
        thoughtsContainer.classList.add('hidden');
    }
};

/**
 * Hide event information
 */
const hideEventInfo = () => {
    const eventPopup = getElement('eventPopup');
    const thoughtsContainer = getElement('thoughtsContainer');
    const sidebarTitle = getElement('sidebarTitle');
    
    if (eventPopup) {
        eventPopup.classList.add('hidden');
    }

    // Restore sidebar title
    if (sidebarTitle) {
        sidebarTitle.textContent = 'Думки в голові';
    }

    // Show thoughts again
    if (thoughtsContainer) {
        thoughtsContainer.classList.remove('hidden');
    }
};

/**
 * Show choice buttons
 */
const showChoices = (eventData) => {
    // Don't hide event info - keep it visible during choice
    
    const choiceContainer = getElement('choiceContainer');
    const avatarCard = getElement('avatarCard');
    
    if (!choiceContainer) return;

    // Clear existing choices
    choiceContainer.innerHTML = '';

    // Create choice buttons
    eventData.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = choice.buttonText;
        button.onclick = () => {
            if (externalHooks.onChoiceSelected) {
                const handled = externalHooks.onChoiceSelected(currentEventData, choice, index);
                if (handled) {
                    hideChoices();
                    return;
                }
            }
            selectChoice(choice);
        };
        choiceContainer.appendChild(button);
    });

    choiceContainer.classList.remove('hidden');
    
    // Hide avatar when choices are shown
    if (avatarCard) {
        avatarCard.classList.add('hidden');
    }
};

/**
 * Hide choice buttons
 */
const hideChoices = () => {
    const choiceContainer = getElement('choiceContainer');
    const avatarCard = getElement('avatarCard');
    
    if (choiceContainer) {
        choiceContainer.classList.add('hidden');
        choiceContainer.innerHTML = '';
    }
    
    // Show avatar again
    if (avatarCard) {
        avatarCard.classList.remove('hidden');
    }
};

/**
 * Handle choice selection
 */
const selectChoice = (choice) => {
    hideChoices();
    currentOutcome = choice.outcome;
    playOutcome(choice.outcome);
};

/**
 * Start QTE event
 */
const startQTE = (eventData) => {
    // Don't hide event info - keep it visible during QTE

    const qteSettings = eventData.qteSettings;
    qteClicksRemaining = qteSettings.clicksToWin;

    // Generate random key (using key codes for layout-independent detection)
    const keyCodes = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyA', 'KeyS', 'KeyD', 'KeyF'];
    const keyLabels = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F'];
    const randomIndex = Math.floor(Math.random() * keyCodes.length);
    currentQteKey = keyCodes[randomIndex]; // Store key code for detection
    currentQteDisplayKey = keyLabels[randomIndex]; // Store label for display

    // Show QTE UI
    showQTE();

    // Play loop video
    if (eventData.loopVideo) {
        const loopVideoPath = `events/${eventData.loopVideo}`;
        switchVideo(loopVideoPath, true);
    }

    // Set up key listener
    qteKeyListener = (e) => handleQTEKey(e, eventData);
    document.addEventListener('keydown', qteKeyListener);

    // Start timeout
    qteTimeout = setTimeout(() => {
        qteFailure(eventData);
    }, qteSettings.duration);

    updateQTEDisplay();
};

/**
 * Show QTE UI
 */
const showQTE = () => {
    const qteContainer = getElement('qteContainer');
    if (qteContainer) {
        qteContainer.classList.remove('hidden');
    }
};

/**
 * Hide QTE UI
 */
const hideQTE = () => {
    const qteContainer = getElement('qteContainer');
    if (qteContainer) {
        qteContainer.classList.add('hidden');
    }
};

/**
 * Update QTE display
 */
const updateQTEDisplay = () => {
    const qteKey = getElement('qteKey');
    const qteCounter = getElement('qteCounter');

    if (qteKey) {
        qteKey.textContent = currentQteDisplayKey;
    }

    if (qteCounter) {
        qteCounter.textContent = qteClicksRemaining;
    }
};

/**
 * Handle QTE key press
 * Uses e.code instead of e.key to work with any keyboard layout
 */
const handleQTEKey = (e, eventData) => {
    // Use e.code (physical key position) instead of e.key (character) for layout independence
    if (e.code === currentQteKey) {
        qteClicksRemaining--;
        updateQTEDisplay();

        if (qteClicksRemaining <= 0) {
            qteSuccess(eventData);
        }
    }
};

/**
 * QTE success
 */
const qteSuccess = (eventData) => {
    cleanupQTE();
    hideQTE();
    currentOutcome = eventData.successOutcome;
    if (externalHooks.onQteResolved && externalHooks.onQteResolved(currentEventData, true, eventData.successOutcome)) {
        return;
    }
    playOutcome(eventData.successOutcome);
};

/**
 * QTE failure
 */
const qteFailure = (eventData) => {
    cleanupQTE();
    hideQTE();
    currentOutcome = eventData.failureOutcome;
    if (externalHooks.onQteResolved && externalHooks.onQteResolved(currentEventData, false, eventData.failureOutcome)) {
        return;
    }
    playOutcome(eventData.failureOutcome);
};

/**
 * Clean up QTE
 */
const cleanupQTE = () => {
    if (qteTimeout) {
        clearTimeout(qteTimeout);
        qteTimeout = null;
    }

    if (qteKeyListener) {
        document.removeEventListener('keydown', qteKeyListener);
        qteKeyListener = null;
    }
};

/**
 * Play outcome
 */
const playOutcome = (outcome) => {
    if (!outcome) return;

    // Play outcome video
    const outcomeVideoPath = `events/${outcome.video}`;
    switchVideo(outcomeVideoPath, false);

    // Wait for video to end
    onVideoEnd(() => {
        setTimeout(() => {
            if (externalHooks.onOutcomeComplete) {
                externalHooks.onOutcomeComplete(currentEventData, outcome);
            }
            endEvent();
        }, 500);
    });
};

/**
 * End event
 */
const endEvent = () => {
    setEventActive(false);
    setCurrentEvent(null);
    currentEventData = null;
    currentOutcome = null;

    // Hide event info and restore sidebar
    hideEventInfo();

    // Switch back to idle video
    switchVideo('idle.mp4', true);

    // Re-enable work button if appropriate
    const state = getState();
    const workButton = getElement('workButton');
    if (workButton) {
        workButton.disabled = state.progress >= 100 || state.isPaused || state.isPhoneDistracted || state.isEventActive || state.workDisabled;
    }

    updateUI();
};

/**
 * Clean up event system
 */
export const cleanupEventSystem = () => {
    cleanupQTE();
    hideChoices();
    hideQTE();
    hideEventInfo();
};

export const playEventOutcome = (outcome) => {
    playOutcome(outcome);
};

