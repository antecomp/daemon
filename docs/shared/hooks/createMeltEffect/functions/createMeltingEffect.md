[**daemon**](../../../../README.md)

***

# Function: createMeltingEffect()

> **createMeltingEffect**(`initialScale?`): `object`

Defined in: [src/shared/hooks/createMeltEffect.tsx:32](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/shared/hooks/createMeltEffect.tsx#L32)

Creates a melting effect using an SVG filter with a displacement map.
This effect can be applied to UI elements and animated with a customizable scale and speed.

Note: This effect may cause memory leaks in Firefox (when applied to canvas) unless the SVG is removed from the DOM or the filter is disabled.

## Parameters

### initialScale?

`number` = `0`

The initial scale value for the displacement map.

## Returns

`object`

An object containing:

  `startMeltAnimation`: A function to start the melting animation. It accepts:
      - `pingPong` (optional): If true, animation goes initial -> max -> back to initial.
      - `maxScale` (optional): The maximum scale value for the animation.
      - `duration` (optional, default 1s): Duration of the animation.
  `filterID`: The unique ID of the SVG filter.

  `filterSVG`: The JSX element containing the SVG filter definition.

### filterID

> **filterID**: `string`

### filterSVG

> **filterSVG**: `Element`

### startMeltAnimation()

> **startMeltAnimation**: (`pingPong`, `maxScale`, `duration`) => `Promise`\<`void`\>

#### Parameters

##### pingPong

`boolean` = `false`

##### maxScale

`number` = `10`

##### duration

`number` = `1`

#### Returns

`Promise`\<`void`\>

## Example

```ts
const { startMeltAnimation, filterID, filterSVG } = createMeltingEffect(0);

// Apply the filter to an element
<div style={{ filter: `url(#${filterID})` }}>Melting Content</div>

// Trigger the animation
await startMeltAnimation(true, 10, 0.1);
```
