[**daemon**](../../../../README.md)

***

# Type Alias: Optional\<T, K\>

> **Optional**\<`T`, `K`\> = `Pick`\<`Partial`\<`T`\>, `K`\> & `Omit`\<`T`, `K`\>

Defined in: [src/shared/types/misc.types.ts:10](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/shared/types/misc.types.ts#L10)

utility type to make some parameters of a type optional.

## Type Parameters

### T

`T`

### K

`K` *extends* keyof `T`
