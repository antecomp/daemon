import Interactable from "@/3d/components/Interactable";
import PlayerCam from "@/3d/camera/PlayerCam";
import { useDGShader } from "@/3d/pipeline/dgRender";
import lerp from "@/shared/utils/lerp";
import sleep from "@/shared/utils/sleep";
import { addLogMessage } from "@/app/shell/hud/EventLog";
import { useSceneMenu } from "@/app/shell/scene-menu/SceneMenuContext";
import { GltfModel, Scene } from "lume"
import { createSignal, onMount } from "solid-js"

import elevator_buttons from './models/elevator_buttons.png'
import elevator_buttons_lit from './models/elevator_buttons_white.png'
import { SceneFadeManager } from "@/app/shell/scene-fade-overlay/SceneFade";
import { setCurrentScene } from "@/app/shell/scene-container/SceneContainer";
import applyShadows from "@/3d/pipeline/applyShadows";
import { playTextOverlay } from "@/features/text-overlay/TextOverlay";

import opening_textscene from "./data/opening_textscene"

import elev_frame from './models/elevator_frame.glb';
import door_l from './models/door_r.glb';
import door_r from './models/door_l.glb';
import attachToConsole from "@/devtools/attachToConsole";
import { interactionCB } from "@/core/interaction/interactable.types";


export default function Elevator() {
    let sceneRef!: Scene
    let elevBodyRef!: GltfModel
    let doorLRef!: GltfModel
    let doorRRef!: GltfModel
    useDGShader(() => sceneRef)

    onMount(() => {
        elevBodyRef && applyShadows(elevBodyRef, true, false);
        doorLRef && applyShadows(doorLRef, true, false);
        doorRRef && applyShadows(doorRRef, true, false);
    });

    const { spawnMenu } = useSceneMenu();

    const [isDoorOpen, setIsDoorOpen] = createSignal(false);
    const [isElevatorCalled, setIsElevatorCalled] = createSignal(false);

    const callElevator: interactionCB = (_uv, mouse) => {
        if (!isElevatorCalled()) {
            spawnMenu(
                "Call the elevator?",
                [
                    {
                        label: "Yes",
                        onSelect() {
                            setIsElevatorCalled(true);
                            sleep(3000).then(() => setIsDoorOpen(true)).then(async () => {
                                await sleep(5000);
                                await SceneFadeManager.fadeSceneOut();
                                setCurrentScene("TheGem");
                                await playTextOverlay(opening_textscene);
                                SceneFadeManager.fadeSceneIn();
                            })
                        }
                    },
                    { label: "No" }
                ],
                mouse
            )
        }
    }

    attachToConsole(setIsDoorOpen, "SIDO");

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcfsoft"
            perspective="800"
            shadowmap-type="pcfsoft"
        >
            <PlayerCam sceneRef={sceneRef} basePos={[60, -15, 0]} baseOri={{yaw: 90, pitch: 0}} maxPitch={10} maxYaw={20}/>
            <lume-gltf-model
                ref={elevBodyRef}
                src={elev_frame}
                align-point="0.5 0.5"
                scale="10 10 10"
            />
            <lume-gltf-model
                id="doorl"
                src={door_l}
                ref={doorLRef}
                align-point="0.5 0.5"
                scale="10 10 10"
                // position="0 0 -9.75"
                //@ts-expect-error
                position={(_x, _y, z, _t, dt) => [
                    0, 0, isDoorOpen() ? lerp(z, -9.75, 1 * dt / 1000) : 0
                ]}
            />
            <lume-gltf-model
                ref={doorRRef}
                id="doorr"
                src={door_r}
                align-point="0.5 0.5"
                scale="10 10 10"
                // position="0 0 9.75"
                //@ts-expect-error
                position={(_x, _y, z, _t, dt) => [
                    0, 0, isDoorOpen() ? lerp(z, 9.75, 1 * dt / 1000) : 0
                ]}
            />


            <lume-point-light
                position="-17 -25 0"
                align-point="0.5 0.5"
                color="white"
                intensity="100"
            />

            <lume-plane
                size="150 100 0"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                rotation="90 0 0"
                color='white'
            />

            <Interactable
                interactions={[
                    callElevator,
                    () => addLogMessage("I should press the button, not talk to it."),
                    () => addLogMessage("These are buttons to call the elevator.")
                ]}
                showHoverBorder={!isElevatorCalled()}
            >
                <lume-plane
                    id="buttons"
                    texture={isElevatorCalled() ? elevator_buttons_lit : elevator_buttons}
                    receive-shadow="false"
                    sidedness="double"
                    size="2.048 3.808 1"
                    rotation="0 90 0"
                    position="3 -15 12"
                    align-point="0.5 0.5"
                    alpha-test="0.1"

                    //@ts-expect-error
                    has="basic-material"
                />
            </Interactable>

        </lume-scene>
    )
}