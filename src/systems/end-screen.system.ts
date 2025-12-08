import {
    emitGameEvent,
    GameEvents,
    onGameEvent,
} from "../services/event-bus/events.constants";

export default class EndScreenSystem {
    private eventUnsubscribers: Array<() => void> = [];

    constructor() {}

    public initialize(): void {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const unsubTurnComplete = onGameEvent(GameEvents.TURN_COMPLETED, () => {
            this.checkGameEndConditions();
        });

        const unsubTowerDamaged = onGameEvent(GameEvents.TOWER_DAMAGED, () => {
            this.checkGameEndConditions();
        });

        const unsubMovesExhausted = onGameEvent(
            GameEvents.MOVES_EXHAUSTED,
            () => {
                emitGameEvent(GameEvents.GAME_OVER, { isVictory: false });
            }
        );

        this.eventUnsubscribers.push(
            unsubTurnComplete,
            unsubTowerDamaged,
            unsubMovesExhausted
        );
    }

    private checkGameEndConditions(): void {
        emitGameEvent(GameEvents.GAME_OVER, { isVictory: true });
    }
}

