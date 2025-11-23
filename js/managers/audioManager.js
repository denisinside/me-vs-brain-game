import { AUDIO_TRACKS } from '../config/constants.js';

const clampVolume = (value) => Math.min(1, Math.max(0, value));

/**
 * AudioManager centralizes playback for background, SFX, and voice tracks.
 */
export class AudioManager {
    constructor() {
        this.backgroundAudio = null;
        this.groupVolume = {
            background: 0.5,
            sfx: 1.0,
            voice: 1.0,
        };
        this.muted = false;
        this.activeOneShots = new Set();
        this.currentBackgroundId = null;
        this.currentBackgroundSource = null;
        this.currentAmbientPhase = null;
        this.lastCalmIndex = -1;
        this.backgroundPauseReasons = new Set();
        this.isBackgroundDucked = false;
        this.fadeInterval = null;
    }

    async playBackground(trackId, { fadeDuration = 600 } = {}) {
        if (!trackId) return;
        const source = this.resolvePath(trackId, 'background');
        if (!source) return;

        if (!this.backgroundAudio) {
            this.backgroundAudio = new Audio();
            this.backgroundAudio.loop = true;
        }

        const isSameTrack = this.currentBackgroundSource === source;

        if (!isSameTrack) {
            if (!this.isBackgroundDucked && this.backgroundPauseReasons.size === 0) {
                await this.fadeBackgroundTo(0, Math.max(0, fadeDuration / 2));
            }
            this.backgroundAudio.pause();
            this.backgroundAudio.src = source;
            this.backgroundAudio.load();
            this.backgroundAudio.volume = 0;
            this.currentBackgroundId = trackId;
            this.currentBackgroundSource = source;
        }

        if (this.backgroundPauseReasons.size === 0) {
            if (this.backgroundAudio.paused) {
                try {
                    await this.backgroundAudio.play();
                } catch (_) {
                    // Autoplay policies might block playback; skip silently.
                }
            }

            if (!this.isBackgroundDucked) {
                await this.fadeBackgroundTo(this.getVolume('background'), fadeDuration);
            }
        }
    }

    async fadeBackgroundTo(targetVolume, duration = 400) {
        if (!this.backgroundAudio) return;
        const finalVolume = this.muted ? 0 : clampVolume(targetVolume);
        if (duration <= 0) {
            this.backgroundAudio.volume = finalVolume;
            return;
        }

        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }

        const startVolume = this.backgroundAudio.volume;
        const delta = finalVolume - startVolume;
        if (Math.abs(delta) < 0.001) {
            this.backgroundAudio.volume = finalVolume;
            return;
        }

        const steps = Math.max(1, Math.floor(duration / 40));
        let currentStep = 0;

