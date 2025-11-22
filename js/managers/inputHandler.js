const IGNORE_KEYS = ['Shift', 'Alt', 'Control', 'Meta', 'Escape'];

const getMatchingPrefixLength = (value, target) => {
    const max = Math.min(value.length, target.length);
    for (let i = 0; i < max; i += 1) {
        if (value[i] !== target[i]) {
            return i;
        }
    }
    return max;
};

export class InputHandler {
    constructor({ elements, timerManager }) {
        this.elements = elements;
        this.timerManager = timerManager;
        this.activeChallenge = null;
        this.challengeResolve = null;
        this.countdownInterval = null;
        this.challengeTimeout = null;
        this.remainingMs = 0;
        this.typingListener = null;

        this.boundKeyListener = (event) => this.onKeyInput(event);
        document.addEventListener('keydown', this.boundKeyListener);
    }

    destroy() {
        document.removeEventListener('keydown', this.boundKeyListener);
        this.detachTypingListener();
        this.clearTimers();
    }

    startMiniChallenge(challengeDef) {
        if (!challengeDef) {
            return Promise.resolve({ success: false });
        }

        this.clearTimers();
        this.detachTypingListener();

        this.activeChallenge = {
            ...challengeDef,
            hits: 0,
            index: 0,
            mistakes: 0,
            typedValue: '',
            rawInputValue: '',
        };

        this.renderChallenge();

        this.remainingMs = challengeDef.durationMs;
        this.challengeTimeout = setTimeout(() => this.finish(false, 'timeout'), challengeDef.durationMs);
        this.countdownInterval = setInterval(() => this.updateTimer(), 100);

        return new Promise((resolve) => {
            this.challengeResolve = resolve;
        });
    }

    onKeyInput(event) {
        if (!this.activeChallenge || IGNORE_KEYS.includes(event.key)) {
            return;
        }

        const type = this.activeChallenge.type;
        if (type === 'key_spam_challenge') {
            this.handleKeySpam(event);
        } else if (type === 'combo_input_challenge') {
            this.handleComboInput(event);
        }
    }

    handleKeySpam(event) {
        const expected = this.activeChallenge.targetKey;
        if (!expected) return;
        const pressed = event.code;
        if (pressed !== expected) return;

        // Додаємо анімацію кнопки при успішному натисканні
        this.animateButtonPress();

        this.activeChallenge.hits += 1;
        const ratio = this.activeChallenge.hits / this.activeChallenge.requiredHits;
        this.updateProgress(ratio);

        if (this.activeChallenge.hits >= this.activeChallenge.requiredHits) {
            this.finish(true, 'completed');
        }
    }

    handleComboInput(event) {
        const sequence = this.activeChallenge.sequence || []; // Array of key codes like ['KeyA', 'KeyS', 'KeyD']
        const currentIndex = this.activeChallenge.index;
        const expected = sequence[currentIndex];
        if (!expected) return;
        const pressed = event.code; // Use key code for layout-independent detection

        if (pressed === expected) {
            // Додаємо анімацію кнопки при успішному натисканні
            this.animateButtonPress();

            this.activeChallenge.index += 1;
            this.highlightSequence(this.activeChallenge.index);
            const ratio = this.activeChallenge.index / sequence.length;
            this.updateProgress(ratio);
            if (this.activeChallenge.index >= sequence.length) {
                this.finish(true, 'combo-complete');
            }
        } else {
            this.activeChallenge.mistakes += 1;
            if (this.activeChallenge.allowedMistakes !== undefined &&
                this.activeChallenge.mistakes > this.activeChallenge.allowedMistakes) {
                this.finish(false, 'combo-fail');
            }
        }
    }

    attachTypingListener() {
        const input = this.elements.challengeInput;
        if (!input) return;
        this.typingListener = (event) => {
            this.handleTypingInput(event.target.value);
        };
        input.addEventListener('input', this.typingListener);
    }

    detachTypingListener() {
        const input = this.elements.challengeInput;
        if (input && this.typingListener) {
            input.removeEventListener('input', this.typingListener);
        }
        this.typingListener = null;
    }

    handleTypingInput(value) {
        if (!this.activeChallenge || this.activeChallenge.type !== 'typing_challenge') return;

        const target = this.activeChallenge.phrase || '';
        const trimmedValue = value.slice(0, target.length);
        if (trimmedValue !== value && this.elements.challengeInput) {
            this.elements.challengeInput.value = trimmedValue;
        }

        const previousRawValue = this.activeChallenge.rawInputValue || '';
        this.activeChallenge.rawInputValue = trimmedValue;

        const matchLength = getMatchingPrefixLength(trimmedValue, target);

        if (trimmedValue.length > previousRawValue.length) {
            for (let i = previousRawValue.length; i < trimmedValue.length; i += 1) {
                if (trimmedValue[i] !== target[i]) {
                    this.handleTypingMistake();
                    break;
                }
            }
        } else if (trimmedValue.length === previousRawValue.length && trimmedValue.length) {
            for (let i = 0; i < trimmedValue.length; i += 1) {
                if (trimmedValue[i] !== previousRawValue[i] && trimmedValue[i] !== target[i]) {
                    this.handleTypingMistake();
                    break;
                }
            }
        }

        this.activeChallenge.typedValue = trimmedValue.substring(0, matchLength);

        const ratio = target.length ? Math.min(1, matchLength / target.length) : 1;
        this.updateProgress(ratio);
        this.highlightTypingProgress(matchLength);

        if (matchLength >= target.length) {
            this.finish(true, 'typed');
        }
    }

