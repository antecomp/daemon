[**daemon**](../../../../../README.md)

***

# Function: generateHint()

> **generateHint**(`seq`): (`undefined` \| [`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md))[]

Defined in: [src/core/battle/engine/battle.utils.ts:13](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.utils.ts#L13)

Generate a clone of a sequence with a few of the elements redacted as undefined.

## Parameters

### seq

[`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md)[]

The sequence of `MoveMeta` objects to redact.

## Returns

(`undefined` \| [`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md))[]

A new sequence where three random elements are replaced with `undefined`.
