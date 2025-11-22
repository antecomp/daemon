[**daemon**](../../../../../../README.md)

***

# Interface: OverlayAnimReq

Defined in: [src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts:17](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts#L17)

Request used internally to actually track the animation *requests* that we've called.

## Properties

### id

> **id**: `string`

Defined in: [src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts:20](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts#L20)

***

### name

> **name**: `"observe"` \| `"mirror"` \| `"slash_norm"` \| `"slash_purpose"` \| `"slash_majes"` \| `"slash_elag"` \| `"slash_repeat"` \| `"shield"`

Defined in: [src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts:18](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts#L18)

***

### onFinish()

> **onFinish**: () => `void`

Defined in: [src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts:21](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts#L21)

#### Returns

`void`

***

### position

> **position**: \[`number`, `number`\]

Defined in: [src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts:19](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/animation/overlayAnimations/overlayAnimations.types.ts#L19)
