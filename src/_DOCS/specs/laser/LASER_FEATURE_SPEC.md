# Laser Feature Specification

## Overview

Implement a laser system that triggers when matching 4+ tiles, dealing damage in a cross pattern.

## Trigger Condition

-   **Activation**: Match 4 or more tiles in a single move
-   **Generation**: One laser per qualifying match
-   **Center Position**: Calculated as center tile of matching group using floor operation

## Positioning Algorithm

```typescript
// Calculate center tile position from matching tile group
const centerRow = Math.floor(
    matchingTiles.reduce((sum, tile) => sum + tile.gridR, 0) /
        matchingTiles.length
);
const centerCol = Math.floor(
    matchingTiles.reduce((sum, tile) => sum + tile.gridC, 0) /
        matchingTiles.length
);

// Laser originates from this center position
const laserOrigin = { row: centerRow, col: centerCol };
```

## Damage Pattern

### X-Axis (Horizontal)

-   Destroys all tiles in the same row as the **center position**
-   Generates projectiles from each destroyed tile
-   Projectiles follow existing projectile system behavior

### Y-Axis (Vertical)

-   Destroys all tiles in the same column as the **center position**
-   Generates projectiles from each destroyed tile
-   **Tower Collision**: Laser beam hits towers directly for 50 damage

## Architecture Integration

### Components

-   **LaserEntity**: Data model and state management
-   **LaserComponent**: Visual representation and animations
-   **LaserManager**: CRUD operations and lifecycle
-   **LaserSystem**: Business logic and event handling

### Event Flow

1. `LASER_TRIGGERED` - When 4+ match detected
2. `LASER_CROSS_PATTERN_ACTIVATED` - Cross destruction begins
3. `LASER_TOWER_HIT` - Direct tower damage (Y-axis only)
4. `LASER_TILES_DESTROYED` - Tiles destroyed by laser
5. `LASER_PROJECTILES_GENERATED` - Projectiles created from destroyed tiles

### Damage Values

-   **Base Laser Damage**: 50 (configurable via GAME_LOGIC_CONFIGS)
-   **Tower Direct Hit**: 50 damage (Y-axis laser only)
-   **Tile Destruction**: Generates projectiles with existing damage values

## Integration Points

-   **GameBoardComponent**: Enhanced match detection
-   **CombatSystem**: Laser damage processing
-   **TurnSystem**: Laser processing in turn flow
-   **VisualEffectsSystem**: Laser animations and effects
-   **ServiceRegistry**: System registration

## Configuration

```typescript
laserDamage: {
    min: 1,
    max: 100,
    default: 50
}
```

