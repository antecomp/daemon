[**daemon**](../../../../../../README.md)

***

# Function: createBattleRefAttacher()

> **createBattleRefAttacher**(`as`): (`ref`) => `void`

Defined in: [src/features/battle/animation/uiAnimations/battleUIRefRegistry.ts:38](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/animation/uiAnimations/battleUIRefRegistry.ts#L38)

Creates a ref attacher function for battle UI elements.

## Parameters

### as

The name identifier for the battle ref to be registered

`"sequenceViewPlayer"` | `"sequenceViewOpponent"` | `"opponentSprite"` | `"opponentStatusbar"` | `"actionBar"` | `"actionBarRight"` | `"actionBarLeft"` | `"runeBuilder"` | `"battleView"` | `"battleBG"`

## Returns

A ref callback function that attaches the HTML element to the battle ref registry

> (`ref`): `void`

### Parameters

#### ref

`HTMLElement`

### Returns

`void`

## Example

```ts
const refAttacher = createBattleRefAttacher('opponentSprite');
<div ref={opponentSprite} />
```
