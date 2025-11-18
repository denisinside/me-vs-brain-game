export class Analytics {
    constructor() {
        this.events = [];
    }

    log(eventName, payload = {}) {
        const entry = {
            name: eventName,
            payload,
            timestamp: Date.now(),
        };
        this.events.push(entry);
        if (typeof process !== 'undefined' ? process.env?.NODE_ENV !== 'production' : true) {
            console.debug('[Analytics]', entry);
        }
    }

    getEvents() {
        return [...this.events];
    }

    flush() {
        this.events = [];
    }
}
