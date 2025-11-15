#  Me-vs-brain-game — Опис проєкту

Цей проєкт — це міні-гра, що симулює робочий процес, рівень фокусу та відволікання користувача. Гравець керує продуктивністю персонажа, взаємодіє з інтерфейсом, уникає випадкових подій і намагається завершити завдання до завершення таймера.

---

## 📁 Структура проєкту
Project View content:
```
me-vs-brain-game
 assets
    ├──images
    ├──videos
 css
    ├──style.css
js/
    ├── main.js                 # Entry point, initialization
    ├── config/
    │   └── constants.js        # Game constants and configuration
    ├── state/
    │   └── gameState.js        # Centralized state management
    ├── utils/
    │   ├── helpers.js          # Utility functions (clamp, formatTime)
    │   └── videoManager.js     # Video playback management
    ├── ui/
    │   ├── uiManager.js        # Main UI update coordinator
    │   ├── meters.js           # Progress, focus, timer displays
    │   ├── thoughts.js         # Thought bubble updates
    │   └── taskBox.js          # Task box updates
    ├── game/
    │   ├── gameLoop.js         # Main game loop logic
    │   ├── events.js           # Random events system
    │   ├── phoneDistraction.js # Phone distraction mechanics
    │   ├── endGame.js          # Win/lose conditions
    │   └── powerups.js         # Powerups logic

    └── controllers/
        ├── buttonHandlers.js   # All button click handlers
        └── pauseManager.js     # Pause/resume logic
 index.html

```

🧩 Основні модулі

HTML

-   index.html — головний контейнер гри.

CSS

-   main.css, components.css, animations.css.

JS

-   Конфігурація, стан гри, утиліти, UI, геймплей і контролери.

🚀 Запуск

1.  Завантажте репозиторій.
2.  Відкрийте index.html.

📦 Вимоги

-   Сучасний браузер.
-   JavaScript увімкнено.
