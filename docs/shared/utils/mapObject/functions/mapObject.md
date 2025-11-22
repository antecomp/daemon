[**daemon**](../../../../README.md)

***

# Function: mapObject()

> **mapObject**\<`T`, `O`, `K`\>(`obj`, `fn`): `Record`\<`K`, `O`\>

Defined in: [src/shared/utils/mapObject.ts:10](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/utils/mapObject.ts#L10)

Utility function to map an object to a new object with some mapper function.

## Type Parameters

### T

`T`

### O

`O`

### K

`K` *extends* `PropertyKey`

## Parameters

### obj

`Record`\<`K`, `T`\>

Input object of form `{key: T}`

### fn

(`v`, `k`, `obj`) => `O`

Mapper function to transform object. Takes `(value, key, obj)` where...
          - `value: T` is the current value.
          - `key` is the current key.
          - `obj` is the whole input object.

## Returns

`Record`\<`K`, `O`\>

Mapped object.
