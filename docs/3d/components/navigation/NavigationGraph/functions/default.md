[**daemon**](../../../../../README.md)

***

# Function: default()

> **default**(`props`): `Element`

Defined in: [src/3d/components/navigation/NavigationGraph.tsx:22](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/3d/components/navigation/NavigationGraph.tsx#L22)

NavigationPlanes represent interactable areas that teleport the player by setting the camera base position.
This component creates a connected graph of NavigationPlanes and conditionally shows only the planes
that are directly connected to the current plane (player position).

## Parameters

### props

The properties for the NavigationGraph component.

#### cameraController

[`CameraController`](../../../../camera/camera.types/interfaces/CameraController.md)

The camera controller instance to be passed to each `NavigationPlane`.

The component maintains the current node in state and renders a `NavigationPlane` for each connected node.
When a plane is clicked, it updates the current node and invokes the optional `onClick` handler of the node.

#### graph

`Record`\<`string`, `NavigationNode`\>

A record mapping node keys to `NavigationNode` objects, representing the navigation graph.

#### initial

`string`

The key of the initial node to display.

## Returns

`Element`
