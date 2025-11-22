[**daemon**](../../../../README.md)

***

# Function: default()

> **default**(`props`): `Element`

Defined in: [src/core/interaction/InteractionProvider.tsx:12](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/interaction/InteractionProvider.tsx#L12)

Provides interaction-mode state to the scene, exposing helpers for reading and mutating the active mode.
Modes: `InteractionMode.Interact` (default click actions), `InteractionMode.Chat` (start dialogue), `InteractionMode.Observe` (inspect/look).
Users can cycle modes in UI or press number keys 1-3 to jump directly.

## Parameters

### props

#### children?

`Element`

## Returns

`Element`
