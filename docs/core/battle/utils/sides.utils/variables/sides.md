[**daemon**](../../../../../README.md)

***

# Variable: sides

> `const` **sides**: readonly [`Side`](../type-aliases/Side.md)[]

Defined in: [src/core/battle/utils/sides.utils.ts:25](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/utils/sides.utils.ts#L25)

Ordered list of sides (player first, opponent second).
Useful for deterministic iteration.

## Example

```ts
sides.forEach(side => { ... });
```
