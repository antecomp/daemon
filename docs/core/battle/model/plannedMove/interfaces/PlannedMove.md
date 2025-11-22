[**daemon**](../../../../../README.md)

***

# Interface: PlannedMove

Defined in: [src/core/battle/model/plannedMove.ts:32](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/plannedMove.ts#L32)

Represents a move that is planned to be executed in the battle system.
Dynamically instantiating using battle context for unique behaviors.

## Properties

### canPerform?

> `optional` **canPerform**: [`MoveValidator`](../type-aliases/MoveValidator.md)

Defined in: [src/core/battle/model/plannedMove.ts:35](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/plannedMove.ts#L35)

(Optional) A function that validates whether the move can be performed under current conditions. 
                       When undefined this defaults to being seen as true.

***

### instantiate

> **instantiate**: [`PlannedMoveInstantiator`](../type-aliases/PlannedMoveInstantiator.md)

Defined in: [src/core/battle/model/plannedMove.ts:36](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/plannedMove.ts#L36)

A function that creates an instance of the planned move.

***

### name

> **name**: `string`

Defined in: [src/core/battle/model/plannedMove.ts:34](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/plannedMove.ts#L34)

A unique identifier for the move, used for logical checks, internal tracking, and mapping in BattleEvent emissions.
