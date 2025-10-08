[**daemon**](../../../../README.md)

***

# Function: default()

> **default**(`props`): `Element`

Defined in: [src/features/text-overlay/TextOverlay.tsx:19](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/features/text-overlay/TextOverlay.tsx#L19)

Renders a full-screen text overlay that typewrites the provided sequence and
dismisses itself once the final line finishes.

## Parameters

### props

#### id?

`string`

#### onComplete?

() => `void`

#### sequence

`TextOverlayLine`[]

## Returns

`Element`
