import {
    getState,
    setEventActive,
    setEventMessage,
    addEventEpilogue,
    setActiveEffectsDescription,
} from '../state/gameState.js';
import { getElement, updateUI } from '../ui/uiManager.js';
import { randomElement } from '../utils/helpers.js';
import { applyEffects, getEffectsDescription } from '../game/effectsManager.js';
import { startEvent, registerEventHooks, playEventOutcome } from '../game/eventSystem.js';
import { buildChallenge, CHALLENGE_DEFS } from '../config/challenges.js';

const EFFECT_MESSAGE_TIMEOUT = 10000;

export class EventManager {
    constructor({ timerManager, progressManager, audioManager, inputHandler } = {}) {
        this.timerManager = timerManager;
        this.progressManager = progressManager;
        this.audioManager = audioManager;
        this.inputHandler = inputHandler;

        this.storyEvents = new Map();
        this.availableStoryIds = [];
        this.challengeIds = Object.keys(CHALLENGE_DEFS);
        this.lastEventTimestamp = 0;
        this.cooldownMs = 15000;
        this.pendingOutcome = null;
        this.effectsTimeout = null;
        this.challengePenaltyTimeout = null;
        this.analytics = null;
        this.onProgressCompletion = null;
        this.assetCache = new Map();

        registerEventHooks({
            onChoiceSelected: (eventData, choice, index) => this.handleEventChoice(eventData, index),
            onQteResolved: (eventData, success, outcome) => this.handleQteResolved(eventData, success, outcome),
            onOutcomeComplete: (eventData, outcome) => this.handleOutcomeComplete(eventData, outcome),
        });
    }

    attachAnalytics(analytics) {
        this.analytics = analytics;
    }

    setProgressCompletionHandler(handler) {
        this.onProgressCompletion = handler;
    }

    async loadEventsFromJson(url = 'assets/events.json') {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Cannot load events.json');
        const data = await response.json();
        this.storyEvents.clear();

        const events = data.events || [];
        const validations = await Promise.all(events.map(async (eventDef) => {
            const hasMedia = await this.verifyEventAssets(eventDef);
            return { eventDef, hasMedia };
        }));

        validations.forEach(({ eventDef, hasMedia }) => {
            if (hasMedia) {
                this.registerEvent(eventDef);
            } else {
                console.warn(`[EventManager] Пропускаю подію "${eventDef?.id ?? 'unknown'}" — відсутні відеофайли.`);
            }
        });

        this.resetStoryPool();
        this.resetCooldown();
        return this.storyEvents.size;
    }

    registerEvent(eventDef) {
        if (!eventDef?.id) return;
        this.storyEvents.set(eventDef.id, eventDef);
    }

    resetStoryPool() {
        this.availableStoryIds = Array.from(this.storyEvents.keys());
    }

    resetCooldown() {
        this.lastEventTimestamp = Date.now() - this.cooldownMs;
    }

    triggerRandomEvent(forceType = null) {
        const now = Date.now();
        if (now - this.lastEventTimestamp < this.cooldownMs) {
            return false;
        }

        const state = getState();
        if (state.isEventActive || state.isPhoneDistracted || state.isPaused) {
            return false;
        }

        const probability = this.calculateProbability(state);
        if (!forceType && Math.random() > probability) {
            return false;
        }

        const runChallenge = forceType === 'challenge' ? true : Math.random() < 0.35;

        if (runChallenge && this.challengeIds.length) {
            this.launchChallengeEvent();
            return true;
        }

        const event = this.pickStoryEvent();
        if (!event) {
            return false;
        }

        startEvent(event);
        this.logAnalytics('event_triggered', { eventId: event.id, type: event.type });
        return true;
    }

    calculateProbability(state) {
        const base = 0.08;
        const progressBoost = Math.min(0.15, state.progress / 900);
        const focusPenalty = state.focus < 35 ? 0.06 : 0;
        return Math.min(0.3, base + progressBoost + focusPenalty);
    }

    pickStoryEvent() {
        if (!this.availableStoryIds.length) {
            this.resetStoryPool();
        }
        if (!this.availableStoryIds.length) return null;
        const id = randomElement(this.availableStoryIds);
        this.availableStoryIds = this.availableStoryIds.filter((item) => item !== id);
        return this.storyEvents.get(id);
    }

    handleEventChoice(eventData, choiceIndex) {
        if (!eventData?.choices) {
            return false;
        }
        const choice = eventData.choices[choiceIndex];
        if (!choice) {
            return false;
        }
        this.pendingOutcome = { eventId: eventData.id, outcome: choice.outcome };
        playEventOutcome(choice.outcome);
        this.logAnalytics('choice_made', { eventId: eventData.id, choiceIndex });
        return true;
    }

    handleQteResolved(eventData, success, outcome) {
        if (!eventData) return false;
        this.pendingOutcome = { eventId: eventData.id, outcome };
        playEventOutcome(outcome);
        this.logAnalytics('qte_result', { eventId: eventData.id, success });
        return true;
    }

