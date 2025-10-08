[**daemon**](../../../../../README.md)

***

# Interface: SceneFadeManagerAPI

Defined in: [src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx:98](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx#L98)

Public API for controlling the scene fade overlay.

## Properties

### currentSceneFadeState()

> **currentSceneFadeState**: () => `SceneFadeState`

Defined in: [src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx:102](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx#L102)

Gets the current fade state (OFF/FADING_OUT/FADED/FADING_IN).

#### Returns

`SceneFadeState`

***

### fadeSceneIn()

> **fadeSceneIn**: () => `Promise`\<`void`\>

Defined in: [src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx:106](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx#L106)

Fades the scene from FADED back to OFF (black screen back to scene). Resolves when complete.

#### Returns

`Promise`\<`void`\>

***

### fadeSceneOut()

> **fadeSceneOut**: () => `Promise`\<`void`\>

Defined in: [src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx:110](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx#L110)

Fades the scene from OFF to FADED (scene visible to black screen). Resolves when complete.

#### Returns

`Promise`\<`void`\>

***

### fadeTransition()

> **fadeTransition**: (`action`) => `Promise`\<`void`\>

Defined in: [src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx:114](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/app/shell/scene-fade-overlay/SceneFadeOverlay.tsx#L114)

Runs (sync or async) `action` between a fade-out and a fade-in.

#### Parameters

##### action

() => `any`

#### Returns

`Promise`\<`void`\>
