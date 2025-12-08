import GUI from "lil-gui";
import {
    GAME_MECHANIC_CONFIG_SCHEMA,
    GAME_MECHANIC_CONSTANTS,
} from "../configs/constants/game-mechanic/game-mechanic.constants";
import ServiceLocator from "./service-locator/service-locator.service";
import SceneLayoutManager from "../managers/layout/scene-layout.manager";

export class DebugService {
    private static instance: DebugService;
    private gui?: GUI;
    private scene?: Phaser.Scene;
    private isDebugMode = false;
    private updateTimer?: Phaser.Time.TimerEvent;

    private debugSettings = {
        playerCount: 1,
        weaponLevel: 1,
        enemySpeed: GAME_MECHANIC_CONFIG_SCHEMA.enemySpeed.default,
        maxPlayers: () => {
            this.maximizePlayerCount();
        },
        maxWeapon: () => {
            this.maximizeWeaponLevel();
        },
        maxAll: () => {
            this.maximizeAll();
        },
    };

    private constructor() {}

    public static getInstance(): DebugService {
        if (!DebugService.instance) {
            DebugService.instance = new DebugService();
        }
        return DebugService.instance;
    }

    public initialize(scene: Phaser.Scene): void {
        this.scene = scene;
        this.isDebugMode = false;

        // Auto-launch debug panel if flag_debug is set in localStorage
        if (this.hasDebugFlag()) {
            console.log("Debug flag detected, auto-launching debug panel...");
            // Delay to ensure scene is fully initialized
            this.scene.time.delayedCall(100, () => {
                this.showDebugPanel();
            });
        }
    }

    /**
     * Check if flag_debug exists in localStorage and has any value
     */
    private hasDebugFlag(): boolean {
        try {
            const value = localStorage.getItem("flag_debug");
            // Accept any non-empty value
            return Boolean(value);
        } catch (error) {
            console.error("Failed to read debug flag:", error);
            return false;
        }
    }

    public showDebugPanel(): void {
        if (!this.scene) {
            console.error("DebugService: Scene not initialized");
            return;
        }

        if (this.gui) {
            this.gui.show();
            // Restart timer if it was removed when hidden
            if (!this.updateTimer) {
                this.updateTimer = this.scene.time.addEvent({
                    delay: 500,
                    callback: this.updateDisplayValues,
                    callbackScope: this,
                    loop: true,
                });
            }
            return;
        }

        // Create lil-gui panel
        this.gui = new GUI({ title: "Debug Panel", width: 300 });

        // Info folder
        const infoFolder = this.gui.addFolder("Game Info");
        infoFolder
            .add(this.debugSettings, "playerCount")
            .name("Current Players")
            .disable()
            .listen();
        infoFolder
            .add(this.debugSettings, "weaponLevel", 1, 2, 1)
            .name("Current Weapon Level")
            .disable()
            .listen();
        infoFolder
            .add(
                this.debugSettings,
                "enemySpeed",
                GAME_MECHANIC_CONFIG_SCHEMA.enemySpeed.min,
                GAME_MECHANIC_CONFIG_SCHEMA.enemySpeed.max,
                100
            )
            .name("Enemy Speed (Duration)")
            .onChange((value: number) => {
                this.setEnemySpeed(value);
            })
            .listen();
        infoFolder.open();

        // Controls folder
        const controlsFolder = this.gui.addFolder("Quick Actions");
        controlsFolder.add(this.debugSettings, "maxPlayers").name("Max Players");
        controlsFolder.add(this.debugSettings, "maxWeapon").name("Max Weapon");
        controlsFolder.add(this.debugSettings, "maxAll").name("MAXIMIZE ALL");
        controlsFolder.open();

        // Manual controls folder
        const manualFolder = this.gui.addFolder("Manual Controls");
        manualFolder
            .add({ players: 1 }, "players", 1, 20, 1)
            .name("Set Player Count")
            .onChange((value: number) => {
                this.setPlayerCount(value);
            });
        manualFolder
            .add({ level: 1 }, "level", 1, 2, 1)
            .name("Set Weapon Level")
            .onChange((value: number) => {
                this.setWeaponLevel(value);
            });
        manualFolder.close();

        // Update display values
        this.updateDisplayValues();

        // Auto-update values every 500ms using Phaser's timer (tied to scene lifecycle)
        this.updateTimer = this.scene.time.addEvent({
            delay: 500,
            callback: this.updateDisplayValues,
            callbackScope: this,
            loop: true,
        });

        console.log("Debug panel is now visible!");
    }

    public hideDebugPanel(): void {
        if (this.gui) {
            this.gui.hide();
        }
        // Clean up timer when hiding panel
        if (this.updateTimer) {
            this.updateTimer.remove();
            this.updateTimer = undefined;
        }
    }

    public destroy(): void {
        // Clean up resources
        if (this.updateTimer) {
            this.updateTimer.remove();
            this.updateTimer = undefined;
        }
        if (this.gui) {
            this.gui.destroy();
            this.gui = undefined;
        }
    }

