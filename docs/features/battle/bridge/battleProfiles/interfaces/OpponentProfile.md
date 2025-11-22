[**daemon**](../../../../../README.md)

***

# Interface: OpponentProfile

Defined in: [src/features/battle/bridge/battleProfiles.ts:59](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L59)

Full opponent profile combining display configuration and battle logic.

## Properties

### display

> **display**: `object`

Defined in: [src/features/battle/bridge/battleProfiles.ts:76](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L76)

Visual and UI configuration for the opponent.

#### backgroundShader

> **backgroundShader**: `string`

#### backgroundShaderTexture?

> `optional` **backgroundShaderTexture**: `string`

#### behaviors?

> `optional` **behaviors**: `object`

##### behaviors.moveEmissionHandlers?

> `optional` **moveEmissionHandlers**: `object`

##### behaviors.moveEmissionHandlers.add?

> `optional` **add**: `Partial`\<\{ `effect:heal`: (`payload`, `deps`, `ctx`) => `void`; `example`: (`payload`, `deps`, `ctx`) => `void`; `mechanic:focus`: (`payload`, `deps`, `ctx`) => `void`; `mechanic:mania`: (`payload`, `deps`, `ctx`) => `void`; `mechanic:observe`: (`payload`, `deps`, `ctx`) => `void`; `status:prepare`: (`payload`, `deps`, `ctx`) => `void`; \}\>

##### behaviors.moveEmissionHandlers.replace?

> `optional` **replace**: `Partial`\<\{ `effect:heal`: (`payload`, `deps`, `ctx`) => `void`; `example`: (`payload`, `deps`, `ctx`) => `void`; `mechanic:focus`: (`payload`, `deps`, `ctx`) => `void`; `mechanic:mania`: (`payload`, `deps`, `ctx`) => `void`; `mechanic:observe`: (`payload`, `deps`, `ctx`) => `void`; `status:prepare`: (`payload`, `deps`, `ctx`) => `void`; \}\>

##### behaviors.postRound?

> `optional` **postRound**: [`OpponentDisplayBehavior`](OpponentDisplayBehavior.md)[]

##### behaviors.preRound?

> `optional` **preRound**: [`OpponentDisplayBehavior`](OpponentDisplayBehavior.md)[]

#### icon

> **icon**: `string`

#### lexicon

> **lexicon**: `Partial`\<[`MoveLexicon`](../../../lexicon/moveLexicon/type-aliases/MoveLexicon.md)\>

#### moveUISideEffectOverrides?

> `optional` **moveUISideEffectOverrides**: [`OpponentMoveOverrides`](../../../effects/moveUISideEffects/type-aliases/OpponentMoveOverrides.md)

#### name

> **name**: `string`

#### sprite

> **sprite**: `string`

#### spriteOffset?

> `optional` **spriteOffset**: [`Point`](../../../../../shared/types/3d.types/interfaces/Point.md)

***

### logic

> **logic**: `object`

Defined in: [src/features/battle/bridge/battleProfiles.ts:106](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/bridge/battleProfiles.ts#L106)

Battle logic configuration for the opponent.

#### ai

> **ai**: [`OpponentAI`](../../../../../core/battle/ai/opponentAI.types/interfaces/OpponentAI.md)

#### stats

> **stats**: [`OpponentStats`](../../../../../core/battle/ai/opponentAI.types/interfaces/OpponentStats.md)
