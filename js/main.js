document.addEventListener('DOMContentLoaded', () => {
    // --- ОТРИМАННЯ ЕЛЕМЕНТІВ DOM ---
    const videoPlayer = document.getElementById('game-video');

    // Екрани
    const startScreen = document.getElementById('start-screen');
    const gameHud = document.getElementById('game-hud');
    const endScreen = document.getElementById('end-screen');

    // Кнопки
    const startButton = document.getElementById('start-button');
    const workButton = document.getElementById('work-button');
    const restartButton = document.getElementById('restart-button');

    // UI Елементи
    const timerDisplay = document.getElementById('timer-display');
    const progressDisplay = document.getElementById('progress-display');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const eventPopup = document.getElementById('event-popup');
    const eventText = document.getElementById('event-text');
    const endMessage = document.getElementById('end-message');
    const endDetails = document.getElementById('end-details');

    // --- НАЛАШТУВАННЯ ГРИ ---
    const GAME_DURATION_SECONDS = 180; // 3 хвилини
    const PROGRESS_PER_CLICK = 1; // % прогресу за один клік
    const EVENT_CHANCE_PER_SECOND = 0.05; // 10% шанс на подію кожну секунду
    const FOCUS_DECAY_RATE = 10; // Наскільки швидко зменшується фокус
    const FOCUS_RECOVERY_RATE = 20; // Наскільки швидко відновлюється фокус
    const PHONE_DISTRACTION_THRESHOLD = 20; // При якому рівні фокусу можна залізти в телефон

    // --- ЗМІННІ СТАНУ ГРИ ---
    let progress = 0;
    let timeLeft = GAME_DURATION_SECONDS;
    let focus = 100; // Новий показник фокусу (0-100)
    let gameLoopInterval = null;
    let isEventActive = false;
    let isWorking = false;
    let isPhoneDistracted = false; // Чи зараз студент в телефоні

    // --- ОСНОВНІ ФУНКЦІЇ ГРИ ---

    // Функція для перемикання відео
    function switchVideo(src, loop = false) {
        // *** ЗМІНА ***: Перевіряємо, чи не намагаємось ми запустити те саме відео
        // Це запобігає "миготінню" відео при повторному виклику
        const currentVideoName = videoPlayer.src.split('/').pop();
        if (currentVideoName === src) return;

        videoPlayer.src = `assets/videos/${src}`;
        videoPlayer.loop = loop;
        videoPlayer.play();
    }

    // Оновлення інтерфейсу (таймер, прогрес бар, фокус)
    function updateUI() {
        const minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        timerDisplay.textContent = `${minutes}:${seconds}`;

        progressDisplay.textContent = `${progress}%`;
        progressBarFill.style.width = `${progress}%`;

        // Оновлюємо показник фокусу
        const focusDisplay = document.getElementById('focus-display');
        const focusBar = document.getElementById('focus-bar-fill');
        if (focusDisplay) {
            focusDisplay.textContent = `${Math.round(focus)}%`;
        }
        if (focusBar) {
            focusBar.style.width = `${focus}%`;
        }

        // Змінюємо колір фокусу залежно від рівня
        if (focusBar) {
            if (focus > 60) {
                focusBar.style.backgroundColor = '#4CAF50'; // Зелений
            } else if (focus > 30) {
                focusBar.style.backgroundColor = '#FF9800'; // Помаранчевий
            } else {
                focusBar.style.backgroundColor = '#F44336'; // Червоний
            }
        }
    }

    // Відволікання на телефон
    function triggerPhoneDistraction() {
        isPhoneDistracted = true;
        isEventActive = true;
        workButton.disabled = true;
        workButton.textContent = "Вийди з телефона! (швидко клікай!)";
        
        eventText.textContent = "Ти заліз в телефон! Швидко клікай кнопку, щоб вийти!";
        eventPopup.classList.remove('hidden');
        
        switchVideo('distraction.mp4');
        
        // Потрібно швидко клікати, щоб вийти
        let clicksNeeded = 10;
        let clicksDone = 0;
        
        workButton.onclick = () => {
            clicksDone++;
            if (clicksDone >= clicksNeeded) {
                focus = Math.min(100, focus + 20); // Відновлюємо трохи фокусу
                isPhoneDistracted = false;
                isEventActive = false;
                workButton.disabled = false;
                workButton.textContent = "Працювати (натискай!)";
                workButton.onclick = null; // Очищуємо обробник
                eventPopup.classList.add('hidden');
                switchVideo('idle.mp4', true);
            } else {
                eventText.textContent = `Вийди з телефона! (${clicksNeeded - clicksDone} кліків залишилось)`;
            }
        };
    }

    // Запуск випадкової події
    function triggerRandomEvent() {
        if (isEventActive || isWorking) return; // Не запускати подію під час роботи

        const events = [
            { 
                text: "Кіт стрибнув на стіл і розкидав папірці! -10 секунд", 
                video: "distraction.mp4", 
                duration: 4000, 
                penalty: 10,
                focusLoss: 5
            },
            { 
                text: "Друг надіслав рілз! Ти не можеш не подивитись... -15 секунд", 
                video: "distraction.mp4", 
                duration: 5000, 
                penalty: 15,
                focusLoss: 8
            },
            { 
                text: "Сусідка-бабка стучить у двері! Вона хоче сіль... -20 секунд", 
                video: "distraction.mp4", 
                duration: 6000, 
                penalty: 20,
                focusLoss: 10
            },
            { 
                text: "З'явилось повідомлення про нову серію улюбленого серіалу! -12 секунд", 
                video: "distraction.mp4", 
                duration: 4500, 
                penalty: 12,
                focusLoss: 6
            },
            { 
                text: "Телефон розрядився! Ти встаєш за зарядкою і спотикаєшся... -8 секунд", 
                video: "distraction.mp4", 
                duration: 3000, 
                penalty: 8,
                focusLoss: 3
            }
        ];

        const eventData = events[Math.floor(Math.random() * events.length)];

        isEventActive = true;
        workButton.disabled = true;

        eventText.textContent = eventData.text;
        eventPopup.classList.remove('hidden');

        switchVideo(eventData.video);
        timeLeft -= eventData.penalty;
        focus -= eventData.focusLoss; // Втрачаємо фокус через подію
        if (timeLeft < 0) timeLeft = 0;
        if (focus < 0) focus = 0;

        setTimeout(() => {
            switchVideo('idle.mp4', true);
            eventPopup.classList.add('hidden');
            workButton.disabled = false;
            isEventActive = false;
            isWorking = false;
            updateUI();
        }, eventData.duration);
    }

    // Головний ігровий цикл (виконується кожну секунду)
    function gameLoop() {
        timeLeft--;
        
        // Логіка фокусу
        if (!isPhoneDistracted) {
            focus -= FOCUS_DECAY_RATE;
            if (focus < 0) focus = 0;
            
            // Перевіряємо, чи не потрібно залізти в телефон
            if (focus <= PHONE_DISTRACTION_THRESHOLD && Math.random() < 0.3) {
                triggerPhoneDistraction();
            }
        } else {
            // Відновлюємо фокус під час відволікання
            focus += FOCUS_RECOVERY_RATE;
            if (focus > 100) {
                focus = 100;
                isPhoneDistracted = false;
                workButton.disabled = false;
                workButton.textContent = "Працювати (натискай!)";
                switchVideo('idle.mp4', true);
            }
        }
        
        updateUI();

        if (timeLeft <= 0) {
            endGame(false);
            return;
        }

        if (Math.random() < EVENT_CHANCE_PER_SECOND && !isPhoneDistracted) {
            triggerRandomEvent();
        }
    }

    // Завершення гри
    function endGame(isWin) {
        clearInterval(gameLoopInterval);
        isEventActive = true;

        gameHud.classList.add('hidden');
        endScreen.classList.remove('hidden');

        if (isWin) {
            endMessage.textContent = "🎉 Перемога! 🎉";
            endDetails.innerHTML = `
                <p>Денис встиг здати завдання за ${Math.floor((GAME_DURATION_SECONDS - timeLeft) / 60)}:${String((GAME_DURATION_SECONDS - timeLeft) % 60).padStart(2, '0')}!</p>
                <p>Він переміг свій мозок і довів, що може зосередитись навіть в останню мить.</p>
                <p>Професор був вражений якістю роботи!</p>
            `;
            switchVideo('idle.mp4', true);
        } else {
            endMessage.textContent = "💀 Дедлайн! 💀";
            endDetails.innerHTML = `
                <p>Денис не встиг... Завдання виконано лише на ${progress}%.</p>
                <p>Його мозок переміг, відволікаючи на котиків, рілзи та бабку з сіллю.</p>
                <p>Професор розчарований, але Денис обіцяє наступного разу почати раніше.</p>
                <p>Або ні... 😅</p>
            `;
            switchVideo('idle.mp4', true);
        }
    }

    // --- ОБРОБНИКИ ПОДІЙ ---

    // *** ЗМІНА ***: Логіка кнопки "Працювати" повністю переписана
    workButton.addEventListener('click', () => {
        if (isEventActive || isPhoneDistracted) return; // Не можна працювати під час події або в телефоні

        // 1. Прогрес додається залежно від фокусу
        let progressGain = PROGRESS_PER_CLICK;
        if (focus < 30) {
            progressGain = Math.floor(PROGRESS_PER_CLICK * 0.3); // Дуже мало прогресу при низькому фокусі
        } else if (focus < 60) {
            progressGain = Math.floor(PROGRESS_PER_CLICK * 0.6); // Середній прогрес
        }
        
        progress += progressGain;
        if (progress > 100) progress = 100;
        
        // 2. Втрачаємо фокус при роботі (але менше, ніж при бездіяльності)
        focus -= 0.2;
        if (focus < 0) focus = 0;
        
        updateUI();

        // 3. Перевірка на перемогу
        if (progress >= 100) {
            endGame(true);
            return;
        }

        // 4. Запускаємо анімацію ТІЛЬКИ якщо вона ще не запущена
        if (!isWorking) {
            isWorking = true;
            switchVideo('working.mp4');

            // 5. Коли відео роботи закінчилось, повертаємось до стану спокою
            videoPlayer.onended = () => {
                switchVideo('idle.mp4', true);
                isWorking = false;
                // Очищуємо обробник, щоб він не спрацював для інших відео
                videoPlayer.onended = null;
            };
        }
    });

    // Початок гри
    startButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        gameHud.classList.remove('hidden');

        videoPlayer.muted = false;

        gameLoopInterval = setInterval(gameLoop, 1000);
        updateUI();
    });

    // Перезапуск гри
    restartButton.addEventListener('click', () => {
        progress = 0;
        timeLeft = GAME_DURATION_SECONDS;
        focus = 100; // Скидаємо фокус
        isEventActive = false;
        isWorking = false;
        isPhoneDistracted = false; // Скидаємо стан телефону

        endScreen.classList.add('hidden');
        gameHud.classList.remove('hidden');

        workButton.disabled = false;
        workButton.textContent = "Працювати (натискай!)";
        workButton.onclick = null; // Очищуємо обробник телефону

        gameLoopInterval = setInterval(gameLoop, 1000);
        updateUI();
        switchVideo('idle.mp4', true);
    });
});