    handleTypingMistake() {
        if (!this.activeChallenge) return;
        this.activeChallenge.mistakes += 1;
        if (this.activeChallenge.penaltyPerMistake && this.timerManager) {
            this.timerManager.applyTimePenalty(this.activeChallenge.penaltyPerMistake);
        }
    }

    updateTimer() {
        this.remainingMs = Math.max(0, this.remainingMs - 100);
        const seconds = Math.ceil(this.remainingMs / 1000);
        if (this.elements.challengeTimer) {
            const padded = seconds < 10 ? `0${seconds}` : `${seconds}`;
            this.elements.challengeTimer.textContent = `00:${padded}`;
        }
    }

    updateProgress(ratio) {
        if (this.elements.challengeProgressFill) {
            this.elements.challengeProgressFill.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
        }
    }

    renderChallenge() {
        if (!this.elements.challengeOverlay) return;

        this.elements.challengeOverlay.classList.remove('hidden');
        this.updateProgress(0);

        if (this.elements.challengeTitle) {
            this.elements.challengeTitle.textContent = this.activeChallenge.title;
        }
        if (this.elements.challengeInstructions) {
            this.elements.challengeInstructions.textContent = this.activeChallenge.instructions;
        }

        this.renderSequence();
        this.renderInputField();
        this.updateTimer();
    }

    renderSequence() {
        const container = this.elements.challengeSequence;
        if (!container) return;
        container.innerHTML = '';
        const type = this.activeChallenge.type;

        if (type === 'key_spam_challenge') {
            const span = document.createElement('span');
            span.textContent = this.activeChallenge.targetLabel ?? this.activeChallenge.targetKey;
            container.appendChild(span);
        } else if (type === 'combo_input_challenge') {
            (this.activeChallenge.sequenceLabels || this.activeChallenge.sequence || []).forEach((key) => {
                const span = document.createElement('span');
                span.textContent = key;
                container.appendChild(span);
            });
            this.highlightSequence(0);
        } else if (type === 'typing_challenge') {
            const phrase = this.activeChallenge.phrase || '';
            phrase.split('').forEach((char) => {
                const span = document.createElement('span');
                span.textContent = char;
                container.appendChild(span);
            });
            this.highlightTypingProgress(0);
        }
    }

    renderInputField() {
        const input = this.elements.challengeInput;
        if (!input) return;

        if (this.activeChallenge.type === 'typing_challenge') {
            input.classList.remove('hidden');
            input.value = '';
            input.focus();
            this.attachTypingListener();
        } else {
            input.classList.add('hidden');
            input.value = '';
            this.detachTypingListener();
        }
    }

    highlightSequence(completedCount) {
        const container = this.elements.challengeSequence;
        if (!container) return;
        Array.from(container.children).forEach((el, index) => {
            el.classList.toggle('completed', index < completedCount);
            el.classList.toggle('active', index === completedCount);
        });
    }

    highlightTypingProgress(length) {
        const container = this.elements.challengeSequence;
        if (!container) return;
        Array.from(container.children).forEach((el, index) => {
            el.classList.toggle('completed', index < length);
        });
    }

    clearTimers() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        if (this.challengeTimeout) {
            clearTimeout(this.challengeTimeout);
            this.challengeTimeout = null;
        }
    }

    finish(success) {
        this.clearTimers();
        this.detachTypingListener();
        if (this.elements.challengeOverlay) {
            this.elements.challengeOverlay.classList.add('hidden');
        }

        if (!this.activeChallenge) {
            if (this.challengeResolve) {
                this.challengeResolve({ success: false });
                this.challengeResolve = null;
            }
            return;
        }

        const payload = success ? this.activeChallenge.success : this.activeChallenge.fail;
        const resolve = this.challengeResolve;
        this.activeChallenge = null;
        this.challengeResolve = null;

        if (resolve) {
            resolve({ success, ...payload });
        }
    }

    /**
     * Анімація натискання кнопки для візуального фідбеку
     */
    animateButtonPress(intense = false) {
        const workButton = document.getElementById('work-button');
        if (!workButton) return;

        // Видаляємо попередні класи анімації
        workButton.classList.remove('button-press', 'button-press-intense');

        // Додаємо новий клас анімації
        const animationClass = intense ? 'button-press-intense' : 'button-press';
        workButton.classList.add(animationClass);

        // Видаляємо клас після завершення анімації
        setTimeout(() => {
            workButton.classList.remove(animationClass);
        }, intense ? 200 : 150);
    }
}
