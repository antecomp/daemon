import { CameraController } from "@/3d/cam/cam.types";
import NavPlane, { NavPlaneData } from "./NavPlane";
import { createSignal, For, Show } from "solid-js";

interface NavNode extends Omit<NavPlaneData, 'camera'> {
    connected: string[]
}

export default function NavGraph(props: {
    graph: Record<string, NavNode>,
    initial: string,
    cam: CameraController
}) {
    const [current, setCurrent] = createSignal(props.initial);

    return (
        <>
            <For each={Object.entries(props.graph)}>
                {([key, data]) => 
                    <Show when={props.graph[current()]?.connected.includes(key)}>
                        <NavPlane
                            {...data}
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