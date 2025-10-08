[**daemon**](../../../../README.md)

***

# Function: default()

> **default**(`props`): `Element`

Defined in: [src/3d/camera/PlayerCam.tsx:59](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/PlayerCam.tsx#L59)

The main camera system for the game. Has an initial "base" setting for the point-and-click player camera,
which runs and performs all the raycast/interaction logic + head movement on mouse move. This camera can then 
be temporarily overridden (disabling the interaction/mouse logic) by setting override position/orientation paramaters.
These override params can be used for cinematic sequences, in-dialogue VN cameras, etc.

## Parameters

### props

#### animate?

`boolean`

Whether the camera's movements should be animated (lerp from current value to new base/override values). Defaults to `false`.

#### baseOri

[`Orientation`](../../../../shared/types/3d.types/type-aliases/Orientation.md)

The base orientation of the camera. {yaw: #, pitch: #}

#### basePos

[`XYZ`](../../../../shared/types/3d.types/type-aliases/XYZ.md)

The base position of the camera in the 3D space. [x,y,z]

#### maxPitch

`number`

The maximum pitch offset for mouse movement. As in, how far can we tilt our head up/down from base ori.

#### maxYaw

`number`

The maximum yaw offset for mouse movement. As in, how far can we look left/right from base ori

#### overrideOri?

[`Orientation`](../../../../shared/types/3d.types/type-aliases/Orientation.md)

An optional override for the camera's orientation.

#### overridePos?

[`XYZ`](../../../../shared/types/3d.types/type-aliases/XYZ.md)

An optional override for the camera's position.

#### sceneRef

`Scene`

A reference to the 3D scene containing the camera, used to attach event listeners.

#### speed?

`number`

The speed of the camera's animation. Defaults to `10`.

## Returns

`Element`

A JSX element representing the camera system.

## Remarks

- The camera uses raycasting to detect hover and click interactions with objects in the scene.
- Mouse movements adjust the camera's yaw and pitch within the specified limits.
- The camera's position and orientation can be overridden programmatically.
- Cleanup is performed on component unmount to remove event listeners.
- The camera system live-reads the value of input props, meaning transitions and updates are performed simply
- by updating the props (typically by using signals for prop inputs and changing those as needed.)
