import { getState, setEventActive, setPhoneDistracted, setWorking, setPaused, setPhoneClicksRemaining, setEventMessage, getEventEpilogues, setChallengeActive } from '../state/gameState.js';
import { GAME_DURATION_SECONDS } from '../config/constants.js';
import { formatTime } from '../utils/helpers.js';
import { updateUI, toggleEndScreen, getElement } from '../ui/uiManager.js';
import { switchVideo, pauseVideo } from '../utils/videoManager.js';
import { VIDEOS } from '../config/constants.js';
import { stopGameLoop } from '../game/gameLoop.js';


export const endGame = (isWin) => {
    setEventActive(false);
    setChallengeActive(false);
    setPhoneDistracted(false);
    setWorking(false);
    setPaused(false);
    setPhoneClicksRemaining(0);
    setEventMessage(null);
    stopGameLoop();
    switchVideo(VIDEOS.IDLE, true);
    pauseVideo();

    const challengeElements = [
        'challengeContainer',
        'challengeTitle',
        'challengeInstructions',
        'challengeSequence',
        'challengeInput',
        'challengeProgress',
        'challengeTimer'
    ];

    challengeElements.forEach(id => {
        const element = getElement(id);
        if (element) {
            element.classList.add('hidden');
        }
    });

    const workButton = getElement('workButton');
    if (workButton) {
        workButton.disabled = true;
        workButton.onclick = null;
    }

    updateUI();
    displayEndScreen(isWin);
    toggleEndScreen(true);
};

const displayEndScreen = (isWin) => {
    const state = getState();
    const endMessage = getElement('endMessage');
    const endDetails = getElement('endDetails');

    if (!endMessage || !endDetails) return;

    let detailsHTML = '';

    if (isWin) {
        endMessage.textContent = '🎉 Перемога! 🎉';
        detailsHTML = `
            <p>Денис встиг здати завдання за ${formatTime(GAME_DURATION_SECONDS - state.timeLeft)}.</p>
            <p>Він переміг свій мозок і довів, що дедлайни йому не страшні.</p>
            <p>Професор у захваті, а Денис заслужив відпочинок.</p>
        `;
    } else {
        endMessage.textContent = '💀 Дедлайн! 💀';
        detailsHTML = `
            <p>Денис не встиг... Завдання виконано лише на ${state.progress.toFixed(2)}%.</p>
            <p>Мозок переміг, відволікаючи котиками, рілзами та сусідами.</p>
            <p>Професор невдоволений, але шанс виправити ситуацію ще буде.</p>
        `;
    }

    // Add event epilogues if any
    const epilogues = getEventEpilogues();
    if (epilogues.length > 0) {
        detailsHTML += '<div class="epilogue-section"><h3>📖 Що сталося під час роботи:</h3>';
        epilogues.forEach(epilogue => {
            detailsHTML += `
                <div class="epilogue-item">
                    <h4>${epilogue.title}</h4>
                    <p>${epilogue.text}</p>
                </div>
            `;
        });
        detailsHTML += '</div>';
    }

    endDetails.innerHTML = detailsHTML;
};