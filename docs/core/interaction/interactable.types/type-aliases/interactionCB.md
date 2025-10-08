[**daemon**](../../../../README.md)

***

# Type Alias: interactionCB()

> **interactionCB** = (`uv`, `mouse`) => `void`

Defined in: [src/core/interaction/interactable.types.ts:20](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/interaction/interactable.types.ts#L20)

An interactionCB is a callback that fires for various interactions (see: Interactable, PlayerCam).

## Parameters

### uv

`Vector2`

### mouse

`Vector2`

## Returns

`void`

## Argument

uv: Vector2 - (u,v) indicating where the object was clicked (as a u,v point, however that is mapped).

## Argument

mouse: Vector2 - location of the mouse; relative to the entire scene container, in 2D space. The center of the screen is [0,0], ranging from [-1,-1] (bottom left) to [1,1] (top right).
