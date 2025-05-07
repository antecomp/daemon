import mapobj from './models/map.obj';
import mapmtl from './models/map.mtl';
import { ObjModel, Scene } from "lume";
import {onMount, createSignal, Show,} from "solid-js"
import starfield from "../shared_textures/starfield.png"
import viyaTexture from "@/assets/artwork/characters/viya.png"
import friendTexture from "@/assets/artwork/characters/friend.png"
import { addLogMessage } from "@/views/main/ui/EventLog";
import { DialogueService } from "@/core/dialogue/dialogueService";
import rabbit_root from "@/scenes/Porch/dialogues/porchRabbit";
import {default as viya_root} from "./dialogues/viya_dialogue"
import applyShadows from "@/core/lume/applyShadows";
import Billboard from "@/components/lume/Billboard";
import applyDGShader from '@/core/lume/dgRender';
import PlayerCam from '@/components/lume/playerCam/PlayerCam';
import createCameraController from '@/components/lume/playerCam/createCameraController';
import { startDialogueWithCamOvr } from '@/components/lume/playerCam/dialogueCamera';
import { createReactiveAmbientAudio } from '@/hooks/createAmbientAudio';
import { createMutable } from 'solid-js/store';

export default function Porch() {
    let sceneRef: Scene | undefined;

    const [showRabbit, setShowRabbit] = createSignal(true);

    const {cameraControlSignals, cameraController} = createCameraController(
        [-230, -317, 128],
        {yaw: -72, pitch: 0},
        {maxYaw: 45, maxPitch: 30}
    );

    (window as any).PRCH_CM = cameraController;

    let mapRef: ObjModel | undefined;

    onMount(() => {
        if(sceneRef) {
            requestAnimationFrame(() => {
                applyDGShader(sceneRef);
            });
        }
        if(mapRef) {
            applyShadows(mapRef);
        }
    });

    const test = createMutable({src: "PWL/pw_celesta_meloD.mp3"})
    createReactiveAmbientAudio(test);
    setTimeout(() => { // Will crossfade between tracks
        test.src = "PWL/crystalline_loop.mp3"
    }, 50000);

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf" 
            perspective="800"
            shadowmap-type="pcf"
        >

            <PlayerCam
                {...cameraControlSignals()}
                sceneRef={sceneRef!}
            />

            <lume-ambient-light intensity={4} />

            <lume-point-light 
                intensity="5500" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -356 200" 
                color="white"
                cast-shadow="true"
            />

            <lume-point-light 
                intensity="5500" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -356 0" 
                color="white"
                cast-shadow="true"
            />

            <lume-sphere
                id="stars"
                texture={starfield}
                receive-shadow="false"
                //@ts-ignore
                has="basic-material"
                sidedness="back"
                size="6000 6000 6000"
                mount-point="0.5 0.5 0.5"
                color="white"
            />

            <Billboard
                texture={viyaTexture}
                position="-90 -240 0"
                scale={225}
                interactions={[
                    () => addLogMessage(`She doesn't take too kindly to your prodding.`, 'red'),
                    () => {
                        startDialogueWithCamOvr(
                            cameraController,
                            [-183, -322, 34],
                            {yaw: -84, pitch: 0},
                            viya_root,
                            true,
                            {canCloseDialogueEarly: true}
                        ).then(() => console.log("Viya dialogue done!"))
                    },
                    () => addLogMessage(`She is smoking a cigarette.`)
            ]}
            />

            <Show when={showRabbit()}>
                <Billboard
                        texture={friendTexture}
                        scale={50}
                        position="-70 -266 200"
                        interactions={[
                            () => addLogMessage(`Best not to pet the rabbit. He is in a precarious spot.`),
                            () => {
                                DialogueService.startDialogue(rabbit_root, {ctx: {setShowRabbit}}).then(
                                    () => console.log("Rabbit dialogue complete")
                                )
                            },
                            //() => addLogMessage(`WARNING: CLASS 4B ENTITY. CEASE OBSERVATION IMMEDIATELY.`, 'yellow')
                            (uv, mouse) => addLogMessage(`Clicked at ${mouse.toArray().toString()}. For the rabbit this is ${uv.toArray()}`)
                        ]}
                />
            </Show>
            <lume-obj-model
                id="map"
                obj={mapobj}
                mtl={mapmtl}
                ref={mapRef}
                recieve-shadow="true"
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            />

        </lume-scene>
    )
}