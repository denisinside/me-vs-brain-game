import { getState } from '../state/gameState.js';
import { getRandomEvent, getAvailableEventsCount } from './eventLoader.js';
import { startEvent } from './eventSystem.js';

/**
 * Trigger a random event from loaded events.json
 */
export const triggerRandomEvent = () => {
    const state = getState();

    // Don't trigger if event already active, working, or paused
    if (state.isEventActive || state.isWorking || state.isPaused) {
        return;
    }

    // Check if there are available events
    if (getAvailableEventsCount() === 0) {
        console.log('No more events available');
        return;
    }

    // Get random event from loaded events
    const eventData = getRandomEvent();
    
    if (!eventData) {
        console.warn('Could not get random event');
        return;
    }

    // Start the event
    startEvent(eventData);
};