[**daemon**](../../../../README.md)

***

# Function: keyInObject()

> **keyInObject**\<`T`\>(`obj`, `key`): `key is keyof T`

Defined in: [src/shared/utils/keyInObject.ts:3](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/utils/keyInObject.ts#L3)

Type narrowing way to check if a certain key is in an object. 
Used to avoid the "asdf is implictily any because string cannot..."

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### obj

`T`

### key

`PropertyKey`

## Returns

`key is keyof T`
