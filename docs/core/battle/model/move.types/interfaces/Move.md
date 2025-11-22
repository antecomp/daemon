[**daemon**](../../../../../README.md)

***

# Interface: Move

Defined in: [src/core/battle/model/move.types.ts:104](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L104)

Represents a battle move with a unique name, type, and associated behaviors.

## Properties

### behaviors

> **behaviors**: `object`

Defined in: [src/core/battle/model/move.types.ts:109](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L109)

Optional hooks for move side effects and damage calculation:
  - preEffect: Function executed before the move's main effect.
  - damageMultipliers: Function to calculate damage multipliers.
  - postEffect: Function executed after the move's main effect.

#### damageMultipliers?

> `optional` **damageMultipliers**: [`DamageMultiplierFunction`](../type-aliases/DamageMultiplierFunction.md)

#### postEffect?

> `optional` **postEffect**: [`PostMoveSideEffect`](../type-aliases/PostMoveSideEffect.md)

#### preEffect?

> `optional` **preEffect**: [`PreMoveSideEffect`](../type-aliases/PreMoveSideEffect.md)

***

### name

> **name**: `string`

Defined in: [src/core/battle/model/move.types.ts:106](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L106)

Move name used for internal tracking, comparison, and event mapping.

***

### tags?

> `optional` **tags**: [`MoveTags`](../type-aliases/MoveTags.md)

Defined in: [src/core/battle/model/move.types.ts:108](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L108)

***

### type

> **type**: [`MoveType`](../enumerations/MoveType.md)

Defined in: [src/core/battle/model/move.types.ts:107](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L107)

The type/category of the move. Used for logical checks and to set initial damage multipliers.
