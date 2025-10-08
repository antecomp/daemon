[**daemon**](../../../../README.md)

***

# Function: default()

> **default**(`props`): `Element`

Defined in: [src/3d/camera/Freecam.tsx:36](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/Freecam.tsx#L36)

Freecam component provides a free-flying camera controller for 3D scenes.

Allows the user to move and rotate the camera using keyboard controls:
- Movement: W/A/S/D (forward/left/back/right), Q/Space (down), E/V (up)
- Rotation: I/K (pitch up/down), J/L (yaw left/right)
- Sprint: Hold Shift to increase movement and rotation speed
- Export: Press P to copy the current camera transform as a PlayerCam snippet to the clipboard

The camera's position and orientation are managed with reactive signals sent to PlayerCam (thus all features of PlayerCam are also enabled, you can test interactions.)

## Parameters

### props

`FreecamProps`

FreecamProps object

## Returns

`Element`
