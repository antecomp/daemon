[**daemon**](../../../../../README.md)

***

# Interface: OpponentAIBehavior

Defined in: [src/core/battle/ai/opponentAI.types.ts:26](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/opponentAI.types.ts#L26)

Opponent AI behaviors are side effects ran by the battle engine, as part of the Opponent AI declaration. This can be used for context-based changes to battle state.
For example, this can be used by an opponent to apply a certain status as part of a phase change.

Each behavior has a...

## Properties

### key

> **key**: `string`

Defined in: [src/core/battle/ai/opponentAI.types.ts:27](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/opponentAI.types.ts#L27)

***

### once?

> `optional` **once**: `boolean`

Defined in: [src/core/battle/ai/opponentAI.types.ts:30](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/opponentAI.types.ts#L30)

***

### run()

> **run**: (`deps`) => `void` \| `Promise`\<`void`\>

Defined in: [src/core/battle/ai/opponentAI.types.ts:29](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/opponentAI.types.ts#L29)

`(deps: OpponentAIBehaviorDeps)` => void;` The actual behavior side-effect. Takes in dependencies (@ref OpponentAIBehaviorDeps) to perform needed actions.
And can optionally take...
@property `when (args: OpponentAIBehaviorPredicateArgs)` - A predicate for if the behavior should run at all. 
          Use this instead of conditionals inside `run`. Takes in context (@ref OpponentAIBehaviorPredicateArgs)
@property `once` - Apply if this effect should only run one time.

#### Parameters

##### deps

[`OpponentAIBehaviorDeps`](../type-aliases/OpponentAIBehaviorDeps.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### when()?

> `optional` **when**: (`args`) => `boolean`

Defined in: [src/core/battle/ai/opponentAI.types.ts:28](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/ai/opponentAI.types.ts#L28)

#### Parameters

##### args

[`OpponentAIBehaviorPredicateArgs`](../type-aliases/OpponentAIBehaviorPredicateArgs.md)

#### Returns

`boolean`