        await new Promise((resolve) => {
            this.fadeInterval = setInterval(() => {
                currentStep += 1;
                const progress = Math.min(1, currentStep / steps);
                this.backgroundAudio.volume = clampVolume(startVolume + delta * progress);
                if (progress >= 1) {
                    clearInterval(this.fadeInterval);
                    this.fadeInterval = null;
                    resolve();
                }
            }, Math.max(16, duration / steps));
        });
    }

    async duckBackground(reason = 'event', fadeDuration = 400) {
        if (!this.backgroundAudio || !this.currentBackgroundSource) return;
        if (reason) {
            this.backgroundPauseReasons.add(reason);
        }
        if (this.isBackgroundDucked) return;
        this.isBackgroundDucked = true;
        await this.fadeBackgroundTo(0, fadeDuration);
        this.backgroundAudio.pause();
    }

    async unduckBackground(reason = 'event', fadeDuration = 400) {
        if (!this.backgroundAudio) return;
        if (reason) {
            this.backgroundPauseReasons.delete(reason);
        } else {
            this.backgroundPauseReasons.clear();
        }

        if (this.backgroundPauseReasons.size > 0 || this.currentBackgroundSource === null) {
            return;
        }

        this.isBackgroundDucked = false;
        if (this.backgroundAudio.paused) {
            this.backgroundAudio.volume = 0;
            try {
                await this.backgroundAudio.play();
            } catch (_) {
                return;
            }
        }

        await this.fadeBackgroundTo(this.getVolume('background'), fadeDuration);
    }

    async startCalmLoop(options = {}) {
        const track = this.pickCalmTrack();
        if (!track) return;
        this.currentAmbientPhase = 'calm';
        this.backgroundPauseReasons.clear();
        this.isBackgroundDucked = false;
        await this.playBackground(track, options);
    }

    async switchToDeadlineLoop(options = {}) {
        if (this.currentAmbientPhase === 'deadline') {
            return;
        }
        const track = this.getDeadlineTrack();
        if (!track) return;
        this.currentAmbientPhase = 'deadline';
        await this.playBackground(track, options);
    }

    async stopBackground({ fadeDuration = 400 } = {}) {
        if (!this.backgroundAudio) return;
        await this.fadeBackgroundTo(0, fadeDuration);
        this.backgroundAudio.pause();
        this.backgroundAudio.currentTime = 0;
        this.currentAmbientPhase = null;
        this.currentBackgroundId = null;
        this.currentBackgroundSource = null;
        this.backgroundPauseReasons.clear();
        this.isBackgroundDucked = false;
    }

    playSFX(sfxId) {
        this.playOneShot(sfxId, 'sfx');
    }

    playVoice(voiceId) {
        this.playOneShot(voiceId, 'voice');
    }

    playOneShot(id, group) {
        const source = this.resolvePath(id, group);
        if (!source) return;
        const audio = new Audio(source);
        audio.volume = this.getVolume(group);
        audio.play().catch(() => {});
        const tracker = { audio };
        this.activeOneShots.add(tracker);
        audio.addEventListener('ended', () => {
            this.activeOneShots.delete(tracker);
        });
    }

    setVolume(group, value) {
        this.groupVolume[group] = clampVolume(value);
        if (group === 'background' && this.backgroundAudio) {
            this.backgroundAudio.volume = this.getVolume('background');
        }
    }

    muteAll() {
        this.muted = true;
        if (this.backgroundAudio) {
            this.backgroundAudio.volume = 0;
        }
        this.activeOneShots.forEach(({ audio }) => {
            audio.volume = 0;
        });
    }

    unmuteAll() {
        this.muted = false;
        if (this.backgroundAudio) {
            this.backgroundAudio.volume = this.getVolume('background');
        }
    }

    resolvePath(id, group) {
        if (!id) return null;
        if (id.startsWith('assets/')) {
            return id;
        }

        if (id.includes('/')) {
            return `assets/audio/${id}`;
        }

        if (group === 'sfx' || group === 'voice') {
            return `assets/audio/events/${id}`;
        }

        return `assets/audio/${id}`;
    }

    getVolume(group) {
        if (this.muted) return 0;
        return this.groupVolume[group] ?? 1;
    }

    pickCalmTrack() {
        const pool = AUDIO_TRACKS?.CALM || [];
        if (!pool.length) return null;
        if (pool.length === 1) {
            this.lastCalmIndex = 0;
            return pool[0];
        }
        let nextIndex = Math.floor(Math.random() * pool.length);
        if (nextIndex === this.lastCalmIndex) {
            nextIndex = (nextIndex + 1) % pool.length;
        }
        this.lastCalmIndex = nextIndex;
        return pool[nextIndex];
    }

    getDeadlineTrack() {
        const pool = AUDIO_TRACKS?.DEADLINE || [];
        return pool[0] ?? null;
    }
}

let globalAudioManager = null;

export const setGlobalAudioManager = (manager) => {
    globalAudioManager = manager;
};

export const getGlobalAudioManager = () => globalAudioManager;
export const getAudioManager = () => globalAudioManager;
