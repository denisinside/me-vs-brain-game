import { adjustFocus, incrementProgress } from '../state/gameState.js';
import { updateUI } from '../ui/uiManager.js';

const powerups = {
    coffee: { focus: 30, name: 'Coffee Boost' },
};

export const usePowerup = (type) => {
    const powerup = powerups[type];
    if (!powerup) return;

    if (powerup.focus) adjustFocus(powerup.focus);
    if (powerup.progress) incrementProgress(powerup.progress);

    updateUI();
    return powerup.name;
};