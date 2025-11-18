import { randomElement } from '../utils/helpers.js';

const KEY_SET = ['A', 'S', 'D', 'F', 'J', 'K', 'L', 'П', 'Р', 'О'];
const PHRASES = [
    'фокус',
    'кодити до ранку',
    'жодних тік-токів',
    'зроби дедлайн',
];

const comboPools = [
    ['W', 'S', 'D'],
    ['J', 'K', 'L'],
    ['Q', 'W', 'E', 'R'],
];

export const CHALLENGE_DEFS = {
    key_spam_challenge: {
        type: 'key_spam_challenge',
        title: 'Спам-клавіша',
        instructions: 'Бий по вказаній клавіші, поки лічильник не дійде до нуля.',
        durationMs: 5000,
        requiredHits: 18,
        success: { progressAdjustment: 4 },
        fail: { timePenalty: 12 },
    },
    combo_input_challenge: {
        type: 'combo_input_challenge',
        title: 'Комбо-ввід',
        instructions: 'Повтори послідовність клавіш у правильному порядку.',
        durationMs: 7000,
        success: { progressAdjustment: 6 },
        fail: { timePenalty: 10 },
    },
    typing_challenge: {
        type: 'typing_challenge',
        title: 'Швидкий друк',
        instructions: 'Набери фразу без помилок. Кожна помилка з’їдає час.',
        durationMs: 9000,
        penaltyPerMistake: 2,
        success: { progressAdjustment: 8 },
        fail: { timePenalty: 8 },
    },
};

export const buildChallenge = (id) => {
    const template = CHALLENGE_DEFS[id];
    if (!template) return null;

    if (template.type === 'key_spam_challenge') {
        const key = randomElement(KEY_SET);
        return {
            ...template,
            targetKey: key.toUpperCase(),
            targetLabel: key.toUpperCase(),
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
            sequence: sequence.map((key) => key.toUpperCase()),
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
