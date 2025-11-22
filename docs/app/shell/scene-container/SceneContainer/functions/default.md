[**daemon**](../../../../../README.md)

***

# Function: default()

> **default**(): `Element`

Defined in: [src/app/shell/scene-container/SceneContainer.tsx:54](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/app/shell/scene-container/SceneContainer.tsx#L54)

SceneContainer

Provides the main scene viewport wrapper and related state:
- Renders the current scene component within a framed container
- Chooses cursor based on interaction mode or ephemeral hover state
- Exposes a scene setter to update active lume scene.
- Wraps scene rendering with Error/Suspense boundaries for lazy loading of scene components.

## Returns

`Element`
