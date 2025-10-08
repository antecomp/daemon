[**daemon**](../../../../README.md)

***

# Interface: CameraController

Defined in: [src/3d/camera/camera.types.ts:22](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/camera.types.ts#L22)

CameraController provides an API for imperatively managing a PlayerCams state (for easy programmatic movement).

## Properties

### clearOverrides()

> **clearOverrides**: (`anim?`) => `void`

Defined in: [src/3d/camera/camera.types.ts:49](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/camera.types.ts#L49)

Clears all overrides and optionally animates the transition back to the base state.

#### Parameters

##### anim?

`boolean`

#### Returns

`void`

***

### createOverride()

> **createOverride**: (`ovr`) => `object`

Defined in: [src/3d/camera/camera.types.ts:36](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/camera.types.ts#L36)

Creates a deferred camera override handle.

Generates a unique override that can be committed later, rather than being
pushed onto the stack immediately. Calling `commit` adds the override to
the controller’s stack (optionally toggling the base animation flag), and
`release` removes that same override, even if other overrides were added
afterward. Both helpers are idempotent, so repeated calls are safe.

#### Parameters

##### ovr

[`CameraSettings`](CameraSettings.md)

Camera settings (position, orientation, animation hint) to apply when committed.

#### Returns

`object`

Handle exposing the override `id` plus `commit`/`release` helpers for lifecycle control.

##### id

> **id**: `number`

##### commit()

> **commit**(`anim?`): `void`

###### Parameters

###### anim?

`boolean`

###### Returns

`void`

##### release()

> **release**(`anim?`): `void`

###### Parameters

###### anim?

`boolean`

###### Returns

`void`

***

### currentBase()

> **currentBase**: () => `object`

Defined in: [src/3d/camera/camera.types.ts:65](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/camera.types.ts#L65)

Retrieves the current base position and orientation.

#### Returns

`object`

##### ori

> **ori**: [`Orientation`](../../../../shared/types/3d.types/type-aliases/Orientation.md)

##### pos

> **pos**: [`XYZ`](../../../../shared/types/3d.types/type-aliases/XYZ.md)

***

### currentOverride()

> **currentOverride**: () => `null` \| \{ `ori?`: [`Orientation`](../../../../shared/types/3d.types/type-aliases/Orientation.md); `pos?`: [`XYZ`](../../../../shared/types/3d.types/type-aliases/XYZ.md); \}

Defined in: [src/3d/camera/camera.types.ts:72](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/camera.types.ts#L72)

Returns the active override pose or null when no overrides are applied.

#### Returns

`null` \| \{ `ori?`: [`Orientation`](../../../../shared/types/3d.types/type-aliases/Orientation.md); `pos?`: [`XYZ`](../../../../shared/types/3d.types/type-aliases/XYZ.md); \}

***

### removeOverride()

> **removeOverride**: (`id`) => [`CameraOverride`](../type-aliases/CameraOverride.md)[]

Defined in: [src/3d/camera/camera.types.ts:45](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/camera.types.ts#L45)

Removes a specific override by identifier (`id`) and returns the remaining overrides in the stack.

#### Parameters

##### id

`number`

#### Returns

[`CameraOverride`](../type-aliases/CameraOverride.md)[]

***

### setBase()

> **setBase**: (`settings`) => `void`

Defined in: [src/3d/camera/camera.types.ts:53](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/camera.types.ts#L53)

Sets the base camera pose and optional tilt constraints, with an optional animation flag.

#### Parameters

##### settings

[`BaseCameraSettings`](BaseCameraSettings.md)

#### Returns

`void`

***

### setBaseOri

> **setBaseOri**: `Setter`\<[`Orientation`](../../../../shared/types/3d.types/type-aliases/Orientation.md)\>

Defined in: [src/3d/camera/camera.types.ts:61](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/camera.types.ts#L61)

Setter for the base orientation signal.

***

### setBasePos

> **setBasePos**: `Setter`\<[`XYZ`](../../../../shared/types/3d.types/type-aliases/XYZ.md)\>

Defined in: [src/3d/camera/camera.types.ts:57](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/camera.types.ts#L57)

Setter for the base position signal.
