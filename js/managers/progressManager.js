import { incrementProgress, setProgress, getProgress as getProgressValue } from '../state/gameState.js';

/**
 * ProgressManager centralizes progress mutations for SRP compliance.
 */
export class ProgressManager {
    increaseProgress(amount) {
        if (!amount) return;
        incrementProgress(amount);
    }

    decreaseProgress(amount) {
        if (!amount) return;
        const nextValue = Math.max(0, getProgressValue() - Math.abs(amount));
        setProgress(nextValue);
    }

    getProgress() {
        return getProgressValue();
    }

    reset() {
        setProgress(0);
    }
}
