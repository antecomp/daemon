[**daemon**](../../../../README.md)

***

# Function: default()

> **default**\<`T`, `K`\>(`obj`, `keys`): `Pick`\<`T`, `K`\>

Defined in: [src/shared/utils/pick.ts:10](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/utils/pick.ts#L10)

Creates a new object by picking a subset of properties from the given object.

## Type Parameters

### T

`T`

The type of the source object.

### K

`K` *extends* `string` \| `number` \| `symbol`

The keys to pick from the source object.

## Parameters

### obj

`T`

The source object to pick properties from.

### keys

`K`[]

An array of keys to extract from the source object.

## Returns

`Pick`\<`T`, `K`\>

A new object containing only the specified keys.
