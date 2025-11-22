[**daemon**](../../../../../README.md)

***

# Interface: PreMoveContext

Defined in: [src/core/battle/model/move.types.ts:60](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L60)

## Extended by

- [`DamageMultiplierContext`](DamageMultiplierContext.md)

## Properties

### deps

> **deps**: [`BattleEngineDependencies`](../../../engine/battleEngine/interfaces/BattleEngineDependencies.md)

Defined in: [src/core/battle/model/move.types.ts:61](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L61)

***

### emit()

> **emit**: (`signal`) => `void`

Defined in: [src/core/battle/model/move.types.ts:62](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L62)

#### Parameters

##### signal

[`MoveSignal`](../type-aliases/MoveSignal.md)

#### Returns

`void`

***

### moves

> **moves**: `object`

Defined in: [src/core/battle/model/move.types.ts:66](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L66)

#### ours

> **ours**: [`Move`](Move.md)

#### theirs

> **theirs**: [`Move`](Move.md)

***

### self

> **self**: [`Combatant`](../../combatant/classes/Combatant.md)

Defined in: [src/core/battle/model/move.types.ts:64](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L64)

***

### them

> **them**: [`Combatant`](../../combatant/classes/Combatant.md)

Defined in: [src/core/battle/model/move.types.ts:65](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L65)
