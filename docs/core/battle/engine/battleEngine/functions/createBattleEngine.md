[**daemon**](../../../../../README.md)

***

# Function: createBattleEngine()

> **createBattleEngine**(`opponentAI`, `opponentStats`, `reactions`, `deps`): `object`

Defined in: [src/core/battle/engine/battleEngine.ts:39](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/engine/battleEngine.ts#L39)

Creates and initializes a new battle engine instance for handling turn-based combat between a player and an AI opponent.

## Parameters

### opponentAI

[`OpponentAI`](../../../ai/opponentAI.types/interfaces/OpponentAI.md)

The AI logic responsible for generating the opponent's move sequences and behaviors.

### opponentStats

[`OpponentStats`](../../../ai/opponentAI.types/interfaces/OpponentStats.md)

The statistics object describing the opponent's initial state (e.g., max health).

### reactions

[`BattleReactions`](../../../model/battleReactions/type-aliases/BattleReactions.md)

An object mapping battle events to arrays of asynchronous event handler functions.
                 - These 'reactions' fire (and block) at their associated battle stages and are provided information about battle state.
                 - Namely used to interweave animations into logic (@ref BattleEngineBridge)

### deps

[`BattleEngineDependencies`](../interfaces/BattleEngineDependencies.md) = `ENGINE_DEP_FALLBACK`

## Returns

An object containing methods and properties to control the battle flow:
  - `executeRound(playerPlan: PlannedSequence): Promise<void>`: Executes a round using the player's planned sequence of moves.
  - `setupRound(): Promise<void>`: Prepares the next round, generating the opponent's plan and emitting relevant events.
  - `handleBattleEnd(): void`: Forces a battle end state with a given outcome (namely used for "Eject")

### executeRound()

> **executeRound**: (`playerPlan`) => `Promise`\<`void`\>

Execute a round of the battle, given the players move sequence. Expects setupRound to have been run first.

#### Parameters

##### playerPlan

[`PlannedSequence`](../../../model/plannedMove/type-aliases/PlannedSequence.md)

#### Returns

`Promise`\<`void`\>

### handleBattleEnd()

> **handleBattleEnd**: (`outcome`) => `Promise`\<`void`\>

Prematurely end a round with a provided resolution. Should only ever be executed when *not* in the middle of an execution.

#### Parameters

##### outcome

[`BattleOutcome`](../../../model/battle/enumerations/BattleOutcome.md)

#### Returns

`Promise`\<`void`\>

### setupRound()

> **setupRound**: () => `Promise`\<`void`\>

Generates a new sequence for the opponent, emits round start signals (which can be listened to for setting dependant state)

#### Returns

`Promise`\<`void`\>

## Remarks

The engine manages combatants, move execution, event emission, and battle resolution. Consumers should call `setupRound` before each round and `executeRound` with the player's moves. The engine emits events at key points for UI updates or logging.
