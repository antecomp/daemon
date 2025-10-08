[**daemon**](../../../../../README.md)

***

# Type Alias: MoveWeightMap\<M\>

> **MoveWeightMap**\<`M`\> = `{ [K in keyof M]?: Partial<Record<keyof M, number>> }`

Defined in: [src/core/battle/ai/weightedSequenceAI.ts:12](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/ai/weightedSequenceAI.ts#L12)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, [`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md)\>
