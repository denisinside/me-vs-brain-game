// Game duration and timing
export const GAME_DURATION_SECONDS = 180; // 3 minutes

// Progress and gameplay
export const PROGRESS_PER_CLICK = 0.425;

// Focus mechanics
export const FOCUS_DECAY_RATE = 1;
export const FOCUS_RECOVERY_RATE = 7;
export const FOCUS_CLICK_PENALTY = 1;

// Phone distraction
export const PHONE_DISTRACTION_THRESHOLD = 40;
export const PHONE_ESCAPE_CLICKS = 20;
export const PHONE_TRIGGER_CHANCE = 0.11;

// Event probabilities 
export const STORY_EVENT_TRIGGER_PROBABILITY = 0.11;
export const CHALLENGE_TRIGGER_PROBABILITY = 0.08;

// Individual challenge weights (higher = more frequent)
export const CHALLENGE_WEIGHTS = {
    key_spam_challenge: 3,     // Most common - simple and fast
    combo_input_challenge: 2,  // Medium frequency
    typing_challenge: 1,       // Least common - more complex
};

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

// Audio assets
export const AUDIO_TRACKS = {
    CALM: ['events/bg_calm_loop1.mp3', 'events/bg_calm_loop2.mp3'],
    DEADLINE: ['events/bg_deadline_loop.mp3'],
};

export const AUDIO_SFX = {
    WORK_CLICK: 'events/mouse-click.wav',
    PHONE_ALERT: 'events/phone-notification.mp3',
    PHONE_CLEAR: 'events/phone-notification-2.mp3',
    FOCUS_REFRESH: 'events/focus_refresh.mp3',
    CHALLENGE_SUCCESS: 'events/success.wav',
    CHALLENGE_FAIL: 'events/failure-trumpets-2.mp3',
    CHALLENGE_MISTAKE: 'events/wrong-answer.wav',
    WINDOWS_ERROR: 'events/windows_error.mp3',
    PANIC: 'events/aaaahhhh_sfx.mp3',
    VICTORY: 'events/success_trumpets.mp3',
    DEFEAT: 'events/failure-trumpets.mp3',
};