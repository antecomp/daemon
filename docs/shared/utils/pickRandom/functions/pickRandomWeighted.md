[**daemon**](../../../../README.md)

***

# Function: pickRandomWeighted()

> **pickRandomWeighted**\<`T`\>(`items`, `weights`): `T`

Defined in: [src/shared/utils/pickRandom.ts:24](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/shared/utils/pickRandom.ts#L24)

Selects a random item from an array based on the provided weights.

## Type Parameters

### T

`T`

The type of the items in the array.

## Parameters

### items

`T`[]

An array of items to choose from.

### weights

`number`[]

An array of weights corresponding to the items. Each weight determines the likelihood of selecting the associated item.
                 The length of the `weights` array must match the length of the `items` array.

## Returns

`T`

A randomly selected item from the `items` array, weighted by the `weights` array.

## Throws

If the `weights` array is empty or its length does not match the `items` array.
