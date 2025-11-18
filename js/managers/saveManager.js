const STORAGE_KEY = 'me-vs-brain:last-result';

export class SaveManager {
    constructor(storageKey = STORAGE_KEY) {
        this.storageKey = storageKey;
    }

    saveResult(playerState) {
        const payload = {
            ...playerState,
            timestamp: Date.now(),
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(payload));
        } catch (error) {
            console.warn('Cannot persist result to localStorage', error);
        }

        return this.mockApiRequest(payload);
    }

    loadLast() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.warn('Cannot read result from localStorage', error);
            return null;
        }
    }

    async mockApiRequest(payload) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ status: 'ok', payload });
            }, 400);
        });
    }
}
