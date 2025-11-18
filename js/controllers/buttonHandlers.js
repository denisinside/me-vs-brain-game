import { getGameController } from '../core/gameController.js';


export const handleWorkClick = () => {
    getGameController()?.handleWorkAction();
};

export const handleStartClick = () => {
    getGameController()?.startGame();
};

export const handleRestartClick = () => {
    getGameController()?.startGame();
};

export const handlePauseClick = () => {
    getGameController()?.togglePause();
};