    private updateDisplayValues(): void {
        try {
            const gameAreaManager = ServiceLocator.get<SceneLayoutManager>("gameAreaManager");
            const playerComponent = gameAreaManager.layoutContainers.player;
            const firepowerComponent = gameAreaManager.layoutContainers.firepower;

            if (playerComponent) {
                this.debugSettings.playerCount = playerComponent.players.length;
            }

            if (firepowerComponent) {
                this.debugSettings.weaponLevel = firepowerComponent.level;
            }

            this.debugSettings.enemySpeed = GAME_MECHANIC_CONSTANTS.enemySpeed;
        } catch (error) {
            // Silently fail if managers not ready yet
        }
    }

    private maximizeAll(): void {
        if (!this.scene) {
            console.error("DebugService: Scene not initialized");
            return;
        }

        this.isDebugMode = true;

        this.maximizePlayerCount();
        this.maximizeWeaponLevel();

        console.log("Debug Mode Activated!");
        console.log(
            `- Player count maximized to: ${GAME_MECHANIC_CONFIG_SCHEMA.playerReinforce.max}`
        );
        console.log(`- Weapon level upgraded to: 2 (maximum)`);
    }

    private maximizePlayerCount(): void {
        try {
            const gameAreaManager = ServiceLocator.get<SceneLayoutManager>("gameAreaManager");
            const playerComponent = gameAreaManager.layoutContainers.player;

            if (playerComponent) {
                const maxPlayers = GAME_MECHANIC_CONFIG_SCHEMA.playerReinforce.max;
                const currentCount = playerComponent.players.length;
                const playersToAdd = maxPlayers - currentCount;

                if (playersToAdd > 0) {
                    playerComponent.increasePlayersCount(playersToAdd);
                    console.log(`Added ${playersToAdd} players (${currentCount} → ${maxPlayers})`);
                } else {
                    console.log(`Player count already at maximum: ${maxPlayers}`);
                }
            }
        } catch (error) {
            console.error("Failed to maximize player count:", error);
        }
    }

    private maximizeWeaponLevel(): void {
        try {
            const gameAreaManager = ServiceLocator.get<SceneLayoutManager>("gameAreaManager");
            const firepowerComponent = gameAreaManager.layoutContainers.firepower;

            if (firepowerComponent) {
                const currentLevel = firepowerComponent.level;
                const maxLevel = 2;

                if (currentLevel < maxLevel) {
                    firepowerComponent.level = maxLevel;
                    console.log(`Weapon level upgraded: ${currentLevel} → ${maxLevel}`);
                } else {
                    console.log(`Weapon already at maximum level: ${maxLevel}`);
                }
            }
        } catch (error) {
            console.error("Failed to maximize weapon level:", error);
        }
    }

    private setPlayerCount(targetCount: number): void {
        try {
            const gameAreaManager = ServiceLocator.get<SceneLayoutManager>("gameAreaManager");
            const playerComponent = gameAreaManager.layoutContainers.player;

            if (playerComponent) {
                const currentCount = playerComponent.players.length;
                const difference = targetCount - currentCount;

                if (difference !== 0) {
                    playerComponent.increasePlayersCount(difference);
                    console.log(`Player count set to: ${targetCount}`);
                }
            }
        } catch (error) {
            console.error("Failed to set player count:", error);
        }
    }

    private setWeaponLevel(level: number): void {
        try {
            const gameAreaManager = ServiceLocator.get<SceneLayoutManager>("gameAreaManager");
            const firepowerComponent = gameAreaManager.layoutContainers.firepower;

            if (firepowerComponent) {
                firepowerComponent.level = level;
                console.log(`Weapon level set to: ${level}`);
            }
        } catch (error) {
            console.error("Failed to set weapon level:", error);
        }
    }

    private setEnemySpeed(duration: number): void {
        try {
            const oldDuration = GAME_MECHANIC_CONSTANTS.enemySpeed;

            GAME_MECHANIC_CONSTANTS.enemySpeed = duration;
            this.debugSettings.enemySpeed = duration;

            // Adjust existing game objects' positions to prevent jumps
            try {
                const gameAreaManager = ServiceLocator.get<SceneLayoutManager>("gameAreaManager");
                const { enemy, gate, supplement, finishLine } = gameAreaManager.layoutContainers;

                if (this.scene) {
                    const currentTime = this.scene.time.now;

                    // Adjust all components that use duration
                    enemy?.adjustSpeedChange(currentTime, oldDuration, duration);
                    gate?.adjustSpeedChange(currentTime, oldDuration, duration);
                    supplement?.adjustSpeedChange(currentTime, oldDuration, duration);
                    finishLine?.adjustSpeedChange(currentTime, oldDuration, duration);

                    console.log(
                        `Enemy speed adjusted: ${oldDuration} → ${duration} (all game objects repositioned)`
                    );
                } else {
                    console.log(`Enemy speed set to: ${duration} (will apply to new game objects)`);
                }
            } catch (adjustError) {
                console.log(`Enemy speed set to: ${duration} (game objects not yet initialized)`);
            }
        } catch (error) {
            console.error("Failed to set enemy speed:", error);
        }
    }

    public getIsDebugMode(): boolean {
        return this.isDebugMode;
    }
}

// Expose debug functions to window
declare global {
    interface Window {
        debug: () => void;
        hideDebug: () => void;
    }
}

// Register global debug functions
window.debug = () => {
    const debugService = DebugService.getInstance();
    debugService.showDebugPanel();
};

window.hideDebug = () => {
    const debugService = DebugService.getInstance();
    debugService.hideDebugPanel();
};
