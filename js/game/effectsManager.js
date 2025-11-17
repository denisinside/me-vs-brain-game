/**
 * Effects Manager - applies event outcome effects
 */

import {
    decrementTimeLeft,
    setProgress,
    getProgress,
    applyProgressRateModifier,
    applyWorkDisable
} from '../state/gameState.js';

/**
 * Apply a single effect
 */
export const applyEffect = (effect) => {
    if (!effect || !effect.type) {
        return;
    }

    switch (effect.type) {
        case 'modify_time':
            // value > 0 adds time, value < 0 removes time
            decrementTimeLeft(-effect.value);
            break;

        case 'modify_progress':
            // value > 0 adds progress, value < 0 removes progress
            const currentProgress = getProgress();
            const newProgress = Math.max(0, Math.min(100, currentProgress + effect.value));
            setProgress(newProgress);
            break;

        case 'modify_progress_rate':
            // value: multiplier (2 = double, 0.5 = half)
            // duration: in milliseconds
            applyProgressRateModifier(effect.value, effect.duration || 0);
            break;

        case 'disable_work':
            // duration: in milliseconds
            applyWorkDisable(effect.duration || 0);
            break;

        default:
            console.warn(`Unknown effect type: ${effect.type}`);
    }
};

/**
 * Apply multiple effects
 */
export const applyEffects = (effects) => {
    if (!Array.isArray(effects)) {
        return;
    }

    effects.forEach(effect => applyEffect(effect));
};

/**
 * Get human-readable description of effects
 */
export const getEffectsDescription = (effects) => {
    if (!Array.isArray(effects) || effects.length === 0) {
        return 'Подія пройшла без наслідків.';
    }

    const descriptions = effects.map(effect => {
        switch (effect.type) {
            case 'modify_time':
                if (effect.value > 0) {
                    return `⏰ +${effect.value} секунд часу`;
                } else {
                    return `⏰ ${effect.value} секунд часу`;
                }

            case 'modify_progress':
                if (effect.value > 0) {
                    return `📈 +${effect.value}% прогресу`;
                } else {
                    return `📉 ${effect.value}% прогресу`;
                }

            case 'modify_progress_rate':
                const duration = Math.round(effect.duration / 1000);
                if (effect.value > 1) {
                    return `⚡ Швидкість ×${effect.value} (${duration}с)`;
                } else {
                    return `🐌 Швидкість ×${effect.value} (${duration}с)`;
                }

            case 'disable_work':
                const disableDuration = Math.round(effect.duration / 1000);
                return `🚫 Робота заблокована (${disableDuration}с)`;

            default:
                return `❓ Невідомий ефект`;
        }
    });

    return descriptions.join(' • ');
};

