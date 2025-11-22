[**daemon**](../../../../../README.md)

***

# Interface: OpponentDisplayBehavior

Defined in: [src/features/battle/bridge/battleProfiles.ts:49](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L49)

A UI-focused, contextual behavior that an opponent can perform.
Behaviors can be gated by a predicate, run once, and operate on
injected UI helpers.

## Properties

### key

> **key**: `string`

Defined in: [src/features/battle/bridge/battleProfiles.ts:50](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L50)

Stable identifier for the behavior (used for tracking/execution).

***

### once?

> `optional` **once**: `boolean`

Defined in: [src/features/battle/bridge/battleProfiles.ts:53](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L53)

If true, runs at most once across the battle.

***

### run()

> **run**: (`deps`) => `void` \| `Promise`\<`void`\>

Defined in: [src/features/battle/bridge/battleProfiles.ts:52](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L52)

Executes the behavior with provided dependencies.

#### Parameters

##### deps

[`OpponentDisplayBehaviorDeps`](../type-aliases/OpponentDisplayBehaviorDeps.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### when()?

> `optional` **when**: (`args`) => `boolean`

Defined in: [src/features/battle/bridge/battleProfiles.ts:51](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L51)

Optional predicate to determine if the behavior should run.

#### Parameters

##### args

[`OpponentDisplayPredicateArgs`](../type-aliases/OpponentDisplayPredicateArgs.md)

#### Returns

`boolean`
