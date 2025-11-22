[**daemon**](../../../../../README.md)

***

# Function: buildSequenceFromWeightMap()

> **buildSequenceFromWeightMap**\<`M`\>(`planBank`, `weightMap`): [`PlannedSequence`](../../../model/plannedMove/type-aliases/PlannedSequence.md)

Defined in: [src/core/battle/ai/weightedSequenceAI.ts:19](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/weightedSequenceAI.ts#L19)

buildSequenceFromWeightMap is a simple method to be used with OpponentAIs getSequence. 
It generates an opponent sequence given a movebank and weight mappings (liklihood that one move should follow another) from one move to another

## Type Parameters

### M

`M` *extends* [`PlanMap`](../type-aliases/PlanMap.md)

## Parameters

### planBank

`M`

A record of PlannedMoves, to use multiple instances of the same plannedMove, just write a custom key name for each.

### weightMap

[`PlanWeightMap`](../type-aliases/PlanWeightMap.md)\<`M`\>

A mapping from each move to each other move (from planBank) of the form {[moveName]: {[otherMoveName]: `number`}}
                  where the `number` represents a weight (liklihood) for otherMoveName to follow moveName (if not already selected)

## Returns

[`PlannedSequence`](../../../model/plannedMove/type-aliases/PlannedSequence.md)

A weighted, random planned sequence based on the planBank and weightMap provided.
