[**daemon**](../../../../../README.md)

***

# Function: requestOverlayAnimation()

> **requestOverlayAnimation**(`name`, `position`): `Promise`\<`void`\>

Defined in: [src/core/battle/animation/requestOverlayAnim.ts:13](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/battle/animation/requestOverlayAnim.ts#L13)

An asynchronous call to play a named overlay in animation, used for things like playing the attack swipe over opponent.

## Parameters

### name

`string`

Name of the animation, reference animations.reg.ts (system may change if we want to localize animations)

### position

\[`number`, `number`\] = `...`

[top,left] offset to position overlay sprite

## Returns

`Promise`\<`void`\>

Promise that resolves when the sprite animation is complete (frameRate * totalFrames)
