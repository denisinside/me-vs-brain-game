/**
 * Event Loader - loads and manages events from events.json
 */

let eventsData = null;
let availableEvents = [];
let usedEventIds = new Set();

/**
 * Load events from JSON file
 */
export const loadEvents = async () => {
    try {
        const response = await fetch('assets/events.json');
        if (!response.ok) {
            throw new Error(`Failed to load events: ${response.status}`);
        }
        eventsData = await response.json();
        resetAvailableEvents();
        return true;
    } catch (error) {
        console.error('Error loading events:', error);
        return false;
    }
};

/**
 * Reset available events pool (for new game)
 */
export const resetAvailableEvents = () => {
    if (!eventsData || !eventsData.events) {
        availableEvents = [];
        return;
    }
    
    // Create weighted pool of events
    availableEvents = eventsData.events.filter(event => !usedEventIds.has(event.id));
    usedEventIds.clear();
};

/**
 * Get random event based on weights
 */
export const getRandomEvent = () => {
    if (availableEvents.length === 0) {
        console.warn('No available events');
        return null;
    }

    // // TODO: TESTING - Always return first event (event_neighbor_grandma)
    // // Remove this block when testing is done
    // const firstEvent = availableEvents.find(e => e.id === 'event_laptop_battery');
    // if (firstEvent) {
    //     // Don't mark as used for testing - allow repeating
    //     return firstEvent;
    // }

    // Calculate total weight
    const totalWeight = availableEvents.reduce((sum, event) => sum + (event.weight || 1), 0);
    
    // Pick random event based on weight
    let random = Math.random() * totalWeight;
    
    for (const event of availableEvents) {
        random -= (event.weight || 1);
        if (random <= 0) {
            // Mark event as used
            usedEventIds.add(event.id);
            availableEvents = availableEvents.filter(e => e.id !== event.id);
            return event;
        }
    }
    
    // Fallback to first event
    const event = availableEvents[0];
    usedEventIds.add(event.id);
    availableEvents = availableEvents.filter(e => e.id !== event.id);
    return event;
};

/**
 * Get all events data
 */
export const getAllEvents = () => eventsData;

/**
 * Get number of available events
 */
export const getAvailableEventsCount = () => availableEvents.length;

/**
 * Check if events are loaded
 */
export const areEventsLoaded = () => eventsData !== null;

