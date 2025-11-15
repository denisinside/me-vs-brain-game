import { getState } from '../state/gameState.js';


export const updateThoughts = (elements) => {
    const thoughtElements = elements.thoughtElements;
    if (!thoughtElements || thoughtElements.length < 4) return;

    const state = getState();
    const [ideaOne, ideaTwo, ideaThree, ideaFour] = thoughtElements;

    updateProgressThought(ideaOne, state);
    updateEventThought(ideaTwo, state);
    updateTimeThought(ideaThree, state);
    updateFocusThought(ideaFour, state);
};

const updateProgressThought = (element, state) => {
    if (!element) return;

    if (state.progress < 25) {
        element.textContent = 'Може, забити на це й піти спати?';
    } else if (state.progress < 60) {
        element.textContent = 'Робота просувається, але це ще не фініш...';
    } else if (state.progress < 90) {
        element.textContent = 'Ще трохи і можна буде відправляти!';
    } else {
        element.textContent = 'Все! Ще одне зусилля і можна святкувати!';
    }
};

const updateEventThought = (element, state) => {
    if (!element) return;

    if (state.isEventActive) {
        element.textContent = 'Чому всі навколо заважають мені працювати?!';
    } else if (state.isPhoneDistracted) {
        element.textContent = 'Лише один рілз... і ще один... Ой!';
    } else if (state.focus < 35) {
        element.textContent = 'Мені потрібна кава. Прямо зараз.';
    } else {
        element.textContent = 'Може, дозволити собі маленьку перерву?';
    }
};

const updateTimeThought = (element, state) => {
    if (!element) return;

    if (state.timeLeft <= 60) {
        element.textContent = 'Терміново! Залишилась хвилина!';
    } else if (state.timeLeft <= 120) {
        element.textContent = 'Час летить, треба прискоритись!';
    } else {
        element.textContent = 'Ще є час, але краще не розслаблятись.';
    }
};

const updateFocusThought = (element, state) => {
    if (!element) return;

    if (state.focus <= 25) {
        element.textContent = 'Мій мозок офіційно відмовився працювати.';
    } else if (state.focus <= 55) {
        element.textContent = 'Зібратись. Видих. У мене все вийде!';
    } else {
        element.textContent = 'Я в зоні! Ніяких соцмереж!';
    }
};