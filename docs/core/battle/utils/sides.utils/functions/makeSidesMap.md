[**daemon**](../../../../../README.md)

***

# Function: makeSidesMap()

> **makeSidesMap**\<`T`\>(`player`, `opponent`): [`Sides`](../type-aliases/Sides.md)\<`T`\>

Defined in: [src/core/battle/utils/sides.utils.ts:46](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/utils/sides.utils.ts#L46)

Constructs a `Sides<T>` from two values, one per side.

## Type Parameters

### T

`T`

Type of the values.

## Parameters

### player

`T`

Value for the player side.

### opponent

`T`

Value for the opponent side.

## Returns

[`Sides`](../type-aliases/Sides.md)\<`T`\>

A `Sides<T>` object with both values.

## Example

```ts
const combatants = makeSidesMap(playerCombatant, opponentCombatant);
```
