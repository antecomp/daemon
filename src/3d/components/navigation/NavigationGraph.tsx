import { createSignal, For, Show } from "solid-js";
import NavigationPlane, { NavigationPlaneData } from "./NavigationPlane";
import { CameraController } from "@/3d/camera/camera.types";

/** TODO DOCUMENT */
interface NavigationNode extends Omit<NavigationPlaneData, "cameraController"> {
    connected: string[]
}

/**
 * NavigationPlanes represent interactable areas that teleport the player by setting the camera base position.
 * This component creates a connected graph of NavigationPlanes and conditionally shows only the planes
 * that are directly connected to the current plane (player position).
 *
 * @param props - The properties for the NavigationGraph component.
 * @param props.graph - A record mapping node keys to `NavigationNode` objects, representing the navigation graph.
 * @param props.initial - The key of the initial node to display.
 * @param props.cameraController - The camera controller instance to be passed to each `NavigationPlane`.
 *
 * The component maintains the current node in state and renders a `NavigationPlane` for each connected node.
 * When a plane is clicked, it updates the current node and invokes the optional `onClick` handler of the node.
 */
export default function NavigationGraph(props: {
    graph: Record<string, NavigationNode>,
    initial: string,
    cameraController: CameraController
}) {
    const [current, setCurrent] = createSignal(props.initial);

    return(
        <>
            <For each={Object.entries(props.graph)}>
                {([key, data]) => 
                    <Show when={props.graph[current()]?.connected.includes(key)}>
                        <NavigationPlane
                            {...data}
                            cameraController={props.cameraController}
                            onClick={() => {
                                setCurrent(key)
                                data.onClick?.()
                            }}
                        />
                    </Show>
                }
            </For>
        </>
    )
}