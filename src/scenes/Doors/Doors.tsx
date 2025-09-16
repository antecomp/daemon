import Interactable from "@/3d/components/Interactable";
import applyDGShader from "@/3d/pipeline/dgRender";
import { Scene } from "lume";
import { createSignal, onMount } from "solid-js"

import door_l from "./assets/door_l.png"
import door_r from "./assets/door_r.png"
import createCameraController from "@/components/lume/playerCam/createCameraController";
import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import { useSceneMenu } from "@/app/shell/scene-menu/SceneMenuContext";
import { Vector2 } from "three";
import lerp from "@/shared/utils/lerp"
import Billboard from "@/3d/components/Billboard";

import friendTexture from "@/assets/artwork/characters/friend.png"
import { addLogMessage } from "@/app/shell/hud/EventLog";
import { setCurrentScene } from "@/app/shell/scene-container/SceneContainer";

export default function Doors() {
    let sceneRef!: Scene;
    let doorsOpenedBefore = false;

    const {cameraControlSignals} = createCameraController(
        [-50, -22, 354],
        {pitch: -2, yaw: 0},
        {maxPitch: 20, maxYaw: 20}
    )

    const {spawnMenu} = useSceneMenu();

    onMount(() => {
        requestAnimationFrame(() => applyDGShader(sceneRef))
    })

    const [isDoorOpen, setDoorOpen] = createSignal(false);

    const doorClickHandler = (_uv: any, mouse: Vector2) => {
        if (!isDoorOpen()) {
            spawnMenu(
                "Open the doors?", 
                [
                    {label: "Yes", onSelect: () => {setDoorOpen(true); if(!doorsOpenedBefore) {addLogMessage("The doors sqeak loudly as they swing open"); doorsOpenedBefore = true}}},
                    {label: "No"}
                ],
                mouse
            )
        } else {
            spawnMenu(
                "Close the doors?",
                [
                    {label: "Yes", onSelect: () => setDoorOpen(false)},
                    {label: "No"}
                ],
                mouse
            )
        }
    }

    return (
        <lume-scene
            webgl
            ref={sceneRef}
        >
            <PlayerCam
                {...cameraControlSignals()}
                sceneRef={sceneRef}
            />

            <Interactable onClick={doorClickHandler} showHoverBorder>
                <lume-plane
                    align-point="0.5 0.5"
                    mount-point="0.5 0.5"
                    origin="1 1"
                    size="100 250 10"
                    has="basic-material"
                    cast-shadow="false"
                    sidedness="double"
                    texture={door_r}

                    //@ts-expect-error
                    rotation={(x,y,z, _t, dt) => [
                        x, isDoorOpen() ? lerp(y, -90, 5 * (dt/1000)) : lerp(y, 0, 5 * (dt/1000)) , z
                    ]}
                />
            </Interactable>
            <Interactable onClick={doorClickHandler} showHoverBorder>
                <lume-plane
                    align-point="0.5 0.5"
                    mount-point="0.5 0.5"
                    origin="0 0"
                    size="100 250 10"
                    position="-100 0 0"
                    has="basic-material"
                    cast-shadow="false"
                    sidedness="double"
                    texture={door_l}

                    //@ts-expect-error
                    rotation={(x,y,z, _t, dt) => [
                        x, isDoorOpen() ? lerp(y, 90, 5 * (dt/1000)) : lerp(y, 0, 5 * (dt/1000)) , z
                    ]}
                />
            </Interactable>

            <Billboard
                interactions={[() => {console.log("egg"); setCurrentScene("Porch")}]}
                texture={friendTexture}
                scale={70}
                position="-50 0 -100"
            />
        </lume-scene>
    )
}