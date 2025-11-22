[**daemon**](../../../../../README.md)

***

# Interface: DamageMultiplierContext

Defined in: [src/core/battle/model/move.types.ts:72](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L72)

## Extends

- [`PreMoveContext`](PreMoveContext.md)

## Properties

### deps

> **deps**: [`BattleEngineDependencies`](../../../engine/battleEngine/interfaces/BattleEngineDependencies.md)

Defined in: [src/core/battle/model/move.types.ts:61](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L61)

#### Inherited from

[`PreMoveContext`](PreMoveContext.md).[`deps`](PreMoveContext.md#deps)

***

### emit()

> **emit**: (`signal`) => `void`

Defined in: [src/core/battle/model/move.types.ts:62](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L62)

#### Parameters

##### signal

[`MoveSignal`](../type-aliases/MoveSignal.md)

#### Returns

`void`

#### Inherited from

[`PreMoveContext`](PreMoveContext.md).[`emit`](PreMoveContext.md#emit)

***

### moves

> **moves**: `object`

Defined in: [src/core/battle/model/move.types.ts:66](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L66)

#### ours

> **ours**: [`Move`](Move.md)

#### theirs

> **theirs**: [`Move`](Move.md)

#### Inherited from

[`PreMoveContext`](PreMoveContext.md).[`moves`](PreMoveContext.md#moves)

***

### preEffectOutcome

> **preEffectOutcome**: `undefined` \| [`MoveSideEffectOutcome`](../enumerations/MoveSideEffectOutcome.md)

Defined in: [src/core/battle/model/move.types.ts:73](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L73)

***

### self

> **self**: [`Combatant`](../../combatant/classes/Combatant.md)

Defined in: [src/core/battle/model/move.types.ts:64](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L64)

#### Inherited from

[`PreMoveContext`](PreMoveContext.md).[`self`](PreMoveContext.md#self)

***

### them

> **them**: [`Combatant`](../../combatant/classes/Combatant.md)

Defined in: [src/core/battle/model/move.types.ts:65](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L65)

#### Inherited from

[`PreMoveContext`](PreMoveContext.md).[`them`](PreMoveContext.md#them)
