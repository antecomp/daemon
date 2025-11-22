[**daemon**](../../../../README.md)

***

# Function: default()

> **default**(`props`): `Element`

Defined in: [src/3d/components/Billboard.tsx:75](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/3d/components/Billboard.tsx#L75)

Yaw Only billboard as a LUME plane.
The billboard displays a texture (from input `texture` asseturl) at some `scale` (scale = width, height scaled automatically to retain aspect ratio), 
billboard handle interactions such as clicks and hovers or specific InteractionMode interactions.

Billboard is automatically alpha masked such that mouse events only fire on opaque parts of the texture.

## Parameters

### props

`BillboardProps`

## Returns

`Element`

## Remark

the sprite still consumes the raycast, meaning that interactions behind the texture plane will be blocked!

## Remarks

- The component uses an alpha mask automatically generated from the texture to determine the opaque regions.
- The billboard automatically adjusts its size based on the aspect ratio of the texture.
- The component ensures the billboard always faces the camera by computing its rotation dynamically.
- The `opacity` property is set to a very high value close to 1 to avoid rendering artifacts.

## Example

```tsx
<Billboard
  texture="path/to/texture.png"
  scale={2}
  position={[0, 1, 0]}
  onClick={(uv) => console.log('Clicked at UV:', uv)}
  onHover={(uv) => console.log('Hovered at UV:', uv)}
  interactions={{
    chat: (uv) => DialogueService.startDialogue(...),
  }}
/>
```
