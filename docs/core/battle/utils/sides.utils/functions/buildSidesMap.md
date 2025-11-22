[**daemon**](../../../../../README.md)

***

# Function: buildSidesMap()

> **buildSidesMap**\<`T`\>(`builder`): [`Sides`](../type-aliases/Sides.md)\<`T`\>

Defined in: [src/core/battle/utils/sides.utils.ts:104](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/utils/sides.utils.ts#L104)

Builds a Sides<T> by calling a builder for each side.

## Type Parameters

### T

`T`

Value type.

## Parameters

### builder

(`role`) => `T`

Function that creates a value for a given side.

## Returns

[`Sides`](../type-aliases/Sides.md)\<`T`\>

A Sides<T> with built values.

## Example

```ts
const contexts = buildSidesMap((side) => ({
  self: combatants[side],
  opponent: combatants[oppositeSide(side)],
  sequence: sequences[side],
}));
```
