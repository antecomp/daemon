[**daemon**](../../../../../../README.md)

***

# Function: createOverlayAnimationQueue()

> **createOverlayAnimationQueue**(): `object`

Defined in: [src/features/battle/animation/overlayAnimations/overlayAnimationQueue.ts:12](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/animation/overlayAnimations/overlayAnimationQueue.ts#L12)

Generates a internally-tracked queue of requested overlay animations for a battle.

## Returns

`object`

a signal containing the currently queued overlayAnimationRequests (to be used by OverlayAnimator.tsx)
and a method for requesting a new overlay animaton.

### overlayAnimRequests

> **overlayAnimRequests**: `Accessor`\<[`OverlayAnimReq`](../../overlayAnimations.types/interfaces/OverlayAnimReq.md)[]\>

### requestOverlayAnimation()

> **requestOverlayAnimation**: (`name`, `position`) => `Promise`\<`void`\>

#### Parameters

##### name

`"observe"` | `"mirror"` | `"slash_norm"` | `"slash_purpose"` | `"slash_majes"` | `"slash_elag"` | `"slash_repeat"` | `"shield"`

##### position

\[`number`, `number`\] = `...`

#### Returns

`Promise`\<`void`\>
