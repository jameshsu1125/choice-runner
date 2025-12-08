import EventBus, { EventListener } from "./event-bus.service";

export interface GameEventPayloads {
    [GameEvents.GAME_OVER]: { isVictory: boolean };
    [GameEvents.MOVES_EXHAUSTED]: void;

    [GameEvents.TURN_COMPLETED]: void;
    [GameEvents.PROJECTILE_COLLISION]: {
        damage: number;
        targetId: string;
        projectile: any;
    };
    [GameEvents.TOWER_DAMAGED]: {
        damage: number;
        previousHealth: number;
        currentHealth: number;
        towerId: string;
    };
    [GameEvents.TOWER_DESTROYED]: {
        towerId: string;
    };
    [GameEvents.ENEMY_DAMAGED]: {
        damage: number;
        previousHealth: number;
        currentHealth: number;
        enemyId: string;
    };
    [GameEvents.ENEMY_DESTROYED]: {
        enemyId: string;
    };
}
// Example usage with the existing game events:
// Define your events and payloads

export const GameEvents = {
    // Combat events
    // Game state events
    GAME_OVER: "game_over",
    MOVES_EXHAUSTED: "moves_exhausted",

    // Turn events
    TURN_COMPLETED: "turn_completed",

    // UI events
    // Collision events
    PROJECTILE_COLLISION: "projectile_collision",

    // Tower events
    TOWER_DAMAGED: "tower_damaged",
    TOWER_DESTROYED: "tower_destroyed",

    // Enemy events
    ENEMY_DAMAGED: "enemy_damaged",
    ENEMY_DESTROYED: "enemy_destroyed",
} as const;

export const gameEventBus = EventBus.getInstance<
    GameEventType,
    GameEventPayloads
>("game");

// Helper type to extract event names from GameEvents
type GameEventType = (typeof GameEvents)[keyof typeof GameEvents];

export function onGameEvent<K extends GameEventType>(
    eventType: K,
    listener: EventListener<GameEventPayloads[K]>
): () => void {
    return gameEventBus.on(eventType, listener);
}
// Helper functions for type-safe event emission and subscription

export function emitGameEvent<K extends GameEventType>(
    eventType: K,
    payload: GameEventPayloads[K]
): void {
    gameEventBus.emit(eventType, payload);
}

