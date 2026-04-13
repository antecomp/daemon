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
import { createDialogueWithCamOvr } from "@/3d/camera/dialogueCamera";
import { SceneFadeManager } from "@/app/shell/scene-fade-overlay/SceneFade";
import Interactable from "@/3d/components/Interactable";
import { useSceneMenu } from "@/app/shell/scene-menu/SceneMenuContext";
import { addLogMessage } from "@/app/shell/hud/EventLog";

//import dialogue_root from "@/tests/dialogues/intro_dia";

import { default as dialogue_root } from '@/tests/dialogues/x'
import { DialogueNode } from "@/core/dialogue/dialogueNode.types";
import Inventory from "@/core/inventory/inventory";
import applyRoomEnvironment from "@/3d/pipeline/applyRoomEnvironment";
import Freecam from "@/3d/camera/Freecam";

export default function GemmaBar() {
    let sceneRef!: Scene;
    let barRef!: any
    onMount(() => barRef && applyShadows(barRef));
    useDGShader(() => sceneRef);

    const {spawnMenu} = useSceneMenu();

    const {cameraControlSignals, cameraController} = createCameraController([-439, -55, 523], { yaw: 32, pitch: 3 }, {maxPitch: 20, maxYaw: 45})

    const [cacheOnTable, setShowCache] = createSignal(false);
    const [hasManDeparted, setManDeparted] = createSignal(false);

    // overrides no longer immediately activate, instead they're just prepped to be "committed". Makes it much easier to have 
    // little controllers like this to perform and release camera overrides as needed (without trying to pull the release out somewhere else)
    const showCacheCamera = cameraController.createOverride({pos: [-463, -67, 487], ori: {yaw: 15, pitch: 40}, anim: true});
    const manDialogueActions = {
        cacheHandoverAnimation() {
            setShowCache(true);
            showCacheCamera.commit();
        },
        returnCamera() {
            showCacheCamera.release();
        },
        departTheMan() {
            SceneFadeManager.fadeTransition(() => {
                setManDeparted(true);
                // release the camera early - yes this is legal to reference before manDialogue declared because JS moment. Something something variable vs value closure.
                manDialogue.ovrMgr.release();
            });
        }
    };

    const manDialogue = createDialogueWithCamOvr(
        cameraController,  // pass camera controller so it can move the camera for dialogue
        {pos: [-470, -64, 483], ori: { yaw: 8, pitch: 8 }, anim: true}, // camera settings to move the camera to on dialogue, also saying we should animate to that position.
        dialogue_root as DialogueNode, // root node of the dialogue tree
        {overlay: d_overlay, ctx: {actions: manDialogueActions}} // additional config for the dialogue, ctx is an object that dialogue nodes can reference to call in-scene scripted methods.
    );
    
    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcfsoft"
        >
            <lume-ambient-light id="ambientLight" intensity={0.25}/>
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

            {/* <Show when={!hasManDeparted()}>
                <Billboard
                    texture={suited_man}
                    position="-505 -45 390"
                    scale={62}
                    interactions={[
                        undefined, // no interaction for "touch"/interact
                        () => manDialogue.start(), // start dialogue for "chat" interaction
                        () => addLogMessage("A man in a suit. He has something I need.") // simple message for "observe" interaction
                    ]}
                />
            </Show> */}

            {/* <PlayerCam
                {...cameraControlSignals()}
                sceneRef={sceneRef}
            /> */}
            <Freecam sceneRef={sceneRef}/>

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
                                            Inventory.addItem('dv_mod');
                                            //sleep(1000).then(() => SceneFadeManager.fadeSceneOut())
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