    handleOutcomeComplete(eventData, outcome) {
        if (!outcome) return;
        if (outcome.effects) {
            applyEffects(outcome.effects);
            const desc = getEffectsDescription(outcome.effects);
            setActiveEffectsDescription(desc);
            clearTimeout(this.effectsTimeout);
            this.effectsTimeout = setTimeout(() => {
                setActiveEffectsDescription(null);
            }, EFFECT_MESSAGE_TIMEOUT);
        }

        if (outcome.sound && this.audioManager) {
            this.audioManager.playSFX(outcome.sound);
        }

        if (outcome.epilogueTexts?.length) {
            const epilogue = randomElement(outcome.epilogueTexts);
            addEventEpilogue(eventData.title, epilogue);
        }

        updateUI();
        this.logAnalytics('event_outcome', { eventId: eventData?.id, outcome: outcome?.id || outcome?.video });
        this.pendingOutcome = null;
        this.markEventCooldown();

        if (getState().progress >= 100 && this.onProgressCompletion) {
            this.onProgressCompletion();
        }
    }

    launchChallengeEvent() {
        if (!this.inputHandler) {
            return;
        }

        const challengeId = randomElement(this.challengeIds);
        const challenge = buildChallenge(challengeId);
        if (!challenge) return;

        setEventActive(true);
        setEventMessage('Міні-випробування! Завершуй швидше.');
        const workButton = getElement('workButton');
        if (workButton) {
            workButton.disabled = true;
        }
        updateUI();
        this.logAnalytics('event_triggered', { eventId: challengeId, type: 'challenge' });

        this.inputHandler
            .startMiniChallenge(challenge)
            .then((result) => {
                this.resolveChallengeResult(result, challengeId);
            })
            .catch((error) => {
                console.warn('Challenge interrupted', error);
                this.resolveChallengeResult({ success: false }, challengeId);
            });
    }

    resolveChallengeResult(result, challengeId) {
        setEventActive(false);
        setEventMessage(null);
        if (this.challengePenaltyTimeout) {
            clearTimeout(this.challengePenaltyTimeout);
            this.challengePenaltyTimeout = null;
        }
        const workButton = getElement('workButton');
        if (workButton) {
            const state = getState();
            workButton.disabled = state.progress >= 100 || state.isPaused || state.workDisabled;
        }

        if (result?.progressAdjustment && this.progressManager) {
            if (result.success) {
                this.progressManager.increaseProgress(result.progressAdjustment);
            } else {
                this.progressManager.decreaseProgress(result.progressAdjustment);
            }
        }

        if (result?.timePenalty && this.timerManager) {
            this.timerManager.applyTimePenalty(result.timePenalty);
        }

        if (!result?.success) {
            const punishmentText = this.buildChallengePunishmentText(result);
            if (punishmentText) {
                setEventMessage(punishmentText);
                updateUI();
                this.challengePenaltyTimeout = setTimeout(() => {
                    setEventMessage(null);
                    updateUI();
                    this.challengePenaltyTimeout = null;
                }, 2500);
            }
        }

        updateUI();
        this.logAnalytics('challenge_result', { challengeId, success: result?.success });
        this.markEventCooldown();

        if (getState().progress >= 100 && this.onProgressCompletion) {
            this.onProgressCompletion();
        }
    }

    buildChallengePunishmentText(result) {
        const chunks = [];
        if (result?.timePenalty) {
            chunks.push(`-${result.timePenalty}с часу`);
        }
        if (result?.progressAdjustment) {
            chunks.push(`-${result.progressAdjustment}% прогресу`);
        }
        if (!chunks.length) {
            return 'Провал міні-випробування! Мозок знову святкує.';
        }
        return `Провал міні-випробування: ${chunks.join(' + ')}`;
    }

    logAnalytics(event, payload = {}) {
        if (this.analytics) {
            this.analytics.log(event, payload);
        }
    }

    startStoryEventById(eventId) {
        const event = this.storyEvents.get(eventId);
        if (!event) return false;
        startEvent(event);
        this.logAnalytics('event_triggered', { eventId, type: event.type, forced: true });
        return true;
    }

    markEventCooldown() {
        this.lastEventTimestamp = Date.now();
    }

    async verifyEventAssets(eventDef) {
        if (!eventDef?.mainVideo) {
            return false;
        }

        const videoFiles = new Set();
        const collectOutcome = (outcome) => {
            if (outcome?.video) {
                videoFiles.add(this.getEventVideoPath(outcome.video));
            }
        };

        videoFiles.add(this.getEventVideoPath(eventDef.mainVideo));
        if (eventDef.loopVideo) {
            videoFiles.add(this.getEventVideoPath(eventDef.loopVideo));
        }

        if (Array.isArray(eventDef.choices)) {
            eventDef.choices.forEach((choice) => collectOutcome(choice?.outcome));
        }

        collectOutcome(eventDef.successOutcome);
        collectOutcome(eventDef.failureOutcome);

        if (videoFiles.size === 0) {
            return false;
        }

        const results = await Promise.all([...videoFiles].map((path) => this.checkAssetExists(path)));
        return results.every(Boolean);
    }

    getEventVideoPath(fileName) {
        return `assets/videos/events/${fileName}`;
    }

    async checkAssetExists(path) {
        if (this.assetCache.has(path)) {
            return this.assetCache.get(path);
        }

        try {
            let response = await fetch(path, { method: 'HEAD' });

            if (!response.ok && response.status === 405) {
                response = await fetch(path, { method: 'GET', cache: 'no-store' });
            }

            const ok = response.ok;
            this.assetCache.set(path, ok);
            return ok;
        } catch (error) {
            console.warn(`[EventManager] Відео не знайдено: ${path}`, error);
            this.assetCache.set(path, false);
            return false;
        }
    }
}
