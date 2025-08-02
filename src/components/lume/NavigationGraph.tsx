import { createSignal, For, Show } from "solid-js";
import NavigationPlane, { NavigationPlaneData } from "./NavigationPlane";
import { CameraController } from "./playerCam/createCameraController";

interface NavigationNode extends Omit<NavigationPlaneData, "cameraController"> {
    connected: string[]
}

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