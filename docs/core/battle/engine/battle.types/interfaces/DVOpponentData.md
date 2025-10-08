[**daemon**](../../../../../README.md)

***

# Interface: DVOpponentData

Defined in: [src/core/battle/engine/battle.types.ts:16](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L16)

Represents the data structure for an opponent in the battle engine.
This interface defines the properties and methods required for an opponent's behavior and appearance.

## Properties

### backgroundShader

> **backgroundShader**: `string`

Defined in: [src/core/battle/engine/battle.types.ts:57](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L57)

* The fragment shader used for rendering the opponent's background.

***

### backgroundShaderTexture?

> `optional` **backgroundShaderTexture**: `string`

Defined in: [src/core/battle/engine/battle.types.ts:59](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L59)

***

### getSequence()

> **getSequence**: (`me`, `player`) => [`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md)[]

Defined in: [src/core/battle/engine/battle.types.ts:40](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L40)

A function that determines the sequence of moves the opponent will make.
The decision is based on the opponent's state (`me`) and the player's state (`player`).

#### Parameters

##### me

[`Actor`](../../actor/classes/Actor.md)

The current state of the opponent.

##### player

[`Actor`](../../actor/classes/Actor.md)

The current state of the player.

#### Returns

[`MoveMeta`](../../../moves/moves.types/interfaces/MoveMeta.md)[]

An array of `MoveMeta` objects representing the opponent's move sequence.

***

### icon

> **icon**: `string`

Defined in: [src/core/battle/engine/battle.types.ts:21](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L21)

The icon representing the opponent (top left corner of UI).

***

### maxHealth

> **maxHealth**: `number`

Defined in: [src/core/battle/engine/battle.types.ts:30](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L30)

* The maximum health value of the opponent. Also used as initial health.

***

### name

> **name**: `string`

Defined in: [src/core/battle/engine/battle.types.ts:18](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L18)

The display name of the opponent.

***

### postRoundBehavior()?

> `optional` **postRoundBehavior**: (`me`, `player`, `appendActionMessage`) => `void`

Defined in: [src/core/battle/engine/battle.types.ts:54](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L54)

Optional method that runs after each round, allows opponent to perform side effects independent of a move.

#### Parameters

##### me

[`Actor`](../../actor/classes/Actor.md)

The current state of the opponent.

##### player

[`Actor`](../../actor/classes/Actor.md)

The current state of the player.

##### appendActionMessage

[`ActionMessageAppender`](../type-aliases/ActionMessageAppender.md)

#### Returns

`void`

***

### preRoundBehavior()?

> `optional` **preRoundBehavior**: (`me`, `player`, `appendActionMessage`) => `void`

Defined in: [src/core/battle/engine/battle.types.ts:47](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L47)

Optional method that runs before each round, allows opponent to perform side effects independent of a move.

#### Parameters

##### me

[`Actor`](../../actor/classes/Actor.md)

The current state of the opponent.

##### player

[`Actor`](../../actor/classes/Actor.md)

The current state of the player.

##### appendActionMessage

[`ActionMessageAppender`](../type-aliases/ActionMessageAppender.md)

#### Returns

`void`

***

### sprite

> **sprite**: `string`

Defined in: [src/core/battle/engine/battle.types.ts:24](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L24)

The sprite asset url.

***

### spriteOffset?

> `optional` **spriteOffset**: [`Point`](../../../../../shared/types/3d.types/interfaces/Point.md)

Defined in: [src/core/battle/engine/battle.types.ts:27](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/battle.types.ts#L27)

Optional offset to position sprite away from center.
