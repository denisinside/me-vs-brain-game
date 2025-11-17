import {
    getState,
    setPhoneDistracted,
    setEventActive,
    setPhoneClicksRemaining,
    setEventMessage,
    decrementPhoneClicks,
    adjustFocus
} from '../state/gameState.js';
import { PHONE_ESCAPE_CLICKS, VIDEOS } from '../config/constants.js';
import { switchVideo } from '../utils/videoManager.js';
import { updateUI, getElement } from '../ui/uiManager.js';
import { randomElement } from '../utils/helpers.js';

let phoneMockupTimeout = null;

/**
 * List of TikTok video files
 */
const TIKTOK_VIDEOS = [
    'tiktok1.mp4', 'tiktok2.mp4', 'tiktok3.mp4', 'tiktok4.mp4', 'tiktok5.mp4',
    'tiktok6.mp4', 'tiktok7.mp4', 'tiktok8.mp4', 'tiktok9.MP4', 'tiktok10.mp4',
    'tiktok11.mp4', 'tiktok12.mp4', 'tiktok13.mp4', 'tiktok14.mp4', 'tiktok15.MP4',
    'tiktok16.mp4', 'tiktok17.mp4', 'tiktok18.mp4', 'tiktok19.mp4', 'tiktok20.mp4'
];

/**
 * Show phone mockup with random TikTok video
 */
const showPhoneMockup = () => {
    const phoneMockup = document.getElementById('phone-mockup');
    const phoneVideo = document.getElementById('phone-tiktok-video');
    
    if (!phoneMockup || !phoneVideo) {
        console.warn('Phone mockup elements not found');
        return;
    }

    // Select random TikTok video
    const randomVideo = randomElement(TIKTOK_VIDEOS);
    const videoPath = `assets/videos/tiktoks/${randomVideo}`;
    
    // Show mockup first
    phoneMockup.classList.remove('hidden');
    phoneMockup.style.display = 'block';
    phoneMockup.style.visibility = 'visible';
    phoneMockup.style.opacity = '1';
    
    console.log('Showing phone mockup with video:', videoPath);
    
    // Set video source and wait for it to load
    phoneVideo.src = videoPath;
    phoneVideo.volume = 0.7; // Set volume (0.7 = 70%)
    phoneVideo.load();
    
    // Play video when loaded
    phoneVideo.addEventListener('loadeddata', () => {
        phoneVideo.play().catch(err => {
            console.warn('Could not play TikTok video:', err);
        });
    }, { once: true });
    
    // Fallback: try to play immediately
    phoneVideo.play().catch(() => {
        // Will retry when loadeddata fires
    });
};

/**
 * Hide phone mockup
 */
const hidePhoneMockup = () => {
    const phoneMockup = document.getElementById('phone-mockup');
    const phoneVideo = document.getElementById('phone-tiktok-video');
    
    if (phoneMockup) {
        phoneMockup.classList.add('hidden');
        phoneMockup.style.display = 'none';
    }
    
    if (phoneVideo) {
        phoneVideo.pause();
        phoneVideo.src = '';
        phoneVideo.load(); // Reset video element
    }
    
    // Clear timeout if exists
    if (phoneMockupTimeout) {
        clearTimeout(phoneMockupTimeout);
        phoneMockupTimeout = null;
    }
};

export const triggerPhoneDistraction = () => {
    setPhoneDistracted(true);
    setEventActive(true);
    setPhoneClicksRemaining(PHONE_ESCAPE_CLICKS);
    setEventMessage('Ти заліз у телефон! Швидко клацай, щоб вирватись!');

    const workButton = getElement('workButton');
    if (workButton) {
        workButton.textContent = 'Тікай з телефона!';
        workButton.onclick = handlePhoneEscape;
        workButton.disabled = false; // Enable button for escape clicks
    }

    switchVideo(VIDEOS.DISTRACTION);
    
    // Show phone mockup after 2 seconds
    phoneMockupTimeout = setTimeout(() => {
        showPhoneMockup();
    }, 2000);
    
    updateUI();
};

/**
 * Handle click to escape from phone
 */
const handlePhoneEscape = () => {
    const state = getState();
    if (!state.isPhoneDistracted) return;

    decrementPhoneClicks();

    const clicksRemaining = state.phoneClicksRemaining;

    if (clicksRemaining <= 0) {
        endPhoneDistraction();
    } else {
        setEventMessage(`Телефон тримає! Залишилось кліків: ${clicksRemaining}`);
        updateUI();
    }
};

const endPhoneDistraction = () => {
    const state = getState();

    setPhoneClicksRemaining(0);
    adjustFocus(22); // Reward for escaping
    setPhoneDistracted(false);
    setEventActive(false);
    setEventMessage(null);

    // Hide phone mockup
    hidePhoneMockup();

    const workButton = getElement('workButton');
    if (workButton) {
        // Enable button if no blocking conditions are active
        workButton.disabled = state.progress >= 100 || state.isPaused || state.isEventActive || state.isPhoneDistracted || state.workDisabled;
        workButton.textContent = 'Працювати (натискай!)';
        workButton.onclick = null;
    }

    switchVideo(VIDEOS.IDLE, true);
    updateUI();
};