import { getState, getActiveEffectsDescription } from '../state/gameState.js';
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

    if (state.isEventActive) {
        showEventInProgress(taskBox);
        return;
    }

    if (state.isPhoneDistracted) {
        showPhoneDistraction(taskBox, state);
        return;
    }

    if (state.workDisabled) {
        showWorkDisabled(taskBox);
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

const showEventInProgress = (taskBox) => {
    taskBox.textContent = 'Подія в процесі... Зроби свій вибір!';
    taskBox.classList.add('event');
};

const showPhoneDistraction = (taskBox, state) => {
    taskBox.textContent = `ВИЙДИ З ТЕЛЕФОНА! Залишилось кліків: ${state.phoneClicksRemaining}`;
    taskBox.classList.add('danger');
};

const showWorkDisabled = (taskBox) => {
    taskBox.textContent = 'Не можу зосередитися... Треба заспокоїтися.';
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
    // Check if there are active effects to show
    const effectsDesc = getActiveEffectsDescription();
    
    if (effectsDesc) {
        // Show effects description
        taskBox.textContent = `Результат події: ${effectsDesc}`;
        taskBox.classList.add('event');
    } else {
        // Show normal progress hint
        let hint = '';
        
        if (state.timeLeft <= 45) {
            hint = '⏱️ Поспішай, час майже закінчився!';
        } else if (state.focus < 40) {
            hint = '😵 Фокус падає! Зроби глибокий вдих.';
        } else if (state.progressRateModifier > 1) {
            hint = '⚡ Працюєш швидше! Використай це!';
        } else if (state.progressRateModifier < 1) {
            hint = '🐌 Працюєш повільніше... Тримайся!';
        } else {
            hint = '💪 Продовжуй у тому ж темпі!';
        }

        taskBox.textContent = hint;

        if (state.timeLeft <= 45 || state.focus <= 35) {
            taskBox.classList.add(state.timeLeft <= 25 ? 'danger' : 'warning');
        }
    }
};