[**daemon**](../../../../../README.md)

***

# Function: prepareMove()

> **prepareMove**(`context`): [`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)

Defined in: [src/core/battle/engine/battle.utils.ts:92](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.utils.ts#L92)

Runs PreEffects and Mult Pipeline For A Given Move + Set Of Actors.

## Parameters

### context

[`MoveContext`](../../../moves/moves.types/interfaces/MoveContext.md)

The context in which the move is being prepared.

## Returns

[`MultiplierSet`](../../battle.types/type-aliases/MultiplierSet.md)

The final multipliers after applying all effects and pipelines.
