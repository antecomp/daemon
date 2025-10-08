[**daemon**](../../../../../README.md)

***

# Function: buildSequenceFromWeightMap()

> **buildSequenceFromWeightMap**\<`M`\>(`moveBank`, `weightMap`): [`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md)[]

Defined in: [src/core/battle/ai/weightedSequenceAI.ts:39](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/ai/weightedSequenceAI.ts#L39)

Builds a sequence of moves based on a weight map that defines the likelihood
of one move following another. The sequence is constructed by selecting moves
randomly, weighted by the provided weight map.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, [`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md)\>

## Parameters

### moveBank

`M`

A map of available moves, where the keys are unique move
                        identifiers and the values are metadata about each move.
                        The keys must be unique to allow duplicate move mappings.

### weightMap

[`MoveWeightMap`](../type-aliases/MoveWeightMap.md)\<`M`\>

A map defining the weighted chances of one move following another.
                   Each key corresponds to a move identifier, and its value is an
                   object where the keys are other move identifiers and the values
                   are the weights (numbers) representing the likelihood of those
                   moves following the current move. 
                    - If weights are not provided for a move it defaults to 1
                    - Weights should be > 0, but can be fractional!

## Returns

[`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md)[]

An array of move metadata objects representing the generated sequence.

## Throws

If the number of available moves is less than the required sequence length.

## Throws

If unable to find valid moves while building the sequence.
 - Note: The valid checkers should never be so restrictive that this becomes an issue. 
         In fact, we only really have one to prevent repeat from being first.
