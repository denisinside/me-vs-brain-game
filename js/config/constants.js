// Game duration and timing
export const GAME_DURATION_SECONDS = 180; // 3 minutes

// Progress and gameplay
export const PROGRESS_PER_CLICK = 0.4;
export const EVENT_CHANCE_PER_SECOND = 0.1;

// Focus mechanics
export const FOCUS_DECAY_RATE = 1;
export const FOCUS_RECOVERY_RATE = 3;
export const FOCUS_CLICK_PENALTY = 1;

// Phone distraction
export const PHONE_DISTRACTION_THRESHOLD = 45;
export const PHONE_ESCAPE_CLICKS = 20;
export const PHONE_TRIGGER_CHANCE = 0.15;

// Video files
export const VIDEOS = {
    IDLE: 'idle.mp4',
    WORKING: 'working.mp4',
    DISTRACTION: 'distraction.mp4',
};

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
    EVENT_TITLE: 'event-title',
    EVENT_DESCRIPTION: 'event-description',
    SIDEBAR_TITLE: 'sidebar-title',
    CHOICE_CONTAINER: 'choice-container',
    THOUGHTS_CONTAINER: 'thoughts-container',
    AVATAR_CARD: 'avatar-card',
    QTE_CONTAINER: 'qte-container',
    QTE_KEY: 'qte-key',
    QTE_COUNTER: 'qte-counter',
    CHALLENGE_OVERLAY: 'challenge-overlay',
    CHALLENGE_TITLE: 'challenge-title',
    CHALLENGE_INSTRUCTIONS: 'challenge-instructions',
    CHALLENGE_BODY: 'challenge-body',
    CHALLENGE_SEQUENCE: 'challenge-sequence',
    CHALLENGE_INPUT: 'challenge-input',
    CHALLENGE_PROGRESS_TRACK: 'challenge-progress-track',
    CHALLENGE_PROGRESS_FILL: 'challenge-progress-fill',
    CHALLENGE_TIMER: 'challenge-timer',
    VIDEO_FALLBACK: 'video-fallback',
    END_MESSAGE: 'end-message',
    END_DETAILS: 'end-details',
    THOUGHTS: ['thought-1', 'thought-2', 'thought-3', 'thought-4'],
};