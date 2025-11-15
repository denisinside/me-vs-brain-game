// Game duration and timing
export const GAME_DURATION_SECONDS = 180; // 3 minutes

// Progress and gameplay
export const PROGRESS_PER_CLICK = 0.5;
export const EVENT_CHANCE_PER_SECOND = 0.05;

// Focus mechanics
export const FOCUS_DECAY_RATE = 0.6;
export const FOCUS_RECOVERY_RATE = 1.8;
export const FOCUS_CLICK_PENALTY = 0.35;

// Phone distraction
export const PHONE_DISTRACTION_THRESHOLD = 25;
export const PHONE_ESCAPE_CLICKS = 12;
export const PHONE_TRIGGER_CHANCE = 0.35;

// Video files
export const VIDEOS = {
    IDLE: 'idle.mp4',
    WORKING: 'working.mp4',
    DISTRACTION: 'distraction.mp4',
};

// Random events configuration
export const RANDOM_EVENTS = [
    {
        text: 'Кіт стрибнув на стіл і розкидав папірці! -10 секунд',
        video: VIDEOS.DISTRACTION,
        duration: 4000,
        penalty: 10,
        focusLoss: 6,
    },
    {
        text: 'Друг надіслав рілз! Ти не можеш не подивитись... -15 секунд',
        video: VIDEOS.DISTRACTION,
        duration: 5000,
        penalty: 15,
        focusLoss: 9,
    },
    {
        text: 'Сусідка-бабка стукає у двері: терміново потрібна сіль! -20 секунд',
        video: VIDEOS.DISTRACTION,
        duration: 6000,
        penalty: 20,
        focusLoss: 12,
    },
    {
        text: 'Вийшла нова серія улюбленого аніме! -12 секунд',
        video: VIDEOS.DISTRACTION,
        duration: 4500,
        penalty: 12,
        focusLoss: 7,
    },
    {
        text: 'Телефон розрядився! Пошуки зарядки забрали час... -8 секунд',
        video: VIDEOS.DISTRACTION,
        duration: 3200,
        penalty: 8,
        focusLoss: 4,
    },
];

// DOM element IDs
export const DOM_IDS = {
    VIDEO_PLAYER: 'game-video',
    START_SCREEN: 'start-screen',
    END_SCREEN: 'end-screen',
    GAME_SHELL: 'game-shell',
    START_BUTTON: 'start-button',
    WORK_BUTTON: 'work-button',
    RESTART_BUTTON: 'restart-button',
    PAUSE_BUTTON: 'pause-button',
    TIMER_DISPLAY: 'timer-display',
    PROGRESS_DISPLAY: 'progress-display',
    PROGRESS_BAR_FILL: 'progress-bar-fill',
    DEADLINE_BAR: 'deadline-bar',
    FOCUS_DISPLAY: 'focus-display',
    FOCUS_BAR_FILL: 'focus-bar-fill',
    TASK_BOX: 'task-box',
    EVENT_POPUP: 'event-popup',
    EVENT_TEXT: 'event-text',
    END_MESSAGE: 'end-message',
    END_DETAILS: 'end-details',
    THOUGHTS: ['thought-1', 'thought-2', 'thought-3', 'thought-4'],
};