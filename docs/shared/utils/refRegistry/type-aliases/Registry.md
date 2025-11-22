[**daemon**](../../../../README.md)

***

# Type Alias: Registry\<K\>

> **Registry**\<`K`\> = `{ [Key in K[number]]?: HTMLElement }`

Defined in: [src/shared/utils/refRegistry.ts:14](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/utils/refRegistry.ts#L14)

Map from allowed keys to their corresponding `HTMLElement` reference.
Keys are optional until a reference is registered for them.

## Type Parameters

### K

`K` *extends* readonly `string`[]

Tuple of allowed string keys.
