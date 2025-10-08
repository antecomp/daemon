[**daemon**](../../../../../README.md)

***

# Interface: moveAnimationStep\<contextType\>

Defined in: [src/core/battle/moves/moves.types.ts:102](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L102)

## Extended by

- [`animationData`](animationData.md)

## Type Parameters

### contextType

`contextType` = [`MoveContext`](MoveContext.md) \| [`PostMoveContext`](../type-aliases/PostMoveContext.md)

## Properties

### execute()

> **execute**: (`ctx`) => `Promise`\<`void`\>

Defined in: [src/core/battle/moves/moves.types.ts:103](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L103)

#### Parameters

##### ctx

`contextType`

#### Returns

`Promise`\<`void`\>

***

### soundEffect()?

> `optional` **soundEffect**: (`ctx`) => `Promise`\<`void`\>

Defined in: [src/core/battle/moves/moves.types.ts:104](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/moves/moves.types.ts#L104)

#### Parameters

##### ctx

`contextType`

#### Returns

`Promise`\<`void`\>
