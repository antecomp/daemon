[**daemon**](../../../../../README.md)

***

# Type Alias: EmissionSEMap\<T\>

> **EmissionSEMap**\<`T`\> = `Partial`\<`{ [K in T]: (payload: MoveSignalOf<K>["payload"], deps: EmissionSEDeps, ctx: EmissionSECTX) => void }`\>

Defined in: [src/features/battle/effects/moveEmissionResponses.ts:31](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/effects/moveEmissionResponses.ts#L31)

A record that maps different potential move emisissions to a method for running various UI-based side effects.
Each method takes
- `payload` : payload associated with that emission (ref: moves.types.ts)
- `deps` : Dependencies for running UI side effects (action messages and animation requester)
- `ctx` : Additional context for side effect logic.

## Type Parameters

### T

`T` *extends* keyof `MoveSignalMap` = keyof `MoveSignalMap`
