import { randomElement } from '../utils/helpers.js';

const KEY_CODES = [
    'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyK', 'KeyL',
    'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU'
];

const KEY_LABELS = [
    'A', 'S', 'D', 'J', 'K', 'L',
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U'
];

const PHRASES = [
    'кодити далі',
    'жодних тіктоків',
    'зроби дедлайн',
    'чистий фокус',
    'тільки робота',
    'лише код',
    'стальовий фокус',
    'жодних відволікань',
    'час працювати',
    'стисни терміни',
    'код і кава',
    'ти сильний',
    'тримайся',
    'фокус тримай',
    'завжди код',
    'переможи дедлайн',
    'без паніки',
    'роби швидко',
];

const comboPools = [
    ['KeyW', 'KeyS', 'KeyD'],
    ['KeyJ', 'KeyK', 'KeyL'],
    ['KeyQ', 'KeyW', 'KeyE', 'KeyR'],
];

export const CHALLENGE_DEFS = {
    key_spam_challenge: {
        type: 'key_spam_challenge',
        title: 'Спам-клавіша',
        instructions: 'Бий по вказаній клавіші, поки лічильник не дійде до нуля.',
        durationMs: 4000,
        requiredHits: 15,
        success: { progressAdjustment: 1.5 },
        fail: { timePenalty: 8 },
    },
    combo_input_challenge: {
        type: 'combo_input_challenge',
        title: 'Комбо-ввід',
        instructions: 'Повтори послідовність клавіш у правильному порядку.',
        durationMs: 3000,
        success: { progressAdjustment: 2.5 },
        fail: { timePenalty: 7 },
    },
    typing_challenge: {
        type: 'typing_challenge',
        title: 'Швидкий друк',
        instructions: 'Набери фразу без помилок. Кожна помилка з’їдає час.',
        durationMs: 6000,
        penaltyPerMistake: 2,
        success: { progressAdjustment: 4 },
        fail: { timePenalty: 5 },
    },
};

const getRandomKey = () => {
    const index = Math.floor(Math.random() * KEY_CODES.length);
    return {
        code: KEY_CODES[index],
        label: KEY_LABELS[index]
    };
};

export const buildChallenge = (id) => {
    const template = CHALLENGE_DEFS[id];
    if (!template) return null;

    if (template.type === 'key_spam_challenge') {
        const key = getRandomKey();
        return {
            ...template,
            targetKey: key.code,
            targetLabel: key.label,
        };
    }

    if (template.type === 'combo_input_challenge') {
        const pool = randomElement(comboPools);
        const length = Math.min(5, Math.max(3, pool.length));
        const sequence = [];
        while (sequence.length < length) {
            sequence.push(randomElement(pool));
        }

        return {
            ...template,
            sequence: sequence, // Array of key codes
            sequenceLabels: sequence.map(code => {
                const index = KEY_CODES.indexOf(code);
                return index >= 0 ? KEY_LABELS[index] : code;
            }), // Array of display labels
            allowedMistakes: 1,
        };
    }

    if (template.type === 'typing_challenge') {
        const phrase = randomElement(PHRASES);
        return {
            ...template,
            phrase,
        };
    }

    return { ...template };
};
