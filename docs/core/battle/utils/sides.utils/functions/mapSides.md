[**daemon**](../../../../../README.md)

***

# Function: mapSides()

> **mapSides**\<`Input`, `Output`\>(`pair`, `mapper`): [`Sides`](../type-aliases/Sides.md)\<`Output`\>

Defined in: [src/core/battle/utils/sides.utils.ts:68](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/utils/sides.utils.ts#L68)

Maps the values of a `Sides<Input>` to a new `Sides<Output>.`

## Type Parameters

### Input

`Input`

Input value type.

### Output

`Output`

Output value type.

## Parameters

### pair

[`Sides`](../type-aliases/Sides.md)\<`Input`\>

The input Sides container.

### mapper

(`value`, `role`, `whole`) => `Output`

Mapping function called for each side.

## Returns

[`Sides`](../type-aliases/Sides.md)\<`Output`\>

A new Sides<Output> with mapped values.

## Example

```ts
const lengths = mapSides(names, (name) => name.length);
```
