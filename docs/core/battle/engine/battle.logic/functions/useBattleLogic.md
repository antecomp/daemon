[**daemon**](../../../../../README.md)

***

# Function: useBattleLogic()

> **useBattleLogic**(`opponentData`, `debugMode?`, `startMeltAnimation?`, `cheatMode?`): [`BattleEngine`](../../battle.types/interfaces/BattleEngine.md)

Defined in: [src/core/battle/engine/battle.logic.ts:52](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.logic.ts#L52)

A hook that provides the core battle logic for a turn-based battle system.
It manages the state of the battle, including player and opponent actors, 
UI signals, and the execution of battle rounds. The hook also handles animations, 
status effects, and battle resolution.

## Parameters

### opponentData

[`DVOpponentData`](../../battle.types/interfaces/DVOpponentData.md)

The data for the opponent, including name and max health.

### debugMode?

`boolean`

Optional flag to enable debug mode, which skips animations and delays.

### startMeltAnimation?

[`MeltAnimationFn`](../../../../../shared/hooks/createMeltEffect/type-aliases/MeltAnimationFn.md)

### cheatMode?

`boolean`

Optional flag to enable chat mode, which attaches battle logic and data to `window` for use in console.

## Returns

[`BattleEngine`](../../battle.types/interfaces/BattleEngine.md)

An object containing the following:
- `playerMults`: Signal getter for the player's incoming and outgoing multipliers.
- `opponentMults`: Signal getter for the opponent's incoming and outgoing multipliers.
- `battleUIState`: Signal for the current state of the battle UI. Used for conditional rendering/locking UI.
- `setBattleUIState`: Signal setter for the battle UI state.
- `player`: The player actor object.
- `opponent`: The opponent actor object.
- `setupRound`: Function to initialize and set up a new round. Fetches opponent moves, updates the displayed hint, and resets the battle state.
- `executeRound`: Function to execute a battle round. Processes the player's selected sequence, evaluates the battle logic, and updates the state.
- `insight`: Signal for the current "hint" of the opponent's move sequence.
- `currentStatuses`: Object representing the current status icons for the player and opponent (used for UI visualization).
- `actionMessages`: Signal for the current action messages (flair text) displayed during the battle.
- `battleResultPromise`: A promise that resolves when the battle ends, indicating the outcome:
  - Resolves to `"player"` if the player wins (opponent dies).
  - Resolves to `"opponent"` if the opponent wins (player dies).
  - Resolves to `"draw"` if both the player and opponent die.
