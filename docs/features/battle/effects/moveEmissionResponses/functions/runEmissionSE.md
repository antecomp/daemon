[**daemon**](../../../../../README.md)

***

# Function: runEmissionSE()

> **runEmissionSE**\<`S`\>(`map`, `signal`, `deps`, `ctx`): `void`

Defined in: [src/features/battle/effects/moveEmissionResponses.ts:92](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/effects/moveEmissionResponses.ts#L92)

Need this evil helper because Typescript type narrowing is evil & broken sometimes.
Maps a Move Emission signal to it's associated side effect method and runs it.

## Type Parameters

### S

`S` *extends* [`MoveSignal`](../../../../../core/battle/model/move.types/type-aliases/MoveSignal.md)

## Parameters

### map

[`EmissionSEMap`](../type-aliases/EmissionSEMap.md)

### signal

`S`

### deps

[`EmissionSEDeps`](../type-aliases/EmissionSEDeps.md)

### ctx

[`EmissionSECTX`](../type-aliases/EmissionSECTX.md)

## Returns

`void`
