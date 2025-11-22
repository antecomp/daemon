[**daemon**](../../../../README.md)

***

# Function: default()

> **default**(`element`, `keyframes`, `options?`): `Promise`\<`Animation`\>

Defined in: [src/shared/utils/animateAsync.ts:8](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/utils/animateAsync.ts#L8)

Simple wrapper for .animate to make it Promise-based (such that we can await it) instead of callback based.

## Parameters

### element

`HTMLElement`

### keyframes

`Keyframe`[] | `PropertyIndexedKeyframes`

### options?

`number` | `KeyframeAnimationOptions`

## Returns

`Promise`\<`Animation`\>

## Argument

element - the element to animate

## Argument

keyframes - Keyframes: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats

## Argument

options - Keyframe options: https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/KeyframeEffect#parameters
