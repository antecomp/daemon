import HeadCam from "@/components/lume/HeadCam";
import mapobj from './models/map.obj?url';
import mapmtl from './models/map.mtl?url';
import { Scene } from "lume";
import {onMount, createSignal, Show} from "solid-js"
import applyShader from "@/core/applyShader";
import starfield from "../shared_textures/starfield.png"
import viyaTexture from "@/assets/artwork/characters/viya.png"
import friendTexture from "@/assets/artwork/characters/friend.png"
import YBillboard from "@/components/lume/YBillboard";
import { addLogMessage } from "@/components/ui/event-log/EventLog";
import generateDialogue from "@/tests/generateDialogue";
import { DialogueService } from "@/core/dialogue/dialogueManager";
import viya_dia_bg from '@/assets/artwork/dialogue_bgs/terrible_test.png'
import root from "@/dialogues/rabbits/porchRabbit";
import WadsCam from "@/components/lume/wadscam";

export const [showRabbit, setShowRabbit] = createSignal(true);

export default function Porch() {
    let sceneRef: Scene | undefined;

    onMount(() => {
        if(sceneRef) {
            requestAnimationFrame(() => {
                applyShader(sceneRef);
            });
        }
    })

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf" 
            perspective="800"
            shadowmap-type="pcf"
        >

            <HeadCam
                position="-230 -317 128"
                baseOrientation={{yaw: 290, pitch: 0}}
                maxPitch={25}
                maxYaw={45}
            />

            <lume-ambient-light intensity={4} />

            <lume-point-light 
                intensity="6000" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -356 200" 
                color="white"
                cast-shadow="true"
                shadow-mapSize={{ x: 1024, y: 1024 }} // Higher values = sharper shadows
                // shadow-bias={-0.005} // Reduce shadow acne
            >
                {/* <lume-sphere size="20" 
                    cast-shadow="true" 
                    receive-shadow="false" 
                    color="#ff006e" 
                    //@ts-ignore
                    has="basic-material"
                ></lume-sphere> */}
            </lume-point-light>

            <lume-point-light 
                intensity="6000" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -356 0" 
                color="white"
                cast-shadow="true"
                shadow-mapSize={{ x: 1024, y: 1024 }} // Higher values = sharper shadows
                // shadow-bias={-0.005} // Reduce shadow acne
            >
                {/* <lume-sphere size="20" 
                    cast-shadow="true" 
                    receive-shadow="false" 
                    color="#ff006e" 
                    //@ts-ignore
                    has="basic-material"
                ></lume-sphere> */}
            </lume-point-light>

            {/* <lume-directional-light
                intensity="120" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -128 100" 
                color="white"
                cast-shadow="true"
            /> */}

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
            ></lume-sphere>

            <YBillboard
                    texture={viyaTexture}
                    size={225}
                    position="-90 -240 0"
                    interactions={[
                        () => addLogMessage(`She doesn't take too kindly to your prodding.`, 'red'),
                        // () => {
                        //     const hijackBody = hijackCamera(sceneRef);
                        //     setTimeout(() => {
                        //         hijackBody?.remove();
                        //     }, 1000)
                        // },
                        () => DialogueService.startDialogue(
                            generateDialogue(), 
                            {
                                // overlay: viya_dia_bg, 
                                canCloseDialogueEarly: true,
                                cameraHijack: {
                                    sceneRef,
                                    targetPosition: "122 -287 151",
                                    targetOrientation: {yaw: 41, pitch: 2}
                                }
                            }
                        ),
                        () => addLogMessage(`She is smoking a cigarette.`)
                    ]}
            />
            <Show when={showRabbit()}>
                <YBillboard
                        texture={friendTexture}
                        size={50}
                        position="-70 -266 200"
                        interactions={[
                            () => addLogMessage(`Best not to pet the rabbit. He is in a precarious spot.`),
                            //() => addLogMessage(`The rabbit doesn't seem enthused by your conversational efforts.`),
                            () => DialogueService.startDialogue(root),
                            () => addLogMessage(`WARNING: CLASS 4B ENTITY. CEASE OBSERVATION IMMEDIATELY.`, 'yellow')
                        ]}
                />
            </Show>
            <lume-obj-model
                id="map"
                obj={mapobj}
                mtl={mapmtl}
                recieve-shadow="true"
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            ></lume-obj-model>

        </lume-scene>
    )
}