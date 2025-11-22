[**daemon**](../../../../../README.md)

***

# Enumeration: MoveSideEffectOutcome

Defined in: [src/core/battle/model/move.types.ts:56](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L56)

Move side effects can emit an outcome as an indicator of their result (f.e if evade rolled successfully). 
Passed as part of context to subsequent evaluation stages (multiplierPipeline, postEffect, move end emitter)

Feel free to extend this enum if additional outcome indicators are needed.

## Enumeration Members

### Failure

> **Failure**: `1`

Defined in: [src/core/battle/model/move.types.ts:57](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L57)

***

### Success

> **Success**: `0`

Defined in: [src/core/battle/model/move.types.ts:57](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/model/move.types.ts#L57)
