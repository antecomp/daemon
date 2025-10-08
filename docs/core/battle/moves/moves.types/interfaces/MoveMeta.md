[**daemon**](../../../../../README.md)

***

# Interface: MoveMeta

Defined in: [src/core/battle/moves/moves.types.ts:138](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L138)

Wrapper for a move that includes additional metadata for UI and conditional/eval logic.
Can be used to dynamically generate a move (f.e mirror/repeat utilize this).

## Extended by

- [`PlayerMoveMeta`](PlayerMoveMeta.md)

## Properties

### canPerform?

> `optional` **canPerform**: [`MoveValidator`](../type-aliases/MoveValidator.md)

Defined in: [src/core/battle/moves/moves.types.ts:142](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L142)

***

### description?

> `optional` **description**: `string`

Defined in: [src/core/battle/moves/moves.types.ts:143](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L143)

***

### displayName

> **displayName**: `string`

Defined in: [src/core/battle/moves/moves.types.ts:139](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L139)

***

### getMove

> **getMove**: [`Move`](Move.md) \| (`context`) => [`Move`](Move.md)

Defined in: [src/core/battle/moves/moves.types.ts:141](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L141)

***

### icon

> **icon**: `string`

Defined in: [src/core/battle/moves/moves.types.ts:140](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L140)
