import { isPaused } from '../state/gameState.js';

class VideoManager {
    constructor() {
        this.player = null;
        this.fallbackElement = null;
        this.activeClip = '';
        this.pendingOnEnd = null;
        this.boundOnEnded = () => this.invokeOnEnd();
        this.boundOnError = () => this.handleVideoError();
    }

    init(player, fallbackElement) {
        this.player = player;
        this.fallbackElement = fallbackElement;
        if (this.player) {
            this.player.addEventListener('error', this.boundOnError);
            this.player.addEventListener('ended', this.boundOnEnded);
        }
    }

    playVideoClip(clipId, options = {}) {
        if (!this.player) return;
        const { loop = false, mute = false, autoplay = true } = options;
        const source = this.resolvePath(clipId);

        this.hideFallback();
        this.player.loop = loop;
        this.player.muted = mute;

        if (!source) {
            this.handlePlaybackFailure('Кліп не знайдено');
            return;
        }

        if (this.activeClip === source) {
            if (!isPaused() && autoplay) {
                this.player.play().catch(() => this.showFallback('Не вдалось програти відео.'));
            }
            return;
        }

        this.activeClip = source;
        this.player.pause();
        this.player.src = source;
        this.player.currentTime = 0;

        const playWhenReady = () => {
            if (!isPaused() && autoplay) {
                this.player.play().catch(() => this.handlePlaybackFailure('Не вдалось програти відео.'));
            }
            this.player.removeEventListener('loadeddata', playWhenReady);
        };

        this.player.addEventListener('loadeddata', playWhenReady);
        this.player.load();
    }

    play() {
        if (this.player && !isPaused()) {
            this.player.play().catch(() => this.handlePlaybackFailure('Не вдалось програти відео.'));
        }
    }

    pause() {
        if (this.player) {
            this.player.pause();
        }
    }

    onVideoEnd(callback) {
        if (!this.player) return;
        this.pendingOnEnd = typeof callback === 'function' ? callback : null;
    }

    invokeOnEnd() {
        if (typeof this.pendingOnEnd === 'function') {
            const handler = this.pendingOnEnd;
            this.pendingOnEnd = null;
            handler();
        }
    }

    handleVideoError() {
        this.handlePlaybackFailure('Відео недоступне. Перевір файли.');
    }

    handlePlaybackFailure(message) {
        this.showFallback(message);
        setTimeout(() => this.invokeOnEnd(), 200);
    }

    resolvePath(clipId) {
        if (!clipId) return '';
        if (clipId.startsWith('assets/')) {
            return clipId;
        }
        return `assets/videos/${clipId}`;
    }

    showFallback(message) {
        if (this.fallbackElement) {
            this.fallbackElement.classList.remove('hidden');
            if (message) {
                this.fallbackElement.setAttribute('title', message);
            }
        }
    }

    hideFallback() {
        if (this.fallbackElement) {
            this.fallbackElement.classList.add('hidden');
        }
    }
}

let videoManagerInstance = null;

export const initVideoManager = (player, fallbackElement) => {
    videoManagerInstance = new VideoManager();
    videoManagerInstance.init(player, fallbackElement);
    return videoManagerInstance;
};

export const getVideoManager = () => videoManagerInstance?.player ?? null;

export const switchVideo = (src, loop = false) => {
    videoManagerInstance?.playVideoClip(src, { loop });
};

export const playVideo = () => {
    videoManagerInstance?.play();
};

export const pauseVideo = () => {
    videoManagerInstance?.pause();
};

export const onVideoEnd = (callback) => {
    videoManagerInstance?.onVideoEnd(callback);
};

export const getVideoPlayer = () => videoManagerInstance?.player ?? null;

export const getVideoManagerInstance = () => videoManagerInstance;