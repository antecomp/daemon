[**daemon**](../../../../../README.md)

***

# Interface: OpponentAI

Defined in: [src/core/battle/ai/opponentAI.types.ts:44](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/opponentAI.types.ts#L44)

OpponentAI describes the logic and behavior for a given battle opponent.

## Properties

### behaviors?

> `optional` **behaviors**: `object`

Defined in: [src/core/battle/ai/opponentAI.types.ts:49](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/opponentAI.types.ts#L49)

Opponent Behaviors (side effects) to run. 
   - Has two arrays of behaviors (@ref OpponentAIBehavior), where `preRound` runs before the round starts (right after player execute), and `postRound` runs when the round ends (but before new plans have been generated)

#### postRound?

> `optional` **postRound**: [`OpponentAIBehavior`](OpponentAIBehavior.md)[]

Behaviors to run when the round ends (but before next setupRound)

#### preRound?

> `optional` **preRound**: [`OpponentAIBehavior`](OpponentAIBehavior.md)[]

Behaviors to run right as round starts (executeRound called)

***

### getSequence()

> **getSequence**: (`me`, `player`) => [`PlannedSequence`](../../../model/plannedMove/type-aliases/PlannedSequence.md)

Defined in: [src/core/battle/ai/opponentAI.types.ts:46](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/opponentAI.types.ts#L46)

A method that reads current Player/Opponent Combatant state (for making contextual decisions) and returns the opponents planned sequence.

#### Parameters

##### me

[`Combatant`](../../../model/combatant/classes/Combatant.md)

##### player

[`Combatant`](../../../model/combatant/classes/Combatant.md)

#### Returns

[`PlannedSequence`](../../../model/plannedMove/type-aliases/PlannedSequence.md)
