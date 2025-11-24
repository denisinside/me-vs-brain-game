export function initStartScreenControls(startScreenElement, startGameCallback) {
    const startBtn = document.getElementById('start-button');
    const tutorialBtn = document.getElementById('toggle-tutorial-btn');
    const tutorialDropdown = document.getElementById('tutorial-dropdown');

    if (tutorialBtn && tutorialDropdown) {
        tutorialBtn.addEventListener('click', () => {
            const isHidden = tutorialDropdown.classList.toggle('hidden');
            tutorialDropdown.classList.toggle('open');

            if (isHidden) {
                tutorialBtn.textContent = 'Показати туторіал';
            } else {
                tutorialBtn.textContent = 'Сховати туторіал';
            }
        });
    }

    if (startBtn && startScreenElement && startGameCallback) {
        startBtn.addEventListener('click', () => {
            startScreenElement.classList.add('hidden');
            startGameCallback();
        });
    }
}