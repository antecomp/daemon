[**daemon**](../../../../README.md)

***

# Function: default()

> **default**(`initialPos`, `initialOri`, `maxTilts`): `object`

Defined in: [src/3d/camera/createCameraController.ts:21](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/3d/camera/createCameraController.ts#L21)

Helper function for generating signals that can be passed to a playerCamera, alongside standard API functions for
modifying the camera state.

## Parameters

### initialPos

[`XYZ`](../../../../shared/types/3d.types/type-aliases/XYZ.md)

[number, number, number], XYZ original coordinates.

### initialOri

[`Orientation`](../../../../shared/types/3d.types/type-aliases/Orientation.md)

{yaw: number, pitch: number}, original orientation

### maxTilts

{maxYaw: number, maxPitch: number} - limit on head tilts/

#### maxPitch

`number`

#### maxYaw

`number`

## Returns

`object`

- cameraControlSignals - call and spread this inside PlayerCam. Provides properly reactive props to PlayerCam to trigger movement.

### cameraController

> **cameraController**: [`CameraController`](../../camera.types/interfaces/CameraController.md)

### cameraControlSignals

> **cameraControlSignals**: [`CameraControlSignals`](../../camera.types/type-aliases/CameraControlSignals.md)
