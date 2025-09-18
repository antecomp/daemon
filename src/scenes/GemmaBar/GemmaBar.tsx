import { Scene } from "lume";
import { onMount, Show, createSignal } from "solid-js";
import barX from "./models/kms.fbx?url"
import PlayerCam from "@/3d/camera/PlayerCam";
import applyShadows from "@/3d/pipeline/applyShadows";
import { useDGShader } from "@/3d/pipeline/dgRender";

import starfield from "@/assets/3d/textures/starfield.png"
import createCameraController from "@/3d/camera/createCameraController";


import suited_man from "./assets/suited_figure.png";
import d_overlay from "./assets/d_overlay.png";

import cache_model from "./models/cache.fbx?url"

import Billboard from "@/3d/components/Billboard";
import dialogue_root from "@/tests/dialogues/intro_dia";
import { startDialogueWithCamOvr } from "@/3d/camera/dialogueCamera";
import { SceneFadeManager } from "@/app/shell/scene-fade-overlay/SceneFadeOverlay";
import Interactable from "@/3d/components/Interactable";
import sleep from "@/shared/utils/sleep";
import { useSceneMenu } from "@/app/shell/scene-menu/SceneMenuContext";
import { addLogMessage } from "@/app/shell/hud/EventLog";

export default function GemmaBar() {
    let sceneRef!: Scene;
    let barRef!: any
    onMount(() => barRef && applyShadows(barRef));
    useDGShader(() => sceneRef);

    const {spawnMenu} = useSceneMenu();

    const {cameraControlSignals, cameraController} = createCameraController([-439, -55, 523], { yaw: 32, pitch: 3 }, {maxPitch: 20, maxYaw: 45})

    const [cacheOnTable, setShowCache] = createSignal(false);
    const [hasManDeparted, setManDeparted] = createSignal(false);

    const dialogueActions = {
        cacheHandoverAnimation() {
            setShowCache(true);
            const {release} = cameraController.requestOverride({pos: [-463, -67, 487], ori: {yaw: 15, pitch: 40}, anim: true});
            // I like the elegance of this little reassignment here (dont need to track anything more), but could be fragile.
            this.returnCamera = () => release(true);
        },
        returnCamera: () => {/*noop unless cacheHandoverAnimation runs first and reassigns me*/},
        departTheMan() {
                SceneFadeManager.fadeTransition(() => {
                    setManDeparted(true);
                    cameraController.clearOverrides();
                });
        }
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
                                ctx: {actions: dialogueActions}
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