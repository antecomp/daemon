[**daemon**](../../../../../README.md)

***

# Interface: BattleEngine

Defined in: [src/core/battle/engine/battle.types.ts:93](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L93)

Interface representing the core battle engine for managing and executing battle logic.
Provides signals, state management, and core methods for handling battle rounds and outcomes.

This is what is provided by useBattleLogic.

## Properties

### actionMessages

> **actionMessages**: `Accessor`\<[`ActionMessage`](ActionMessage.md)[]\>

Defined in: [src/core/battle/engine/battle.types.ts:124](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L124)

Signal for the current action messages (flair text)

***

### battleResultPromise

> **battleResultPromise**: `Promise`\<[`BattleOutcome`](../enumerations/BattleOutcome.md)\>

Defined in: [src/core/battle/engine/battle.types.ts:132](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L132)

Promise representing the battle outcome, resolved when the player or opponent die.

Await/then this to handle battle resolution.

#### Resolves

"player" when player wins (opponent death)

#### Resolves

"opponent" when opponent wins (player death)

#### Resolves

"draw" when both player and opponent die.

***

### battleUIState

> **battleUIState**: `Accessor`\<[`BattleUIState`](../../battle.context/enumerations/BattleUIState.md)\>

Defined in: [src/core/battle/engine/battle.types.ts:99](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L99)

Signal for battle UI state. Reference battle.context.ts

***

### currentStatuses

> **currentStatuses**: `Accessor`\<\{ `opp`: `string`[]; `player`: `string`[]; \}\>

Defined in: [src/core/battle/engine/battle.types.ts:119](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L119)

Simple object representing the current status icons for the player and opponent (for UI)

***

### executeRound()

> **executeRound**: (`userSelectedSequence`) => `Promise`\<`void`\>

Defined in: [src/core/battle/engine/battle.types.ts:115](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L115)

Round execution function, triggered by user event.
- Builds sequence and executes it, updating the battle state.
- Core battle logic is executed here.
- Automatically triggers setupRound or handleDeath as needed.

#### Parameters

##### userSelectedSequence

[`PlayerMoveMeta`](../../../moves/moves.types/interfaces/PlayerMoveMeta.md)[]

#### Returns

`Promise`\<`void`\>

***

### forceBattleResolve()

> **forceBattleResolve**: (`winner`) => `void`

Defined in: [src/core/battle/engine/battle.types.ts:136](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L136)

Exposed promise resolver to trigger an early battle end.

#### Parameters

##### winner

[`BattleOutcome`](../enumerations/BattleOutcome.md)

#### Returns

`void`

#### Argument

winner: BattleOutcome - who won.

***

### insight

> **insight**: `Accessor`\<(`undefined` \| [`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md))[]\>

Defined in: [src/core/battle/engine/battle.types.ts:117](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L117)

Signal for the current "hint" of the opponent sequence.

***

### opponent

> **opponent**: [`Actor`](../../actor/classes/Actor.md)

Defined in: [src/core/battle/engine/battle.types.ts:105](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L105)

Opponent actor object (proxied with createMutable)

***

### opponentMults

> **opponentMults**: `Accessor`\<[`MultiplierSet`](../type-aliases/MultiplierSet.md)\>

Defined in: [src/core/battle/engine/battle.types.ts:97](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L97)

Simple signal getter indicating opponent incoming/outgoing multipliers

***

### player

> **player**: [`Actor`](../../actor/classes/Actor.md)

Defined in: [src/core/battle/engine/battle.types.ts:103](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L103)

Player actor object (proxied with createMutable)

***

### playerMults

> **playerMults**: `Accessor`\<[`MultiplierSet`](../type-aliases/MultiplierSet.md)\>

Defined in: [src/core/battle/engine/battle.types.ts:95](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L95)

Simple signal getter indicating player incoming/outgoing multipliers

***

### setBattleUIState

> **setBattleUIState**: `Setter`\<[`BattleUIState`](../../battle.context/enumerations/BattleUIState.md)\>

Defined in: [src/core/battle/engine/battle.types.ts:101](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L101)

Signal setter for battle UI state. Reference battle.context.ts

***

### setupRound()

> **setupRound**: () => `Promise`\<`void`\>

Defined in: [src/core/battle/engine/battle.types.ts:109](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L109)

Round initialization and setup function.
Fetches opponent moves, updates displayed hint, and resets battle state.

#### Returns

`Promise`\<`void`\>
