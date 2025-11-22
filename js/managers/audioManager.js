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
    }

    playBackground(trackId) {
        const source = this.resolvePath(trackId, 'background');
        if (!source) return;

        if (!this.backgroundAudio) {
            this.backgroundAudio = new Audio();
            this.backgroundAudio.loop = true;
        }

        if (this.backgroundAudio.getAttribute('src') === source) {
            this.backgroundAudio.volume = this.getVolume('background');
            this.backgroundAudio.play().catch(() => {});
            return;
        }

        this.backgroundAudio.pause();
        this.backgroundAudio.src = source;
        this.backgroundAudio.volume = this.getVolume('background');
        this.backgroundAudio.load();
        this.backgroundAudio.play().catch(() => {});
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
}
