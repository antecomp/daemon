[**daemon**](../../../../../README.md)

***

# Interface: Move

Defined in: [src/core/battle/moves/moves.types.ts:119](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L119)

Represents a move in the battle system, including its type, behaviors, and
optional animations. Moves define the core mechanics of a battle.

## Properties

### animations?

> `optional` **animations**: `object`

Defined in: [src/core/battle/moves/moves.types.ts:128](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L128)

#### post?

> `optional` **post**: [`animationData`](animationData.md)\<[`PostMoveContext`](../type-aliases/PostMoveContext.md)\>[]

#### pre?

> `optional` **pre**: [`animationData`](animationData.md)\<[`MoveContext`](MoveContext.md)\>[]

***

### behaviors

> **behaviors**: `object`

Defined in: [src/core/battle/moves/moves.types.ts:122](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L122)

#### immediatePostEffects?

> `optional` **immediatePostEffects**: [`PostMoveSideEffect`](../type-aliases/PostMoveSideEffect.md)[]

#### multpipeline?

> `optional` **multpipeline**: [`MultiplierPipelineStep`](../type-aliases/MultiplierPipelineStep.md)[]

#### postEffects?

> `optional` **postEffects**: [`PostMoveSideEffect`](../type-aliases/PostMoveSideEffect.md)[]

#### preEffects?

> `optional` **preEffects**: [`MoveSideEffect`](../type-aliases/MoveSideEffect.md)[]

***

### name

> **name**: `string`

Defined in: [src/core/battle/moves/moves.types.ts:120](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L120)

***

### type

> **type**: [`MoveType`](../enumerations/MoveType.md)

Defined in: [src/core/battle/moves/moves.types.ts:121](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L121)
