import { getState } from '../state/gameState.js';
import { formatTime } from '../utils/helpers.js';


export const updateTaskBox = (elements) => {
    const taskBox = elements.taskBox;
    if (!taskBox) return;

    const state = getState();

    // Reset classes
    taskBox.classList.remove('warning', 'danger', 'event');

    // Check different state in priority order
    if (state.isPaused) {
        showPauseMessage(taskBox);
        return;
    }

    if (state.isPhoneDistracted) {
        showPhoneDistraction(taskBox, state);
        return;
    }

    if (state.eventMessage) {
        showEventMessage(taskBox, state);
        return;
    }

    if (state.progress >= 100) {
        showCompletionMessage(taskBox);
        return;
    }

    showProgressMessage(taskBox, state);
};

const showPauseMessage = (taskBox) => {
    taskBox.textContent = 'Пауза. Зроби ковток води та повернись до битви.';
    taskBox.classList.add('warning');
};

const showPhoneDistraction = (taskBox, state) => {
    taskBox.textContent = `ВИЙДИ З ТЕЛЕФОНА! Залишилось кліків: ${state.phoneClicksRemaining}`;
    taskBox.classList.add('danger');
};

const showEventMessage = (taskBox, state) => {
    taskBox.textContent = state.eventMessage;
    taskBox.classList.add('event');
};

const showCompletionMessage = (taskBox) => {
    taskBox.textContent = 'Завдання готове! Натисни кнопку, щоб відправити його.';
};

const showProgressMessage = (taskBox, state) => {
    const timeHint = state.timeLeft <= 45 ? 'Поспішай!' : 'Продовжуй у тому ж темпі!';
    const focusHint = state.focus < 40 ? 'Фокус падає, зроби глибокий вдих.' : 'Фокус тримається.';

    taskBox.textContent = `Прогрес: ${state.progress}% • Фокус: ${Math.round(state.focus)}% • Час: ${formatTime(state.timeLeft)} • ${timeHint} ${focusHint}`;

    if (state.timeLeft <= 45 || state.focus <= 35) {
        taskBox.classList.add(state.timeLeft <= 25 ? 'danger' : 'warning');
    }
};