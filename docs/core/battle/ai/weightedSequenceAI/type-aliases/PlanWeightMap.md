[**daemon**](../../../../../README.md)

***

# Type Alias: PlanWeightMap\<M\>

> **PlanWeightMap**\<`M`\> = `{ [K in keyof M]?: Partial<Record<keyof M, number>> }`

Defined in: [src/core/battle/ai/weightedSequenceAI.ts:7](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/weightedSequenceAI.ts#L7)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, [`PlannedMove`](../../../model/plannedMove/interfaces/PlannedMove.md)\>
