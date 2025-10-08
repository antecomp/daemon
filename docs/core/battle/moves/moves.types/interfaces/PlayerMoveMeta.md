[**daemon**](../../../../../README.md)

***

# Interface: PlayerMoveMeta

Defined in: [src/core/battle/moves/moves.types.ts:150](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L150)

Specialized version of MoveMeta for player moves, including additional
metadata for the runebuilder UI and a mandatory description.

## Extends

- [`MoveMeta`](MoveMeta.md)

## Properties

### canPerform?

> `optional` **canPerform**: [`MoveValidator`](../type-aliases/MoveValidator.md)

Defined in: [src/core/battle/moves/moves.types.ts:142](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L142)

#### Inherited from

[`MoveMeta`](MoveMeta.md).[`canPerform`](MoveMeta.md#canperform)

***

### description

> **description**: `string`

Defined in: [src/core/battle/moves/moves.types.ts:152](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L152)

#### Overrides

[`MoveMeta`](MoveMeta.md).[`description`](MoveMeta.md#description)

***

### displayName

> **displayName**: `string`

Defined in: [src/core/battle/moves/moves.types.ts:139](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L139)

#### Inherited from

[`MoveMeta`](MoveMeta.md).[`displayName`](MoveMeta.md#displayname)

***

### getMove

> **getMove**: [`Move`](Move.md) \| (`context`) => [`Move`](Move.md)

Defined in: [src/core/battle/moves/moves.types.ts:141](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L141)

#### Inherited from

[`MoveMeta`](MoveMeta.md).[`getMove`](MoveMeta.md#getmove)

***

### icon

> **icon**: `string`

Defined in: [src/core/battle/moves/moves.types.ts:140](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L140)

#### Inherited from

[`MoveMeta`](MoveMeta.md).[`icon`](MoveMeta.md#icon)

***

### rbIcon

> **rbIcon**: `string`

Defined in: [src/core/battle/moves/moves.types.ts:151](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L151)
