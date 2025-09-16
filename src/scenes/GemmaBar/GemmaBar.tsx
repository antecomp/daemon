import { Scene } from "lume";
import { onMount, Show, createSignal } from "solid-js";
import barX from "./models/kms.fbx?url"
import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import applyShadows from "@/core/lume/applyShadows";
import { useDGShader } from "@/core/lume/dgRender";

import starfield from "../shared_textures/starfield.png"
import createCameraController from "@/components/lume/playerCam/createCameraController";


import suited_man from "./assets/suited_figure.png";
import d_overlay from "./assets/d_overlay.png";

import cache_model from "./models/cache.fbx?url"

import Billboard from "@/components/lume/Billboard";
import dialogue_root from "@/tests/dialogues/intro_dia";
import { startDialogueWithCamOvr } from "@/components/lume/playerCam/dialogueCamera";
import { SceneFadeManager } from "@/views/main/ui/SceneFadeOverlay/SceneFadeOverlay";
import Interactable from "@/components/lume/Interactable";
import sleep from "@/utils/sleep";
import { useSceneMenu } from "@/views/main/ui/SceneMenu/SceneMenuContext";
import { addLogMessage } from "@/views/main/ui/EventLog";

export default function GemmaBar() {
    let sceneRef!: Scene;
    let barRef!: any
    onMount(() => barRef && applyShadows(barRef));
    useDGShader(() => sceneRef);

    const {spawnMenu} = useSceneMenu();

    const {cameraControlSignals, cameraController} = createCameraController([-439, -55, 523], { yaw: 32, pitch: 3 }, {maxPitch: 20, maxYaw: 45})

    const [cacheOnTable, setShowCache] = createSignal(false);
    const [hasManDeparted, setManDeparted] = createSignal(false);

    function cacheHandoverAnimation() {
        setShowCache(true);
        cameraController.setOverrides([-463, -67, 487], {yaw: 15, pitch: 40});
    }

    function returnCamera() {
        // these are the overrides set in startDialogueWithCamOvr. May be worth pulling out to unify!
        cameraController.setOverrides([-470, -64, 483], {yaw: 8, pitch: 8});
    }

    async function departTheMan() {
         SceneFadeManager.fadeTransition(() => {
            setManDeparted(true);
            cameraController.clearOverrides();
        });
    }
    
    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcfsoft"
        >
            <lume-ambient-light id="ambientLight" intensity={1.8}/>
            <lume-directional-light 
                id="whar"
                position="-794, -80, 448" 
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                intensity={2}
                cast-shadow="true" 
                shadow-map-height={4096} 
                shadow-map-width={4096}
                shadow-bias="-0.0001"
                // shadow-normal-bias="0.5"// no noticable change.
            />

            <lume-fbx-model
                id="bar"
                ref={barRef}
                src={barX}
                scale="0.1 0.1 0.1"
                mount-point="0.5 0.5"
                align-point="0.5 0.5"
            />

            <lume-sphere
                id="stars"
                texture={starfield}
                cast-shadow="false"
                receive-shadow="false"
                //@ts-ignore
                has="basic-material"
                sidedness="back"
                size="4000 4000 4000"
                align-point="0.5 0.5"
                mount-point="0.5 0.5 0.5"
                color="white"
            />

            <Show when={!hasManDeparted()}>
                <Billboard
                    texture={suited_man}
                    position="-505 -45 390"
                    scale={62}
                    interactions={[
                        undefined,
                        () => startDialogueWithCamOvr(
                            cameraController, 
                            [-470, -64, 483], 
                            { yaw: 8, pitch: 8 }, 
                            dialogue_root, 
                            true,
                            {
                                overlay: d_overlay,
                                ctx: {actions: {cacheHandoverAnimation, returnCamera, departTheMan}}
                            }
                        ),
                        () => addLogMessage("A man in a suit. He has something I need.")
                    ]}
                />
            </Show>

            <PlayerCam
                {...cameraControlSignals()}
                sceneRef={sceneRef}
            />

            <Show when={cacheOnTable()}>
                <Interactable
                    interactions={[
                        (_uv, mouse) => {
                            spawnMenu(
                                "Take the cache?",
                                [
                                    {
                                        label: "Yes",
                                        onSelect() {
                                            setShowCache(false);
                                            sleep(1000).then(() => SceneFadeManager.fadeSceneOut())
                                        },
                                    },
                                    {label: "No"}
                                ],
                                mouse
                            )

                        },
                        undefined,
                        () => addLogMessage("A data cache. I will need this.")
                    ]}
                >
                    <lume-fbx-model
                        id="cache"
                        position="-475 -26 455"
                        src={cache_model}
                        scale="0.07 0.07 0.07"
                        mount-point="0.5 0.5"
                        align-point="0.5 0.5"
                    />
                </Interactable>
            </Show>

        </lume-scene>
    )
}