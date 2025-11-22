import { getGameController } from '../core/gameController.js';
import { enterFullscreen, exitFullscreen, toggleFullscreen } from '../utils/fullscreen.js';


export const handleWorkClick = () => {
    getGameController()?.handleWorkAction();
};

export const handleStartClick = () => {
    try {
        enterFullscreen();
    } catch (error) {
        console.log('Fullscreen not supported or failed:', error);
    }

    getGameController()?.startGame();
};

export const handleRestartClick = () => {
    getGameController()?.startGame();
};

export const handlePauseClick = () => {
    try {
        exitFullscreen();
    } catch (error) {
        console.log('Exit fullscreen failed:', error);
    }

    getGameController()?.togglePause();
};

export const handleFullscreenToggle = () => {
    try {
        toggleFullscreen();
    } catch (error) {
        console.log('Fullscreen toggle failed:', error);
    }
};
