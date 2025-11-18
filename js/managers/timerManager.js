import { setTimeLeft, decrementTimeLeft, getTimeLeft } from '../state/gameState.js';

/**
 * TimerManager keeps gameplay time in sync with configurable pacing.
 */
export class TimerManager {
    constructor({ onTick = () => {}, onFinish = () => {} } = {}) {
        this.onTick = onTick;
        this.onFinish = onFinish;
        this.intervalId = null;
        this.config = {
            totalGameMinutes: 3,
            realSecondsPerGameMinute: 3,
        };
        this.secondsPerTick = 1;
        this.tickModifier = 1;
        this.slowdownTimeout = null;
        this.isPaused = false;
    }

    init(totalGameMinutes, realSecondsPerGameMinute) {
        this.config.totalGameMinutes = totalGameMinutes;
        this.config.realSecondsPerGameMinute = realSecondsPerGameMinute;
        const totalGameSeconds = totalGameMinutes * 60;
        setTimeLeft(totalGameSeconds);
        this.secondsPerTick = 60 / realSecondsPerGameMinute;
        this.tickModifier = 1;
        this.clearSlowdown();
    }

    start() {
        this.stop();
        this.isPaused = false;
        this.intervalId = setInterval(() => this.tick(), 1000);
    }

    tick() {
        if (this.isPaused) {
            return;
        }

        const delta = this.secondsPerTick * this.tickModifier;
        decrementTimeLeft(delta);

        if (typeof this.onTick === 'function') {
            this.onTick();
        }

        if (getTimeLeft() <= 0) {
            this.stop();
            if (typeof this.onFinish === 'function') {
                this.onFinish();
            }
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.clearSlowdown();
    }

    setCallbacks({ onTick, onFinish } = {}) {
        this.onTick = onTick ?? this.onTick;
        this.onFinish = onFinish ?? this.onFinish;
    }

    applyTimePenalty(seconds) {
        if (!seconds) return;
        decrementTimeLeft(Math.abs(seconds));
    }

    applyTimeSlowdown(percentage, durationSec) {
        this.clearSlowdown();
        this.tickModifier = Math.max(0.05, percentage);

        if (durationSec > 0) {
            this.slowdownTimeout = setTimeout(() => {
                this.tickModifier = 1;
                this.slowdownTimeout = null;
            }, durationSec * 1000);
        }
    }

    clearSlowdown() {
        if (this.slowdownTimeout) {
            clearTimeout(this.slowdownTimeout);
            this.slowdownTimeout = null;
        }
        this.tickModifier = 1;
    }
}
