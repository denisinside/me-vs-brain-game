// Utility functions

/**
 * Clamps a value between min and max
 */
export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};


export const formatTime = (totalSeconds) => {
    const clamped = Math.max(0, totalSeconds);
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Gets a random element from an array
 */
export const randomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Checks if a random event should occur based on probability
 */
export const shouldTrigger = (probability) => {
    return Math.random() < probability;
};