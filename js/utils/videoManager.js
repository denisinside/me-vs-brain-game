import { isPaused } from '../state/gameState.js';

let videoPlayer = null;

export const initVideoManager = (player) => {
    videoPlayer = player;
};

export const switchVideo = (src, loop = false) => {
    if (!videoPlayer) return;

    const desired = `assets/videos/${src}`;
    const current = videoPlayer.getAttribute('src');

    if (current === desired) {
        if (!isPaused()) {
            videoPlayer.play().catch(() => {});
        }
        return;
    }

    videoPlayer.pause();
    videoPlayer.src = desired;
    videoPlayer.loop = loop;
    videoPlayer.currentTime = 0;

    const playVideo = () => {
        if (!isPaused()) {
            videoPlayer.play().catch(() => {});
        }
        videoPlayer.removeEventListener('loadeddata', playVideo);
    };

    videoPlayer.addEventListener('loadeddata', playVideo);
};

export const playVideo = () => {
    if (videoPlayer && !isPaused()) {
        videoPlayer.play().catch(() => {});
    }
};

export const pauseVideo = () => {
    if (videoPlayer) {
        videoPlayer.pause();
    }
};

export const onVideoEnd = (callback) => {
    if (videoPlayer) {
        videoPlayer.onended = callback;
    }
};

export const getVideoPlayer = () => videoPlayer;