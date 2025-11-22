[**daemon**](../../../../../README.md)

***

# Function: forEachSide()

> **forEachSide**\<`T`\>(`pair`, `action`): `void`

Defined in: [src/core/battle/utils/sides.utils.ts:85](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/utils/sides.utils.ts#L85)

Invokes an effect for each side’s value.

## Type Parameters

### T

`T`

Value type.

## Parameters

### pair

[`Sides`](../type-aliases/Sides.md)\<`T`\>

The Sides<T> container.

### action

(`value`, `roll`) => `void`

## Returns

`void`

void

## Example

```ts
forEachSide(combatants, (c) => c.tickStatuses());
```
