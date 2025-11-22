[**daemon**](../../../../../README.md)

***

# Type Alias: EmissionSEDeps

> **EmissionSEDeps** = `object`

Defined in: [src/features/battle/effects/moveEmissionResponses.ts:8](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/effects/moveEmissionResponses.ts#L8)

## Properties

### appendActionMessage

> **appendActionMessage**: [`ActionMessageAppender`](../../../ui/ActionMessages/type-aliases/ActionMessageAppender.md)

Defined in: [src/features/battle/effects/moveEmissionResponses.ts:9](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/effects/moveEmissionResponses.ts#L9)

***

### defaultSE()?

> `optional` **defaultSE**: () => `void`

Defined in: [src/features/battle/effects/moveEmissionResponses.ts:14](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/effects/moveEmissionResponses.ts#L14)

Optional hook that replays the default emission behavior for the signal currently being handled.
Namely used for opponentProfiles override with moveEmissionHandlers. Can be used to conditionally override (fallback to default).

#### Returns

`void`

***

### requestOverlayAnimation

> **requestOverlayAnimation**: [`OverlayAnimationRequester`](../../../animation/overlayAnimations/overlayAnimations.types/type-aliases/OverlayAnimationRequester.md)

Defined in: [src/features/battle/effects/moveEmissionResponses.ts:10](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/features/battle/effects/moveEmissionResponses.ts#L10)
