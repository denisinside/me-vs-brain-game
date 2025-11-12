document.addEventListener('DOMContentLoaded', () => {
    // --- DOM REFERENCES ---
    const videoPlayer = document.getElementById('game-video');
    const startScreen = document.getElementById('start-screen');
    const endScreen = document.getElementById('end-screen');
    const gameShell = document.getElementById('game-shell');

    const startButton = document.getElementById('start-button');
    const workButton = document.getElementById('work-button');
    const restartButton = document.getElementById('restart-button');
    const pauseButton = document.getElementById('pause-button');

    const timerDisplay = document.getElementById('timer-display');
    const progressDisplay = document.getElementById('progress-display');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const deadlineBar = document.getElementById('deadline-bar');
    const focusDisplay = document.getElementById('focus-display');
    const focusBarFill = document.getElementById('focus-bar-fill');

    const taskBox = document.getElementById('task-box');
    const eventPopup = document.getElementById('event-popup');
    const eventText = document.getElementById('event-text');
    const endMessage = document.getElementById('end-message');
    const endDetails = document.getElementById('end-details');

    const thoughtIds = ['thought-1', 'thought-2', 'thought-3', 'thought-4'];
    const thoughtElements = thoughtIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    // --- GAME CONSTANTS ---
    const GAME_DURATION_SECONDS = 180; // 3 хвилини
    const PROGRESS_PER_CLICK = 0.5;
    const EVENT_CHANCE_PER_SECOND = 0.05;
    const FOCUS_DECAY_RATE = 0.6;
    const FOCUS_RECOVERY_RATE = 1.8;
    const FOCUS_CLICK_PENALTY = 0.35;
    const PHONE_DISTRACTION_THRESHOLD = 25;
    const PHONE_ESCAPE_CLICKS = 12;

    // --- GAME STATE ---
    const state = {
        progress: 0,
        timeLeft: GAME_DURATION_SECONDS,
        focus: 100,
        gameLoopInterval: null,
        isEventActive: false,
        isWorking: false,
        isPhoneDistracted: false,
        isPaused: false,
        phoneClicksRemaining: 0,
        eventMessage: null, // Повідомлення про поточну подію
    };

    // --- UTILITIES ---
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const formatTime = (totalSeconds) => {
        const clamped = Math.max(0, totalSeconds);
        const minutes = Math.floor(clamped / 60);
        const seconds = clamped % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const setPause = (value) => {
        state.isPaused = value;
        if (value) {
            videoPlayer.pause();
            pauseButton.classList.add('paused');
            workButton.disabled = true;
        } else {
            pauseButton.classList.remove('paused');
            if (!state.isEventActive && !state.isPhoneDistracted && state.progress < 100) {
                workButton.disabled = false;
            }
            videoPlayer.play().catch(() => {});
        }
        updateUI();
    };

    const togglePauseVisibility = (show) => {
        if (show) {
            pauseButton.classList.add('visible');
        } else {
            pauseButton.classList.remove('visible');
            pauseButton.classList.remove('paused');
        }
    };

    // --- VISUAL UPDATES ---
    const updateMeters = () => {
        const deadlinePercent = (state.timeLeft / GAME_DURATION_SECONDS) * 100;
        if (deadlineBar) {
            deadlineBar.style.width = `${clamp(deadlinePercent, 0, 100)}%`;
            deadlineBar.classList.toggle('warning', deadlinePercent <= 35 && deadlinePercent > 15);
            deadlineBar.classList.toggle('danger', deadlinePercent <= 15);
        }

        if (timerDisplay) {
            timerDisplay.textContent = formatTime(state.timeLeft);
        }

        if (progressDisplay) {
            progressDisplay.textContent = `${state.progress}%`;
        }
        if (progressBarFill) {
            progressBarFill.style.width = `${clamp(state.progress, 0, 100)}%`;
        }

        if (focusDisplay) {
            focusDisplay.textContent = `${Math.round(state.focus)}%`;
        }
        if (focusBarFill) {
            focusBarFill.style.width = `${clamp(state.focus, 0, 100)}%`;
            focusBarFill.classList.toggle('warning', state.focus <= 55 && state.focus > 30);
            focusBarFill.classList.toggle('danger', state.focus <= 30);
        }
    };

    const updateThoughts = () => {
        if (thoughtElements.length < 4) return;

        const [ideaOne, ideaTwo, ideaThree, ideaFour] = thoughtElements;
        if (ideaOne) {
            if (state.progress < 25) {
                ideaOne.textContent = 'Може, забити на це й піти спати?';
            } else if (state.progress < 60) {
                ideaOne.textContent = 'Робота просувається, але це ще не фініш...';
            } else if (state.progress < 90) {
                ideaOne.textContent = 'Ще трохи і можна буде відправляти!';
            } else {
                ideaOne.textContent = 'Все! Ще одне зусилля і можна святкувати!';
            }
        }

        if (ideaTwo) {
            if (state.isEventActive) {
                ideaTwo.textContent = 'Чому всі навколо заважають мені працювати?!';
            } else if (state.isPhoneDistracted) {
                ideaTwo.textContent = 'Лише один рілз... і ще один... Ой!';
            } else if (state.focus < 35) {
                ideaTwo.textContent = 'Мені потрібна кава. Прямо зараз.';
            } else {
                ideaTwo.textContent = 'Може, дозволити собі маленьку перерву?';
            }
        }

        if (ideaThree) {
            if (state.timeLeft <= 60) {
                ideaThree.textContent = 'Терміново! Залишилась хвилина!';
            } else if (state.timeLeft <= 120) {
                ideaThree.textContent = 'Час летить, треба прискоритись!';
            } else {
                ideaThree.textContent = 'Ще є час, але краще не розслаблятись.';
            }
        }

        if (ideaFour) {
            if (state.focus <= 25) {
                ideaFour.textContent = 'Мій мозок офіційно відмовився працювати.';
            } else if (state.focus <= 55) {
                ideaFour.textContent = 'Зібратись. Видих. У мене все вийде!';
            } else {
                ideaFour.textContent = 'Я в зоні! Ніяких соцмереж!';
            }
        }
    };

    const updateTaskBox = () => {
        if (!taskBox) return;
        taskBox.classList.remove('warning', 'danger', 'event');

        if (state.isPaused) {
            taskBox.textContent = 'Пауза. Зроби ковток води та повернись до битви.';
            taskBox.classList.add('warning');
            return;
        }

        if (state.isPhoneDistracted) {
            taskBox.textContent = `ВИЙДИ З ТЕЛЕФОНА! Залишилось кліків: ${state.phoneClicksRemaining}`;
            taskBox.classList.add('danger');
            return;
        }

        if (state.eventMessage) {
            taskBox.textContent = state.eventMessage;
            taskBox.classList.add('event');
            return;
        }

        if (state.progress >= 100) {
            taskBox.textContent = 'Завдання готове! Натисни кнопку, щоб відправити його.';
            taskBox.classList.remove('warning', 'danger');
            return;
        }

        const timeHint = state.timeLeft <= 45 ? 'Поспішай!' : 'Продовжуй у тому ж темпі!';
        const focusHint = state.focus < 40 ? 'Фокус падає, зроби глибокий вдих.' : 'Фокус тримається.';
        taskBox.textContent = `Прогрес: ${state.progress}% • Фокус: ${Math.round(state.focus)}% • Час: ${formatTime(state.timeLeft)} • ${timeHint} ${focusHint}`;

        if (state.timeLeft <= 45 || state.focus <= 35) {
            taskBox.classList.add(state.timeLeft <= 25 ? 'danger' : 'warning');
        }
    };

    const updateUI = () => {
        updateMeters();
        updateThoughts();
        updateTaskBox();
    };

    const switchVideo = (src, loop = false) => {
        if (!videoPlayer) return;
        const desired = `assets/videos/${src}`;
        const current = videoPlayer.getAttribute('src');
        if (current === desired) {
            if (!state.isPaused) {
                videoPlayer.play().catch(() => {});
            }
            return;
        }

        videoPlayer.pause();
        videoPlayer.src = desired;
        videoPlayer.loop = loop;
        videoPlayer.currentTime = 0;
        const playVideo = () => {
            if (!state.isPaused) {
                videoPlayer.play().catch(() => {});
            }
            videoPlayer.removeEventListener('loadeddata', playVideo);
        };
        videoPlayer.addEventListener('loadeddata', playVideo);
    };

    // --- GAMEPLAY LOGIC ---
    const triggerPhoneDistraction = () => {
        state.isPhoneDistracted = true;
        state.isEventActive = true;
        state.phoneClicksRemaining = PHONE_ESCAPE_CLICKS;
        state.eventMessage = 'Ти заліз у телефон! Швидко клацай, щоб вирватись!';
        workButton.textContent = 'Тікай з телефона!';

        switchVideo('distraction.mp4');

        const escapeHandler = () => {
            if (!state.isPhoneDistracted) return;
            state.phoneClicksRemaining -= 1;
            if (state.phoneClicksRemaining <= 0) {
                state.phoneClicksRemaining = 0;
                state.focus = clamp(state.focus + 22, 0, 100);
                state.isPhoneDistracted = false;
                state.isEventActive = false;
                state.eventMessage = null;
                workButton.disabled = state.progress >= 100 || state.isPaused;
                workButton.textContent = 'Працювати (натискай!)';
                workButton.onclick = null;
                switchVideo('idle.mp4', true);
            } else {
                state.eventMessage = `Телефон тримає! Залишилось кліків: ${state.phoneClicksRemaining}`;
            }
            updateUI();
        };

        workButton.onclick = escapeHandler;
        updateUI();
    };

    const triggerRandomEvent = () => {
        if (state.isEventActive || state.isWorking || state.isPaused) return;

        const events = [
            {
                text: 'Кіт стрибнув на стіл і розкидав папірці! -10 секунд',
                video: 'distraction.mp4',
                duration: 4000,
                penalty: 10,
                focusLoss: 6,
            },
            {
                text: 'Друг надіслав рілз! Ти не можеш не подивитись... -15 секунд',
                video: 'distraction.mp4',
                duration: 5000,
                penalty: 15,
                focusLoss: 9,
            },
            {
                text: 'Сусідка-бабка стукає у двері: терміново потрібна сіль! -20 секунд',
                video: 'distraction.mp4',
                duration: 6000,
                penalty: 20,
                focusLoss: 12,
            },
            {
                text: 'Вийшла нова серія улюбленого аніме! -12 секунд',
                video: 'distraction.mp4',
                duration: 4500,
                penalty: 12,
                focusLoss: 7,
            },
            {
                text: 'Телефон розрядився! Пошуки зарядки забрали час... -8 секунд',
                video: 'distraction.mp4',
                duration: 3200,
                penalty: 8,
                focusLoss: 4,
            },
        ];

        const eventData = events[Math.floor(Math.random() * events.length)];
        state.isEventActive = true;
        state.eventMessage = eventData.text;
        workButton.disabled = true;

        state.timeLeft = clamp(state.timeLeft - eventData.penalty, 0, GAME_DURATION_SECONDS);
        state.focus = clamp(state.focus - eventData.focusLoss, 0, 100);
        switchVideo(eventData.video);
        updateUI();

        setTimeout(() => {
            switchVideo('idle.mp4', true);
            state.isEventActive = false;
            state.eventMessage = null;
            workButton.disabled = state.progress >= 100 || state.isPaused || state.isPhoneDistracted;
            updateUI();
        }, eventData.duration);
    };

    const endGame = (isWin) => {
        clearInterval(state.gameLoopInterval);
        state.gameLoopInterval = null;
        state.isEventActive = true;
        state.isPhoneDistracted = false;
        state.isWorking = false;
        state.isPaused = false;
        state.phoneClicksRemaining = 0;
        state.eventMessage = null;

        workButton.disabled = true;
        workButton.onclick = null;
        togglePauseVisibility(false);
        switchVideo('idle.mp4', true);
        updateUI();

        if (isWin) {
            endMessage.textContent = '🎉 Перемога! 🎉';
            endDetails.innerHTML = `
                <p>Денис встиг здати завдання за ${formatTime(GAME_DURATION_SECONDS - state.timeLeft)}.</p>
                <p>Він переміг свій мозок і довів, що дедлайни йому не страшні.</p>
                <p>Професор у захваті, а Денис заслужив відпочинок.</p>
            `;
        } else {
            endMessage.textContent = '💀 Дедлайн! 💀';
            endDetails.innerHTML = `
                <p>Денис не встиг... Завдання виконано лише на ${state.progress}%.</p>
                <p>Мозок переміг, відволікаючи котиками, рілзами та сусідами.</p>
                <p>Професор невдоволений, але шанс виправити ситуацію ще буде.</p>
            `;
        }

        endScreen.classList.remove('hidden');
    };

    const gameLoop = () => {
        if (state.isPaused) {
            updateUI();
            return;
        }

        state.timeLeft -= 1;
        if (!state.isPhoneDistracted) {
            state.focus = clamp(state.focus - FOCUS_DECAY_RATE, 0, 100);
            if (state.focus <= PHONE_DISTRACTION_THRESHOLD && Math.random() < 0.35) {
                triggerPhoneDistraction();
            }
        } else {
            state.focus = clamp(state.focus + FOCUS_RECOVERY_RATE, 0, 100);
        }

        updateUI();

        if (state.timeLeft <= 0) {
            endGame(false);
            return;
        }

        if (!state.isPhoneDistracted && Math.random() < EVENT_CHANCE_PER_SECOND) {
            triggerRandomEvent();
        }
    };

    const resetGameState = () => {
        state.progress = 0;
        state.timeLeft = GAME_DURATION_SECONDS;
        state.focus = 100;
        state.isEventActive = false;
        state.isWorking = false;
        state.isPhoneDistracted = false;
        state.isPaused = false;
        state.phoneClicksRemaining = 0;
        state.eventMessage = null;

        workButton.disabled = false;
        workButton.textContent = 'Працювати (натискай!)';
        workButton.onclick = null;
        pauseButton.disabled = false;
        pauseButton.classList.remove('paused');

        endScreen.classList.add('hidden');
        gameShell.classList.remove('hidden');

        switchVideo('idle.mp4', true);
        updateUI();
    };

    const startNewRun = () => {
        resetGameState();
        if (state.gameLoopInterval) {
            clearInterval(state.gameLoopInterval);
        }
        state.gameLoopInterval = setInterval(gameLoop, 1000);
        togglePauseVisibility(true);
    };

    // --- EVENT LISTENERS ---
    workButton.addEventListener('click', () => {
        if (state.isEventActive || state.isPhoneDistracted || state.isPaused) return;

        let progressGain = PROGRESS_PER_CLICK;
        if (state.focus < 30) {
            progressGain = Math.max(1, Math.round(PROGRESS_PER_CLICK * 0.35));
        } else if (state.focus < 60) {
            progressGain = Math.max(1, Math.round(PROGRESS_PER_CLICK * 0.65));
        }

        state.progress = clamp(state.progress + progressGain, 0, 100);
        state.focus = clamp(state.focus - FOCUS_CLICK_PENALTY, 0, 100);
        updateUI();

        if (state.progress >= 100) {
            endGame(true);
            return;
        }

        if (!state.isWorking) {
            state.isWorking = true;
            switchVideo('working.mp4');
            videoPlayer.onended = () => {
                switchVideo('idle.mp4', true);
                state.isWorking = false;
                videoPlayer.onended = null;
            };
        }
    });

    startButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        gameShell.classList.remove('hidden');
        startNewRun();
    });

    restartButton.addEventListener('click', () => {
        startNewRun();
    });

    pauseButton.addEventListener('click', () => {
        setPause(!state.isPaused);
    });

    document.addEventListener('visibilitychange', () => {
        const gameRunning = startScreen.classList.contains('hidden') && endScreen.classList.contains('hidden');
        if (document.hidden && gameRunning) {
            setPause(true);
        }
    });

    videoPlayer?.addEventListener('error', (error) => {
        // eslint-disable-next-line no-console
        console.error('Помилка завантаження відео:', error);
    });

    // Ініціалізуємо UI при завантаженні
    updateUI();
});