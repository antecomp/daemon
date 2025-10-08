[**daemon**](../../../../README.md)

***

# Function: createDialogueWithCamOvr()

> **createDialogueWithCamOvr**(`cameraController`, `ovr`, `dialogueRoot`, `dialogueOptions?`): `object`

Defined in: [src/3d/camera/dialogueCamera.ts:20](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/camera/dialogueCamera.ts#L20)

Prepares a dialogue sequence that uses a deferred camera override.

Creates an override handle with the provided camera settings, then exposes helpers
for starting the dialogue (committing the override) and manually releasing the camera.
The override is automatically released when the dialogue promise settles, even if
the dialogue throws.

## Parameters

### cameraController

[`CameraController`](../../camera.types/interfaces/CameraController.md)

Camera controller that manages override state.

### ovr

[`CameraSettings`](../../camera.types/interfaces/CameraSettings.md)

Camera position/orientation/animation to apply while the dialogue runs.

### dialogueRoot

[`DialogueNode`](../../../../core/dialogue/dialogueNode.types/type-aliases/DialogueNode.md)

Root node of the dialogue that will be started on commit.

### dialogueOptions?

[`StartDialogueOptions`](../../../../core/dialogue/dialogueService/type-aliases/StartDialogueOptions.md)

Optional options forwarded to the dialogue service.

## Returns

`object`

An object containing `start`, which commits the override and launches the dialogue,
         and `ovrMgr`, which exposes the underlying override handle (commit/release/id) to be used for advanced mid-dialogue camera control.

### ovrMgr

> **ovrMgr**: `object`

#### ovrMgr.id

> **id**: `number`

#### ovrMgr.commit()

> **commit**(`anim?`): `void`

##### Parameters

###### anim?

`boolean`

##### Returns

`void`

#### ovrMgr.release()

> **release**(`anim?`): `void`

##### Parameters

###### anim?

`boolean`

##### Returns

`void`

### start()

> **start**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
