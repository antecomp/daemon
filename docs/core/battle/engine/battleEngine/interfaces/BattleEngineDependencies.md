[**daemon**](../../../../../README.md)

***

# Interface: BattleEngineDependencies

Defined in: [src/core/battle/engine/battleEngine.ts:15](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/engine/battleEngine.ts#L15)

Engine dependencies (swappable handlers)
(f.e logger uses console for testing, but UI version can have a dedicated display handler.)

## Properties

### logger()

> **logger**: (`message`, `tag?`) => `void`

Defined in: [src/core/battle/engine/battleEngine.ts:16](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/battle/engine/battleEngine.ts#L16)

#### Parameters

##### message

`string`

##### tag?

`string`

#### Returns

`void`
