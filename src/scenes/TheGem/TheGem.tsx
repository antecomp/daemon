import { Scene } from "lume";
import { createSignal, Show } from 'solid-js';
import bar_model from './assets/hate.glb?url'
import PlayerCam from "@/3d/camera/PlayerCam";
import Freecam from "@/3d/camera/Freecam";
import Interactable from "@/3d/components/Interactable";
import { useDGShader } from "@/3d/pipeline/dgRender";
import Billboard from "@/3d/components/Billboard";
import man_sprite from './assets/placeholder_man.png'

import starfield from "@/assets/3d/textures/starfield.png"
import createCameraController from "@/3d/camera/createCameraController";
import { createDialogueWithCamOvr } from "@/3d/camera/dialogueCamera";

import { default as dialogue_root } from './data/man_dialogue';
import dia_overlay from '@/assets/ui/misc/dia_dither.png';
import { SceneFadeManager } from "@/app/shell/scene-fade-overlay/SceneFadeOverlay";
import { addLogMessage } from "@/app/shell/hud/EventLog";

export default function TheGem() {
    let sceneRef!: Scene;

    useDGShader(() => sceneRef);

    const { cameraControlSignals, cameraController } = createCameraController(
        [-1028, -135, 667],
        { yaw: 30, pitch: 3 },
        { maxPitch: 20, maxYaw: 60 }
    );

    const [hasManDeparted, setManDeparted] = createSignal(false);

    const dialogueActions = {
        cacheHandoverAnimation() {
            console.log('todo');
        },
        returnCamera() {
            console.log('todo');
        },
        departTheMan() {
            SceneFadeManager.fadeTransition(() => {
                setManDeparted(true);
                manDialogue.ovrMgr.release(); // Release camera early.
            })
        }
    }

    const manDialogue = createDialogueWithCamOvr(
        cameraController,
        { pos: [-1061, -138, 636], ori: { yaw: 6, pitch: 0 }, anim: true },
        dialogue_root,
        { overlay: dia_overlay, ctx: { actions: dialogueActions } }
    )

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcfsoft"
        >

            <lume-sphere
                id="stars"
                texture={starfield}
                cast-shadow="false"
                receive-shadow="false"
                //@ts-ignore
                has="basic-material"
                sidedness="back"
                size="10000 10000 10000"
                align-point="0.5 0.5"
                mount-point="0.5 0.5 0.5"
                color="white"
                rotation="0 95 0"
            />


            <lume-ambient-light id="ambientLight" intensity={6} />
            <lume-gltf-model
                src={bar_model}
                id="bar"
                scale="100 100 100"
                align-point="0.5 0.5"
            />

            {/* <Freecam sceneRef={sceneRef} initialPos={[-1045, -186, 739]}/> */}
            <PlayerCam
                {...cameraControlSignals()}
                sceneRef={sceneRef}
            />

            <Show when={!hasManDeparted()}>
                <Billboard
                    texture={man_sprite}
                    position={"-1110 -118 515"}
                    scale={100}
                    interactions={[
                        undefined, // no action for interact.
                        () => manDialogue.start(),
                        () => addLogMessage("A man in a suit. He has something I need.") // simple message for "observe" interaction
                    ]}
                />
            </Show>
        </lume-scene>
    )
}