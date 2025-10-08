[**daemon**](../../../../../README.md)

***

# Class: Actor

Defined in: [src/core/battle/engine/actor.ts:16](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L16)

Actor is a simple container tracking the health, statuses and move sequence of either the player or an opponent
within the battle system.

## Constructors

### Constructor

> **new Actor**(`name`, `maxHealth`): `Actor`

Defined in: [src/core/battle/engine/actor.ts:37](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L37)

#### Parameters

##### name

`string`

##### maxHealth

`number`

#### Returns

`Actor`

## Properties

### currentSequence

> **currentSequence**: [`Move`](../../../moves/moves.types/interfaces/Move.md)[] = `[]`

Defined in: [src/core/battle/engine/actor.ts:22](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L22)

***

### data

> **data**: `object` = `{}`

Defined in: [src/core/battle/engine/actor.ts:33](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L33)

#### Index Signature

\[`key`: `string`\]: `any`

***

### health

> **health**: `number`

Defined in: [src/core/battle/engine/actor.ts:19](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L19)

***

### maxHealth

> **maxHealth**: `number`

Defined in: [src/core/battle/engine/actor.ts:18](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L18)

***

### name

> **name**: `string`

Defined in: [src/core/battle/engine/actor.ts:17](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L17)

***

### statuses

> **statuses**: `Map`\<`string`, [`Status`](../../../statuses/status.types/classes/Status.md)[]\>

Defined in: [src/core/battle/engine/actor.ts:21](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L21)

Stack of statuses applied to the actor, holding multiple instances of the same status (to track several durations).

## Accessors

### healthPercent

#### Get Signature

> **get** **healthPercent**(): `number`

Defined in: [src/core/battle/engine/actor.ts:52](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L52)

##### Returns

`number`

## Methods

### addStatus()

> **addStatus**(`status`): `void`

Defined in: [src/core/battle/engine/actor.ts:57](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L57)

Add a new status or stack upon existing status

#### Parameters

##### status

[`Status`](../../../statuses/status.types/classes/Status.md)

#### Returns

`void`

***

### getStatusLevel()

> **getStatusLevel**(`type`): `number`

Defined in: [src/core/battle/engine/actor.ts:99](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L99)

#### Parameters

##### type

`string`

#### Returns

`number`

***

### heal()

> **heal**(`amount`): `void`

Defined in: [src/core/battle/engine/actor.ts:48](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L48)

#### Parameters

##### amount

`number`

#### Returns

`void`

***

### onDamageTaken()

> **onDamageTaken**(`callback`): `void`

Defined in: [src/core/battle/engine/actor.ts:111](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L111)

Attach callback that fires whenever Actor takes nonzero damage.

#### Parameters

##### callback

`damageCallback`

#### Returns

`void`

***

### setMoveSequence()

> **setMoveSequence**(`selectedMoves`): `void`

Defined in: [src/core/battle/engine/actor.ts:103](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L103)

#### Parameters

##### selectedMoves

[`Move`](../../../moves/moves.types/interfaces/Move.md)[]

#### Returns

`void`

***

### takeDamage()

> **takeDamage**(`amount`): `void`

Defined in: [src/core/battle/engine/actor.ts:43](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L43)

#### Parameters

##### amount

`number`

#### Returns

`void`

***

### tickAndRemoveStatuses()

> **tickAndRemoveStatuses**(): `void`

Defined in: [src/core/battle/engine/actor.ts:72](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L72)

Decrease the duration of all statuses by 1, remove any statuses who have reached a >0 duration.

#### Returns

`void`

***

### tickUpStatus()

> **tickUpStatus**(`effectName`, `amount`): `void`

Defined in: [src/core/battle/engine/actor.ts:87](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/engine/actor.ts#L87)

Increment Duration of all instances of an status. Used for extending statuses to next move eval

#### Parameters

##### effectName

`string`

##### amount

`number`

#### Returns

`void`
